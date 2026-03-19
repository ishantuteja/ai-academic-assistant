import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv

# Load secret environment variables (like API keys) from a .env file
load_dotenv()

# Serve static files from the current directory
app = Flask(__name__, static_folder='.', static_url_path='')
# Enable CORS so our HTML frontend can talk to this API
CORS(app)

@app.route('/')
def home():
    return app.send_static_file('index.html')

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Global state to hold the vector store in memory 
# (In a real production app, this would connect to a persistent database)
vector_store = None

def get_gemini_api_key():
    return os.environ.get("GEMINI_API_KEY")

@app.route('/api/upload', methods=['POST'])
def upload_file():
    global vector_store
    
    if not get_gemini_api_key():
        return jsonify({"error": "GEMINI_API_KEY is not set. Please add it to your .env file."}), 400

    if 'files' not in request.files:
        return jsonify({"error": "No file part"}), 400
        
    files = request.files.getlist('files')
    if not files or files[0].filename == '':
        return jsonify({"error": "No selected file"}), 400

    documents = []
    
    # Save files to disk and parse them
    for file in files:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        try:
            # We only extract PDFs for this prototype
            if filename.lower().endswith('.pdf'):
                loader = PyPDFLoader(filepath)
                documents.extend(loader.load())
        except Exception as e:
            print(f"Error loading {filename}: {e}")
            
    if not documents:
        return jsonify({"error": "No valid PDF documents were uploaded or parsed."}), 400
        
    # Split text into chunks that the LLM can process easily
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    splits = text_splitter.split_documents(documents)
    
    if not splits:
        return jsonify({"error": "No readable text could be extracted! This PDF might be a scanned image or empty."}), 400
    
    # Create text embeddings and store them in the FAISS vector database
    try:
        embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
        if vector_store is None:
            vector_store = FAISS.from_documents(splits, embeddings)
        else:
            vector_store.add_documents(splits)
            
        return jsonify({"success": True, "message": f"Successfully indexed {len(files)} file(s)."})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    global vector_store
    
    if not get_gemini_api_key():
        return jsonify({"error": "GEMINI_API_KEY is not set. Please add it to your .env file."}), 400

    data = request.json
    question = data.get('message')
    
    if not question:
        return jsonify({"error": "No message provided"}), 400
        
    if vector_store is None:
        return jsonify({"error": "Please upload a document before asking questions!"}), 400
        
    try:
        # Initialize Google's Gemini Flash model for fast generation
        llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.3)
        retriever = vector_store.as_retriever(search_kwargs={"k": 4})
        
        # Manually retrieve context
        docs = retriever.invoke(question)
        context = "\n\n".join([doc.page_content for doc in docs])
        
        # Construct and invoke prompt directly
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a helpful AI academic assistant. Use the following context extracted from the user's uploaded documents to answer their question. If the answer is not in the context, clearly state that you don't know based on the provided documents. Try to provide structured, clear answers (use markdown formatting like bolding or bullet points where helpful).\n\nContext:\n{context}"),
            ("user", "{input}")
        ])
        
        chain = prompt | llm
        response = chain.invoke({"context": context, "input": question})
        
        return jsonify({"response": response.content})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Starting AI Academic Assistant Backend...")
    print("API running on http://127.0.0.1:5000")
    app.run(debug=True, port=5000)

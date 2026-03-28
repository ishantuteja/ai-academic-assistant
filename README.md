# AI Academic Assistant

> Upload your PDFs and ask questions — powered by Google Gemini and a RAG pipeline.

A full-stack web application that lets you upload academic documents (PDFs) and chat with them using a Retrieval-Augmented Generation (RAG) pipeline. Built with Flask on the backend and a clean, responsive UI on the frontend.

---

## Features

- **PDF Ingestion** — Upload one or multiple PDF files at once
- **Semantic Search** — Documents are chunked, embedded, and indexed into a FAISS vector store
- **AI-Powered Q&A** — Ask any question and get context-aware answers from your documents using Google Gemini
- **Conversational UI** — Clean chat interface with Markdown-rendered responses
- **Secure by default** — API keys stay in `.env`, uploads handled safely

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Python, Flask, Flask-CORS |
| **AI / LLM** | Google Gemini 2.5 Flash (`gemini-2.5-flash`) |
| **Embeddings** | Google Generative AI Embeddings (`gemini-embedding-001`) |
| **Vector Store** | FAISS (in-memory) |
| **RAG Framework** | LangChain (`langchain`, `langchain-community`, `langchain-google-genai`) |
| **PDF Parsing** | PyPDF via LangChain |
| **Frontend** | HTML, CSS, Vanilla JavaScript |

---

## Getting Started

### Prerequisites

- Python 3.9+
- A [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/ai-academic-assistant.git
cd ai-academic-assistant
```

### 2. Create and activate a virtual environment

```bash
python3 -m venv venv
source venv/bin/activate      # macOS / Linux
venv\Scripts\activate         # Windows
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Set up your API key

Create a `.env` file in the root directory:

```
GEMINI_API_KEY=your_api_key_here
```

> Never commit your `.env` file. It is already listed in `.gitignore`.

### 5. Run the app

```bash
python app.py
```

Open your browser and go to **http://127.0.0.1:5000**

---

## Project Structure

```
ai-academic-assistant/
├── app.py              # Flask backend — API routes & RAG pipeline
├── index.html          # Frontend UI
├── style.css           # Styling
├── script.js           # Frontend logic
├── requirements.txt    # Python dependencies
├── .env                # API keys (not committed)
├── .gitignore
└── uploads/            # Temporary PDF storage (not committed)
```

---

## How It Works

```
User uploads PDF
      ↓
PyPDF extracts text
      ↓
Text split into chunks (1000 chars, 200 overlap)
      ↓
Chunks embedded via Gemini Embeddings
      ↓
Embeddings stored in FAISS vector store
      ↓
User asks a question
      ↓
Top-4 relevant chunks retrieved
      ↓
Gemini Flash generates a grounded answer
      ↓
Response displayed in chat UI
```

---

## Dependencies

```
flask
flask-cors
langchain
langchain-community
langchain-google-genai
pypdf
faiss-cpu
python-dotenv
tiktoken
```

Install all with:
```bash
pip install -r requirements.txt
```

---

## Limitations

- The vector store is **in-memory only** — it resets when the server restarts
- Only **PDF** files are currently supported
- Scanned/image-only PDFs will not be readable (no OCR support)

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Author

**Ishan Tuteja**  
Built as a document assistant project using LangChain and Google Gemini.

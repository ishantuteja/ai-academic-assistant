

from pypdf import PdfReader
import os

def extract_text_from_pdf(pdf_path: str) -> str:
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        text += (page.extract_text() or "") + "\n"
    return text

def load_documents(data_dir: str):
    docs = []
    for file in os.listdir(data_dir):
        if file.endswith(".pdf"):
            path = os.path.join(data_dir, file)
            docs.append({"source": file, "text": extract_text_from_pdf(path)})
    return docs

if __name__ == "__main__":
    docs = load_documents("data/raw")
    print(f"Loaded {len(docs)} PDFs")
    if docs:
        print("Sample:", docs[0]["text"][:500])

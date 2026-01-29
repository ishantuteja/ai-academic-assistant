# AI-Powered Academic Assistant (LLM + RAG)

This project is an AI-based academic assistant that allows students to chat with course syllabus, notes and PDFs.
It uses:
- LLM for response generation
- Vector Database (FAISS) for semantic retrieval
- RAG (Retrieval-Augmented Generation) to connect LLM with retrieved content

## Features (Planned)
- Upload course PDFs / notes
- Ask questions based on syllabus & notes
- Generate summaries & key points
- Exam-focused Q&A support

## Tech Stack
- Python
- FAISS (Vector DB)
- Sentence Transformers / HuggingFace embeddings
- LLM API (OpenAI/HuggingFace)
- GitHub for version control

## Architecture (High-Level)
User Query -> Embedding -> FAISS Retrieval -> Context + Query -> LLM -> Answer

## Milestones
- [ ] Document ingestion & chunking
- [ ] Embeddings + FAISS store
- [ ] RAG query pipeline
- [ ] Demo interface (CLI / Web)

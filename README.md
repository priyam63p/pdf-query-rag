# PDF Query RAG 📚🔍

A Full-Stack Retrieval-Augmented Generation (RAG) web application built with **JavaScript (Node.js & Express)**, **Pinecone Vector Database**, and **Google Gemini API** that enables interactive natural language querying over PDF documents.

---

## 🌟 Features

- 📄 **PDF Processing & Document Indexing**: Parses PDF files (`merged-pdf.pdf`) and converts text into vector embeddings using Google Gemini.
- 🌲 **Pinecone Vector Storage**: Stores and indexes high-dimensional document vectors for rapid similarity retrieval.
- 🤖 **Gemini-Powered Q&A**: Generates precise, context-grounded answers based on semantic search results.
- 🌐 **Web Interface**: Clean HTML/CSS/JS frontend to upload documents and ask questions interactively.
- 🔐 **Secure Credential Management**: Uses `.env` to protect API keys and server configurations.

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (`script.js`)
- **Backend:** Node.js, Express (`server.js`)
- **LLM & Embeddings:** Google Gemini API (`@google/genai`)
- **Vector Database:** [Pinecone](https://www.pinecone.io/) (`@pinecone-database/pinecone`)
- **Utilities:** `dotenv`, `pdf-parse`

---

## 📁 Project Structure

```text
pdf-query-rag/
├── backend/
│   ├── indexing.js     # Script for parsing PDFs & embedding vectors into Pinecone
│   ├── query.js        # Logic for processing search queries against Pinecone & Gemini
│   └── server.js       # Express REST API server
├── frontend/
│   ├── index.html      # Main Web UI layout
│   ├── script.js       # Client-side JavaScript API caller
│   └── style.css       # Custom UI styling
├── .env                # API keys and environment variables (gitignored)
├── .gitignore          # Files to ignore in version control
├── merged-pdf.pdf      # Sample / default source PDF document
├── package.json        # Node.js dependencies and project scripts
└── README.md           # Project documentation

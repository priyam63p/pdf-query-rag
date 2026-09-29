# PDF Query RAG 📚🔍

A Retrieval-Augmented Generation (RAG) system built with **Node.js**, **Pinecone Vector Database**, and **Google Gemini API** that enables interactive natural language querying over local PDF documents.

---

## 🌟 Features

- 📄 **PDF Parsing & Text Extraction**: Reads and parses PDF documents directly within Node.js.
- 🌲 **Pinecone Vector Storage**: Generates high-dimensional embeddings and indexes them in a Pinecone vector database for fast similarity retrieval.
- 🤖 **Gemini-Powered Q&A**: Leverages Google's Gemini models via the official `@google/genai` SDK to produce grounded, context-aware answers.
- 🔐 **Environment Configuration**: Protects secret credentials like API keys using `.env` variables.

---

## 🛠️ Tech Stack

- **Runtime:** Node.js (v18+)
- **LLM & Embeddings:** Google Gemini API (`@google/genai`)
- **Vector Database:** [Pinecone](https://www.pinecone.io/) (`@pinecone-database/pinecone`)
- **PDF Extraction:** `pdf-parse`
- **Environment Management:** `dotenv`

---

## 🚀 Getting Started

### 1. Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed along with `npm`.

### 2. Installation

Clone the repository and install the dependencies:

```bash
git clone [https://github.com/priyam63p/pdf-query-rag.git](https://github.com/priyam63p/pdf-query-rag.git)
cd pdf-query-rag
npm install

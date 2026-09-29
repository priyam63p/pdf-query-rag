import * as dotenv from "dotenv";
dotenv.config();

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-embedding-2-preview",
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const pineconeIndex = pinecone.Index(
  process.env.PINECONE_INDEX_NAME
);

export async function indexPDF(filePath, originalFileName) {
  console.log(`\nIndexing: ${originalFileName}`);

  const pdfLoader = new PDFLoader(filePath);

  const rawDocs = await pdfLoader.load();

  console.log(`Pages loaded: ${rawDocs.length}`);

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const chunkedDocs = await textSplitter.splitDocuments(rawDocs);

  

  const documentsWithMetadata = chunkedDocs.map((doc) => {
    doc.metadata = {
      ...doc.metadata,

      source: originalFileName,
      fileName: originalFileName,

      page:
        doc.metadata?.loc?.pageNumber ??
        doc.metadata?.pageNumber ??
        null,
    };

    return doc;
  });

  console.log(`Chunks created: ${documentsWithMetadata.length}`);

  await PineconeStore.fromDocuments(
    documentsWithMetadata,
    embeddings,
    {
      pineconeIndex,
      maxConcurrency: 5,
    }
  );

  console.log(`${originalFileName} indexed successfully`);

  return {
    fileName: originalFileName,
    pages: rawDocs.length,
    chunks: documentsWithMetadata.length,
  };
}
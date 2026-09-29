import * as dotenv from "dotenv";
dotenv.config();

import {
  GoogleGenerativeAIEmbeddings,
  ChatGoogleGenerativeAI,
} from "@langchain/google-genai";

import { Pinecone } from "@pinecone-database/pinecone";

import { PromptTemplate } from "@langchain/core/prompts";

import { StringOutputParser } from "@langchain/core/output_parsers";

import { RunnableSequence } from "@langchain/core/runnables";

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-embedding-2-preview",
});

const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-2.5-flash",
  temperature: 0.3,
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

export async function chatting(question, document = null) {
  if (!question || !question.trim()) {
    throw new Error("Question cannot be empty.");
  }

  console.log(`\nQuestion: ${question}`);

  const queryVector = await embeddings.embedQuery(question);

  const queryOptions = {
    topK: 10,
    vector: queryVector,
    includeMetadata: true,
  };

  if (document) {
    queryOptions.filter = {
      source: {
        $eq: document,
      },
    };
  }

  const searchResults = await pineconeIndex.query(queryOptions);

  const matches = searchResults.matches || [];

  const context = matches
    .map((match) => match.metadata?.text)
    .filter(Boolean)
    .join("\n\n---\n\n");

  const promptTemplate = PromptTemplate.fromTemplate(`

You are a document-based AI assistant. Your job is to answer the user's question using only the information contained in the provided context.

<context>
{context}
</context>

<question>
{question}
</question>

Follow these rules:

- Use ONLY the information in <context>.
- Treat the context as the only source of truth.
- Do not use your general knowledge or make assumptions.
- If the context does not contain enough information to answer the question, reply:
  "I don't have enough information to answer that question."
- If only part of the question can be answered from the context, answer that part and clearly state that the remaining information is unavailable.
- Ignore context that is unrelated to the question.
- Give a concise and easy-to-understand answer.
- Preserve important technical details, formulas, code, definitions, and examples when they are relevant.
- Do not fabricate information, sources, quotations, or examples.
- Do not refer to the context as "the provided context" unless necessary.

Now answer the question.

`);




  const chain = RunnableSequence.from([
    promptTemplate,
    model,
    new StringOutputParser(),
  ]);

  
  

  const answer = await chain.invoke({
    context,
    question,
  });

 
  

  const sources = matches.map((match) => {
    const metadata = match.metadata || {};

    return {
      score: match.score ? Number(match.score.toFixed(4)) : null,

      fileName: metadata.fileName || metadata.source || "Unknown document",

      page: metadata.page || metadata.loc?.pageNumber || null,

      text: metadata.text ? metadata.text.substring(0, 300) : "",
    };
  });

  return {
    answer,
    sources,
  };
}

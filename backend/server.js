import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import * as dotenv from "dotenv";
dotenv.config();

import { indexPDF } from "./indexing.js";
import { chatting } from "./query.js";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const app = express();

const PORT = process.env.PORT || 3000;



const frontendPath = path.join(dirname, "../frontend");

const uploadsPath = path.join(dirname, "../uploads");

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, {
    recursive: true,
  });
}





app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);



app.use(express.static(frontendPath));



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsPath);
  },

  filename: (req, file, cb) => {
    const timestamp = Date.now();

    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");

    cb(null, `${timestamp}-${safeName}`);
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 25 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed."));
    }
  },
});





app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "RAG server is running.",
  });
});


// Upload PDF


app.post("/api/upload", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF file.",
      });
    }

    console.log(`\n Received PDF: ${req.file.originalname}`);

    const result = await indexPDF(req.file.path, req.file.originalname);

    /*
     * Remove temporary uploaded PDF
     * after successful indexing.
     */
    fs.unlink(req.file.path, (error) => {
      if (error) {
        console.log("Could not delete temporary PDF:", error.message);
      }
    });

    return res.json({
      success: true,

      message: "PDF uploaded and indexed successfully.",

      document: result,
    });
  } catch (error) {
    console.error("Upload/indexing error:", error);

    if (req.file?.path) {
      fs.unlink(req.file.path, () => {});
    }

    return res.status(500).json({
      success: false,

      message: error.message || "Failed to process PDF.",
    });
  }
});




app.post("/api/query", async (req, res) => {
  try {
    const { question, document } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,

        message: "Please enter a question.",
      });
    }

    const result = await chatting(question.trim(), document || null);

    return res.json({
      success: true,

      ...result,
    });
  } catch (error) {
    console.error("Query error:", error);

    return res.status(500).json({
      success: false,

      message: error.message || "Failed to answer the question.",
    });
  }
});





app.use((error, req, res, next) => {
  console.error(error);

  res.status(500).json({
    success: false,

    message: error.message || "Something went wrong.",
  });
});



app.listen(PORT, () => {
  console.log(`Listening at port number ${PORT}`);
});

const uploadBtn =
  document.getElementById("uploadBtn");

const fileInput =
  document.getElementById("fileInput");

const uploadModal =
  document.getElementById("uploadModal");

const closeModal =
  document.getElementById("closeModal");

const dropZone =
  document.getElementById("dropZone");

const uploadProgress =
  document.getElementById("uploadProgress");

const progressBar =
  document.getElementById("progressBar");

const progressPercent =
  document.getElementById("progressPercent");

const progressText =
  document.getElementById("progressText");

const questionInput =
  document.getElementById("questionInput");

const sendBtn =
  document.getElementById("sendBtn");

const messages =
  document.getElementById("messages");

const welcome =
  document.getElementById("welcome");

const newChatBtn =
  document.getElementById("newChatBtn");

const documentsContainer =
  document.getElementById("documents");

const documentCount =
  document.getElementById("documentCount");

const selectedDocument =
  document.getElementById("selectedDocument");

const selectedDocumentName =
  document.getElementById(
    "selectedDocumentName"
  );

const clearDocument =
  document.getElementById(
    "clearDocument"
  );


// ---------------------------------------
// Application state
// ---------------------------------------

let selectedFile = null;

let selectedDocumentValue = null;

let isLoading = false;

const documents = new Map();


// ---------------------------------------
// Upload modal
// ---------------------------------------

uploadBtn.addEventListener(
  "click",
  () => {

    uploadModal.classList.add(
      "active"
    );

  }
);


closeModal.addEventListener(
  "click",
  closeUploadModal
);


uploadModal.addEventListener(
  "click",
  (event) => {

    if (
      event.target === uploadModal
    ) {

      closeUploadModal();

    }

  }
);


function closeUploadModal() {

  uploadModal.classList.remove(
    "active"
  );

  resetUploadUI();

}


// ---------------------------------------
// File input
// ---------------------------------------

dropZone.addEventListener(
  "click",
  () => {

    fileInput.click();

  }
);


fileInput.addEventListener(
  "change",
  () => {

    if (fileInput.files.length > 0) {

      handleFile(
        fileInput.files[0]
      );

    }

  }
);


// ---------------------------------------
// Drag and drop
// ---------------------------------------

dropZone.addEventListener(
  "dragover",
  (event) => {

    event.preventDefault();

    dropZone.classList.add(
      "dragging"
    );

  }
);


dropZone.addEventListener(
  "dragleave",
  () => {

    dropZone.classList.remove(
      "dragging"
    );

  }
);


dropZone.addEventListener(
  "drop",
  (event) => {

    event.preventDefault();

    dropZone.classList.remove(
      "dragging"
    );

    const file =
      event.dataTransfer.files[0];

    if (file) {

      handleFile(file);

    }

  }
);


// ---------------------------------------
// Handle file
// ---------------------------------------

function handleFile(file) {

  if (
    file.type !==
    "application/pdf"
  ) {

    alert(
      "Please select a PDF file."
    );

    return;

  }


  if (
    file.size >
    25 * 1024 * 1024
  ) {

    alert(
      "PDF must be smaller than 25 MB."
    );

    return;

  }


  selectedFile = file;

  uploadPDF(file);

}


// ---------------------------------------
// Upload PDF
// ---------------------------------------

function uploadPDF(file) {

  const formData =
    new FormData();

  formData.append(
    "pdf",
    file
  );


  uploadProgress.classList.add(
    "active"
  );

  progressText.textContent =
    "Uploading document...";

  setProgress(10);


  const xhr =
    new XMLHttpRequest();


  xhr.open(
    "POST",
    "/api/upload"
  );


  xhr.upload.addEventListener(
    "progress",
    (event) => {

      if (event.lengthComputable) {

        const percent =
          Math.round(
            (event.loaded /
              event.total) *
              40
          );

        setProgress(
          Math.max(
            10,
            percent
          )
        );

      }

    }
  );


  xhr.addEventListener(
    "load",
    () => {

      if (
        xhr.status >= 200 &&
        xhr.status < 300
      ) {

        try {

          const data =
            JSON.parse(
              xhr.responseText
            );

          if (!data.success) {

            throw new Error(
              data.message
            );

          }


          setProgress(100);

          progressText.textContent =
            "Document indexed successfully";


          addDocument(
            data.document
          );


          setTimeout(
            () => {

              closeUploadModal();

              selectDocument(
                data.document.fileName
              );

              addSystemMessage(
                `I've indexed "${data.document.fileName}". You can now ask questions about it.`
              );

            },
            700
          );


        } catch (error) {

          showUploadError(
            error.message
          );

        }

      } else {

        try {

          const data =
            JSON.parse(
              xhr.responseText
            );

          showUploadError(
            data.message
          );

        } catch {

          showUploadError(
            "Upload failed."
          );

        }

      }

    }
  );


  xhr.addEventListener(
    "error",
    () => {

      showUploadError(
        "Network error. Please try again."
      );

    }
  );


  xhr.send(formData);

}


// ---------------------------------------
// Progress
// ---------------------------------------

function setProgress(value) {

  progressBar.style.width =
    `${value}%`;

  progressPercent.textContent =
    value;

}


function showUploadError(message) {

  progressText.textContent =
    message;

  progressBar.style.width =
    "100%";

  progressBar.style.background =
    "#ef4444";

}


// ---------------------------------------
// Documents
// ---------------------------------------

function addDocument(document) {

  if (!document?.fileName) {
    return;
  }


  documents.set(
    document.fileName,
    document
  );


  renderDocuments();

}


function renderDocuments() {

  documentCount.textContent =
    documents.size;


  if (documents.size === 0) {

    documentsContainer.innerHTML = `

      <div class="empty-documents">

        <div class="empty-icon">
          📄
        </div>

        <p>No documents yet</p>

        <small>
          Upload a PDF to get started
        </small>

      </div>

    `;

    return;

  }


  documentsContainer.innerHTML =
    Array.from(
      documents.values()
    )
      .map(
        (doc) => `

          <div
            class="document-item ${
              selectedDocumentValue ===
              doc.fileName
                ? "active"
                : ""
            }"
            data-document="${escapeHTML(
              doc.fileName
            )}"
          >

            <div class="document-icon">
              PDF
            </div>

            <div class="document-info">

              <strong>
                ${escapeHTML(
                  doc.fileName
                )}
              </strong>

              <span>
                ${doc.pages || "—"} pages
                ·
                ${doc.chunks || "—"} chunks
              </span>

            </div>

          </div>

        `
      )
      .join("");


  document.querySelectorAll(
    ".document-item"
  ).forEach(
    (item) => {

      item.addEventListener(
        "click",
        () => {

          selectDocument(
            item.dataset.document
          );

        }
      );

    }
  );

}


// ---------------------------------------
// Select document
// ---------------------------------------

function selectDocument(
  fileName
) {

  selectedDocumentValue =
    fileName;


  selectedDocumentName.textContent =
    fileName;


  renderDocuments();

}


// ---------------------------------------
// Clear document
// ---------------------------------------

clearDocument.addEventListener(
  "click",
  () => {

    selectedDocumentValue =
      null;

    selectedDocumentName.textContent =
      "All documents";

    renderDocuments();

  }
);


// ---------------------------------------
// Ask question
// ---------------------------------------

sendBtn.addEventListener(
  "click",
  sendQuestion
);


questionInput.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      sendQuestion();

    }

  }
);


// Auto resize textarea

questionInput.addEventListener(
  "input",
  () => {

    questionInput.style.height =
      "auto";

    questionInput.style.height =
      Math.min(
        questionInput.scrollHeight,
        130
      ) + "px";

  }
);


async function sendQuestion() {

  if (isLoading) {
    return;
  }


  const question =
    questionInput.value.trim();


  if (!question) {
    return;
  }


  hideWelcome();


  addUserMessage(
    question
  );


  questionInput.value = "";

  questionInput.style.height =
    "auto";


  isLoading = true;

  sendBtn.disabled = true;


  const loadingId =
    addLoadingMessage();


  try {

    const response =
      await fetch(
        "/api/query",
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({

            question,

            document:
              selectedDocumentValue,

          }),

        }
      );


    const data =
      await response.json();


    removeMessage(
      loadingId
    );


    if (
      !response.ok ||
      !data.success
    ) {

      throw new Error(
        data.message ||
        "Failed to get an answer."
      );

    }


    addAIMessage(
      data.answer,
      data.sources
    );


  } catch (error) {

    removeMessage(
      loadingId
    );


    addErrorMessage(
      error.message
    );

  } finally {

    isLoading = false;

    sendBtn.disabled = false;

    questionInput.focus();

  }

}


// ---------------------------------------
// Message helpers
// ---------------------------------------

function addUserMessage(
  text
) {

  const element =
    createMessageElement(
      "user",
      text
    );


  messages.appendChild(
    element
  );


  scrollToBottom();

}


function addAIMessage(
  answer,
  sources = []
) {

  const element =
    createMessageElement(
      "ai",
      answer
    );


  if (
    Array.isArray(sources) &&
    sources.length > 0
  ) {

    const uniqueSources =
      removeDuplicateSources(
        sources
      );


    const sourcesHTML =
      uniqueSources
        .slice(0, 6)
        .map(
          (source) => `

            <div class="source-card">

              <strong>
                📄 ${escapeHTML(
                  source.fileName ||
                  "Document"
                )}
              </strong>

              <span>
                ${
                  source.page
                    ? `Page ${source.page}`
                    : "Relevant section"
                }
              </span>

            </div>

          `
        )
        .join("");


    element.querySelector(
      ".message-body"
    ).insertAdjacentHTML(
      "beforeend",
      `

        <div class="sources">

          <div class="sources-title">
            SOURCES
          </div>

          <div class="source-list">
            ${sourcesHTML}
          </div>

        </div>

      `
    );

  }


  messages.appendChild(
    element
  );


  scrollToBottom();

}


function addSystemMessage(
  text
) {

  hideWelcome();

  addAIMessage(
    text,
    []
  );

}


function addErrorMessage(
  text
) {

  const element =
    createMessageElement(
      "ai",
      `⚠ ${text}`
    );


  element.querySelector(
    ".message-text"
  ).style.color =
    "#fca5a5";


  messages.appendChild(
    element
  );


  scrollToBottom();

}


function addLoadingMessage() {

  const id =
    `loading-${Date.now()}`;


  const element =
    createMessageElement(
      "ai",
      ""
    );


  element.id = id;


  element.querySelector(
    ".message-text"
  ).innerHTML = `

    <div class="typing">

      <span></span>
      <span></span>
      <span></span>

    </div>

  `;


  messages.appendChild(
    element
  );


  scrollToBottom();


  return id;

}


function removeMessage(id) {

  const element =
    document.getElementById(id);


  if (element) {
    element.remove();
  }

}


function createMessageElement(
  type,
  text
) {

  const element =
    document.createElement(
      "div"
    );


  element.className =
    `message ${type}-message`;


  const name =
    type === "user"
      ? "You"
      : "DocuMind";


  const avatar =
    type === "user"
      ? "U"
      : "✦";


  element.innerHTML = `

    <div class="avatar">
      ${avatar}
    </div>

    <div class="message-body">

      <div class="message-header">

        <strong>
          ${name}
        </strong>

        <span>
          ${type === "ai" ? "AI" : "You"}
        </span>

      </div>

      <div class="message-text">
        ${escapeHTML(text)}
      </div>

    </div>

  `;


  return element;

}


// ---------------------------------------
// New chat
// ---------------------------------------

newChatBtn.addEventListener(
  "click",
  () => {

    messages.innerHTML = "";

    welcome.style.display =
      "flex";

    questionInput.focus();

  }
);


// ---------------------------------------
// Suggestions
// ---------------------------------------

document.querySelectorAll(
  ".suggestion"
).forEach(
  (button) => {

    button.addEventListener(
      "click",
      () => {

        questionInput.value =
          button.dataset.question;

        questionInput.dispatchEvent(
          new Event("input")
        );

        questionInput.focus();

      }
    );

  }
);


// ---------------------------------------
// Hide welcome
// ---------------------------------------

function hideWelcome() {

  welcome.style.display =
    "none";

}


// ---------------------------------------
// Scroll
// ---------------------------------------

function scrollToBottom() {

  requestAnimationFrame(
    () => {

      const container =
        document.getElementById(
          "chatContainer"
        );


      container.scrollTo({

        top:
          container.scrollHeight,

        behavior: "smooth",

      });

    }
  );

}


// ---------------------------------------
// Duplicate sources
// ---------------------------------------

function removeDuplicateSources(
  sources
) {

  const seen =
    new Set();


  return sources.filter(
    (source) => {

      const key =
        `${source.fileName}-${source.page}`;


      if (seen.has(key)) {
        return false;
      }


      seen.add(key);

      return true;

    }
  );

}


// ---------------------------------------
// HTML escaping
// ---------------------------------------

function escapeHTML(
  value
) {

  const div =
    document.createElement(
      "div"
    );


  div.textContent =
    String(value ?? "");


  return div.innerHTML;

}


// ---------------------------------------
// Reset upload
// ---------------------------------------

function resetUploadUI() {

  selectedFile = null;

  fileInput.value = "";

  uploadProgress.classList.remove(
    "active"
  );

  setProgress(0);

  progressText.textContent =
    "Processing document...";

  progressBar.style.background =
    "linear-gradient(90deg, #8b5cf6, #6366f1)";

}


// ---------------------------------------
// Connection check
// ---------------------------------------

async function checkServer() {

  const status =
    document.getElementById(
      "connectionStatus"
    );


  try {

    const response =
      await fetch(
        "/api/health"
      );


    if (response.ok) {

      status.innerHTML = `

        <span class="status-dot"></span>

        <span>
          Connected
        </span>

      `;

    } else {

      throw new Error();

    }

  } catch {

    status.innerHTML = `

      <span
        class="status-dot"
        style="background:#ef4444;box-shadow:none"
      ></span>

      <span>
        Offline
      </span>

    `;

  }

}


checkServer();

setInterval(
  checkServer,
  30000
);
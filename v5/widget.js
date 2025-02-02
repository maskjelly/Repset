(function () {
  const script =
    document.currentScript ||
    [].slice.call(document.getElementsByTagName("script")).pop();

  // Configuration (set via data attributes)
  const config = {
    position: script.getAttribute("data-position") || "bottom-right",
    title: script.getAttribute("data-title") || "Customer Support",
    fontFamily:
      script.getAttribute("data-font-family") ||
      "Arial, sans-serif",
  };

  // Create the widget container and attach a Shadow DOM for style isolation
  const widget = document.createElement("div");
  widget.id = "customer-support-widget";
  const shadow = widget.attachShadow({ mode: "open" });

  // Monochrome styles (black & white) for a clean, minimal UI
  const style = document.createElement("style");
  style.textContent = `
    /* Import fonts if needed */
    @import url('https://fonts.googleapis.com/css2?family=Arial&display=swap');

    .chat-container {
      position: fixed;
      ${config.position.includes("bottom") ? "bottom: 20px" : "top: 20px"};
      ${config.position.includes("right") ? "right: 20px" : "left: 20px"};
      width: 350px;
      background: #ffffff;
      border: 1px solid #000;
      border-radius: 8px;
      font-family: ${config.fontFamily};
      z-index: 9999;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    }
    .chat-header {
      background: #000;
      color: #fff;
      padding: 12px;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .chat-header h3 {
      margin: 0;
      font-size: 16px;
    }
    .chat-toggle {
      background: none;
      border: none;
      color: #fff;
      font-size: 20px;
      cursor: pointer;
    }
    .chat-body {
      height: 300px;
      overflow-y: auto;
      padding: 12px;
      background: #f7f7f7;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .message {
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 14px;
      line-height: 1.4;
      animation: fadeIn 0.2s ease;
    }
    .user-message {
      background: #000;
      color: #fff;
      align-self: flex-end;
    }
    .bot-message {
      background: #e0e0e0;
      color: #000;
      align-self: flex-start;
    }
    .input-container {
      display: flex;
      padding: 12px;
      background: #fff;
      border-top: 1px solid #000;
    }
    .input-container input {
      flex: 1;
      padding: 8px;
      border: 1px solid #000;
      border-radius: 4px;
      font-size: 14px;
      color: #000;
    }
    .input-container button {
      margin-left: 8px;
      padding: 8px 12px;
      border: none;
      background: #000;
      color: #fff;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;

  // Chat HTML markup
  const chatHTML = `
    <div class="chat-container">
      <div class="chat-header">
        <h3>${config.title}</h3>
        <button class="chat-toggle">−</button>
      </div>
      <div class="chat-body" id="chat-body"></div>
      <div class="input-container">
        <input type="text" id="chat-input" placeholder="Type your message..." />
        <button id="send-button">Send</button>
      </div>
    </div>
  `;

  // Attach styles and HTML to the shadow root
  shadow.appendChild(style);
  shadow.innerHTML += chatHTML;
  document.body.appendChild(widget);

  // Chat functionality
  const chatBody = shadow.getElementById("chat-body");
  const chatInput = shadow.getElementById("chat-input");
  const sendButton = shadow.getElementById("send-button");
  const chatToggle = shadow.querySelector(".chat-toggle");
  const chatContainer = shadow.querySelector(".chat-container");

  // Conversation Context: Retrieve history and user ID from localStorage
  const storageKey = "customerSupportHistory";
  let conversationHistory = JSON.parse(localStorage.getItem(storageKey)) || [];
  const userIdKey = "customerSupportUserId";
  let userId = localStorage.getItem(userIdKey);
  if (!userId) {
    userId = "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6);
    localStorage.setItem(userIdKey, userId);
  }

  function saveHistory() {
    localStorage.setItem(storageKey, JSON.stringify(conversationHistory));
  }

  function renderHistory() {
    chatBody.innerHTML = "";
    conversationHistory.forEach((msg) => {
      const div = document.createElement("div");
      div.className = "message " + (msg.role === "user" ? "user-message" : "bot-message");
      div.textContent = msg.content;
      chatBody.appendChild(div);
    });
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  renderHistory();

  async function handleUserInput() {
    const userMessage = chatInput.value.trim();
    if (!userMessage) return;

    // Add the user's message to the conversation history
    conversationHistory.push({ role: "user", content: userMessage });
    saveHistory();
    renderHistory();
    chatInput.value = "";

    try {
      // Post the conversation context to the backend
      const response = await fetch("https://mustermask-gisr.vercel.app/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, history: conversationHistory }),
      });
      const data = await response.json();
      if (data.response) {
        conversationHistory.push({ role: "assistant", content: data.response });
        saveHistory();
        renderHistory();
      } else {
        conversationHistory.push({ role: "assistant", content: "Sorry, no response received." });
        saveHistory();
        renderHistory();
      }
    } catch (error) {
      conversationHistory.push({ role: "assistant", content: "Error connecting to support." });
      saveHistory();
      renderHistory();
    }
  }

  sendButton.addEventListener("click", handleUserInput);
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleUserInput();
  });

  // Toggle chat open/close functionality
  let isOpen = true;
  chatToggle.addEventListener("click", () => {
    isOpen = !isOpen;
    if (isOpen) {
      chatBody.style.display = "flex";
      chatInput.parentElement.style.display = "flex";
      chatToggle.textContent = "−";
    } else {
      chatBody.style.display = "none";
      chatInput.parentElement.style.display = "none";
      chatToggle.textContent = "+";
    }
  });
})();

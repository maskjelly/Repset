(function () {
  const script =
    document.currentScript ||
    [].slice.call(document.getElementsByTagName("script")).pop();

  // Configuration (these attributes are still read, but the UI now uses a fixed black & white style)
  const config = {
    position: script.getAttribute("data-position") || "bottom-right",
    title: script.getAttribute("data-title") || "MUSTARD AI",
    // Although accentColor and fontFamily are still available, the UI uses predefined black & white colors
    accentColor: script.getAttribute("data-accent-color") || "#000000",
    fontFamily: script.getAttribute("data-font-family") || "Inter, sans-serif",
  };

  // User Management
  let userId = localStorage.getItem("mustardUserId");
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    localStorage.setItem("mustardUserId", userId);
  }

  // Conversation History Management
  let history = JSON.parse(localStorage.getItem(`mustardHistory_${userId}`) || "[]");
  const saveHistory = () =>
    localStorage.setItem(`mustardHistory_${userId}`, JSON.stringify(history));

  // Widget Construction
  const widget = document.createElement("div");
  widget.id = "mustard-chatbot";
  const shadow = widget.attachShadow({ mode: "open" });

  // Enhanced Black & White Minimal Styles
  const style = document.createElement("style");
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
    
    :host {
      --bg-color: #ffffff;
      --text-color: #000000;
      --header-bg: #000000;
      --header-text: #ffffff;
      --button-bg: #000000;
      --button-text: #ffffff;
      --border-color: #000000;
      --font: ${config.fontFamily};
    }
    
    .container {
      position: fixed;
      ${config.position.includes("bottom") ? "bottom: 20px" : "top: 20px"};
      ${config.position.includes("right") ? "right: 20px" : "left: 20px"};
      width: 400px;
      background: var(--bg-color);
      border-radius: 8px;
      border: 1px solid var(--border-color);
      box-shadow: none;
      transform: translateY(${config.position.includes("bottom") ? "20px" : "-20px"});
      opacity: 0;
      transition: all 0.3s ease-in-out;
      z-index: 99999;
      font-family: var(--font);
    }
    
    .container.visible { transform: translateY(0); opacity: 1; }
    
    .header {
      padding: 16px;
      background: var(--header-bg);
      color: var(--header-text);
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
      font-size: 16px;
      font-weight: 500;
    }
    
    .messages {
      height: 400px;
      padding: 16px;
      overflow-y: auto;
      background: var(--bg-color);
      display: flex;
      flex-direction: column;
      gap: 8px;
      color: var(--text-color);
    }
    
    .message {
      max-width: 80%;
      padding: 10px 14px;
      border-radius: 4px;
      font-size: 14px;
      line-height: 1.4;
      cursor: pointer;
      transition: transform 0.2s;
    }
    
    .message:hover { transform: translateX(3px); }
    
    .user {
      background: var(--header-bg);
      color: var(--header-text);
      align-self: flex-end;
      border-radius: 4px 4px 0 4px;
    }
    
    .bot {
      background: var(--bg-color);
      color: var(--text-color);
      align-self: flex-start;
      border: 1px solid var(--border-color);
      border-radius: 4px 4px 4px 0;
    }
    
    .reply-indicator {
      font-size: 12px;
      color: var(--text-color);
      padding: 2px 4px;
      background: transparent;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      margin-bottom: 4px;
    }
    
    .input-container {
      padding: 16px;
      background: var(--bg-color);
      border-top: 1px solid var(--border-color);
      display: flex;
      gap: 8px;
    }
    
    input {
      flex: 1;
      padding: 8px 10px;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      font-size: 14px;
      color: var(--text-color);
      background: var(--bg-color);
    }
    
    button {
      background: var(--button-bg);
      color: var(--button-text);
      border: none;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    
    .typing {
      position: relative;
      display: flex;
      gap: 4px;
      background: var(--bg-color);
      padding: 4px 8px;
      border: 1px solid var(--border-color);
      border-radius: 4px;
    }
    
    .typing-dot {
      width: 6px;
      height: 6px;
      background: var(--border-color);
      border-radius: 50%;
      animation: typing 1.4s infinite;
    }
    
    @keyframes typing {
      0% { opacity: 0.2; transform: translateY(0px); }
      20% { opacity: 1; transform: translateY(-2px); }
      100% { opacity: 0.2; transform: translateY(0px); }
    }
  `;

  // Chat Interface Markup
  shadow.innerHTML = `
    <div class="container">
      <div class="header">
        <div>${config.title}</div>
      </div>
      <div class="messages"></div>
      <div class="input-container">
        <input type="text" placeholder="Ask me anything..." />
        <button>Send</button>
      </div>
    </div>
  `;

  document.body.appendChild(widget);

  // Elements
  const container = shadow.querySelector(".container");
  const messagesEl = shadow.querySelector(".messages");
  const input = shadow.querySelector("input");
  const sendBtn = shadow.querySelector("button");

  // Initialization
  setTimeout(() => container.classList.add("visible"), 100);
  renderHistory();

  // Message Handling
  let activeReplyId = null;

  function renderHistory() {
    messagesEl.innerHTML = "";
    history.forEach((msg) => {
      const div = document.createElement("div");
      div.className = `message ${msg.role}`;
      div.innerHTML = `
        ${msg.replyTo ? `<div class="reply-indicator">Replying to: ${msg.replyTo}</div>` : ""}
        ${msg.content}
      `;
      div.dataset.id = msg.id;
      div.addEventListener("click", () => handleReply(msg));
      messagesEl.appendChild(div);
    });
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function handleReply(message) {
    activeReplyId = message.id;
    input.placeholder = `Replying to: ${message.content.substring(0, 30)}...`;
    input.focus();
  }

  async function handleSend() {
    const content = input.value.trim();
    if (!content) return;

    // Create message object
    const message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date().toISOString(),
      replyTo: activeReplyId,
    };

    // Update UI and history
    history.push(message);
    saveHistory();
    renderHistory();
    input.value = "";
    activeReplyId = null;
    input.placeholder = "Ask me anything...";

    // Show typing indicator
    const typing = document.createElement("div");
    typing.className = "typing";
    typing.innerHTML = `
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    `;
    messagesEl.appendChild(typing);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    try {
      const response = await fetch("https://mustermask-gisr.vercel.app/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          history: history.filter((m) => !m.replyTo || m.id === activeReplyId),
          message,
        }),
      });

      const data = await response.json();

      // Add bot response
      history.push({
        id: Date.now().toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date().toISOString(),
        replyTo: message.id,
      });
      saveHistory();
      renderHistory();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      typing.remove();
    }
  }

  // Event Listeners
  sendBtn.addEventListener("click", handleSend);
  input.addEventListener("keypress", (e) => e.key === "Enter" && handleSend());

  // Initial Greeting
  if (history.length === 0) {
    history.push({
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm MUSTARD, your AI assistant. Ask me anything!",
      timestamp: new Date().toISOString(),
    });
    saveHistory();
    renderHistory();
  }
})();

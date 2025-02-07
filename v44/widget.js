(function () {
  const script = document.currentScript || [].slice.call(document.getElementsByTagName("script")).pop();

  // Configuration
  const config = {
    position: script.getAttribute("data-position") || "bottom-right",
    title: script.getAttribute("data-title") || "Customer Support",
    fontFamily: script.getAttribute("data-font-family") || "Arial, sans-serif",
  };

  // Create widget container with Shadow DOM
  const widget = document.createElement("div");
  widget.id = "customer-support-widget";
  const shadow = widget.attachShadow({ mode: "open" });

  // Enhanced styles with gooey animation and professional bubble UI
  const style = document.createElement("style");
  style.textContent = `
    .chat-container {
      position: fixed;
      ${config.position.includes("bottom") ? "bottom: 20px" : "top: 20px"};
      ${config.position.includes("right") ? "right: 20px" : "left: 20px"};
      width: 350px;
      background: #ffffff;
      border-radius: 16px;
      font-family: ${config.fontFamily};
      z-index: 9999;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
    }

    .chat-bubble {
      position: fixed;
      ${config.position.includes("bottom") ? "bottom: 20px" : "top: 20px"};
      ${config.position.includes("right") ? "right: 20px" : "left: 20px"};
      background: #000;
      color: #fff;
      padding: 12px 20px;
      border-radius: 24px;
      cursor: pointer;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
      display: none;
    }

    .chat-bubble:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0,0,0,0.15);
    }

    .chat-header {
      background: #000;
      color: #fff;
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chat-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
    }

    .chat-body {
      height: 300px;
      overflow-y: auto;
      padding: 16px;
      background: #f8f9fa;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .message {
      padding: 10px 16px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.5;
      max-width: 80%;
      opacity: 0;
      transform: translateY(10px);
      animation: messageAppear 0.3s ease forwards;
    }

    .user-message {
      background: #000;
      color: #fff;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }

    .bot-message {
      background: #fff;
      color: #000;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }

    .clear-chat {
      position: absolute;
      top: 16px;
      right: 48px;
      background: none;
      border: none;
      color: #fff;
      cursor: pointer;
      font-size: 14px;
      opacity: 0.8;
      transition: opacity 0.2s ease;
    }

    .clear-chat:hover {
      opacity: 1;
    }

    .input-container {
      padding: 16px;
      background: #fff;
      border-top: 1px solid #eee;
    }

    .input-container input {
      width: 100%;
      padding: 12px;
      border: 1px solid #eee;
      border-radius: 24px;
      font-size: 14px;
      transition: all 0.2s ease;
    }

    .input-container input:focus {
      outline: none;
      border-color: #000;
    }

    @keyframes messageAppear {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes gooeyEffect {
      0% { filter: blur(0px); opacity: 0; }
      50% { filter: blur(4px); opacity: 0.5; }
      100% { filter: blur(0px); opacity: 1; }
    }

    .message.gooey-animation {
      animation: gooeyEffect 0.5s ease forwards;
    }
  `;

  // Updated chat HTML with clear button
  const chatHTML = `
    <div class="chat-bubble">Hey, I'm here to help!</div>
    <div class="chat-container">
      <div class="chat-header">
        <h3>${config.title}</h3>
        <button class="clear-chat">Clear</button>
        <button class="chat-toggle">−</button>
      </div>
      <div class="chat-body" id="chat-body"></div>
      <div class="input-container">
        <input type="text" id="chat-input" placeholder="Type your message..." />
      </div>
    </div>
  `;

  // Attach styles and HTML
  shadow.appendChild(style);
  shadow.innerHTML += chatHTML;
  document.body.appendChild(widget);

  // Enhanced chat functionality
  const chatBody = shadow.getElementById("chat-body");
  const chatInput = shadow.getElementById("chat-input");
  const chatToggle = shadow.querySelector(".chat-toggle");
  const chatContainer = shadow.querySelector(".chat-container");
  const chatBubble = shadow.querySelector(".chat-bubble");
  const clearButton = shadow.querySelector(".clear-chat");

  // Storage handling
  const storageKey = "customerSupportHistory";
  let conversationHistory = JSON.parse(localStorage.getItem(storageKey)) || [];
  const userIdKey = "customerSupportUserId";
  let userId = localStorage.getItem(userIdKey) || `user_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  localStorage.setItem(userIdKey, userId);

  function addMessageWithGooeyEffect(message, isUser) {
    const div = document.createElement("div");
    div.className = `message ${isUser ? "user-message" : "bot-message"} gooey-animation`;
    div.textContent = message;
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function clearChat() {
    conversationHistory = [];
    localStorage.setItem(storageKey, JSON.stringify(conversationHistory));
    chatBody.innerHTML = "";
    
    // Add welcome message with gooey animation
    setTimeout(() => {
      addMessageWithGooeyEffect("Hi! How can I help you today?", false);
    }, 300);
  }

  async function handleUserInput() {
    const userMessage = chatInput.value.trim();
    if (!userMessage) return;

    addMessageWithGooeyEffect(userMessage, true);
    conversationHistory.push({ role: "user", content: userMessage });
    chatInput.value = "";

    try {
      const response = await fetch("https://mustermask-gisr.vercel.app/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, history: conversationHistory }),
      });
      
      const data = await response.json();
      if (data.response) {
        addMessageWithGooeyEffect(data.response, false);
        conversationHistory.push({ role: "assistant", content: data.response });
      }
    } catch (error) {
      addMessageWithGooeyEffect("Error connecting to support.", false);
    }
    
    localStorage.setItem(storageKey, JSON.stringify(conversationHistory));
  }

  // Event listeners
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleUserInput();
  });

  clearButton.addEventListener("click", clearChat);

  // Toggle functionality
  let isOpen = true;
  chatToggle.addEventListener("click", () => {
    isOpen = !isOpen;
    if (isOpen) {
      chatContainer.style.display = "block";
      chatBubble.style.display = "none";
      chatToggle.textContent = "−";
    } else {
      chatContainer.style.display = "none";
      chatBubble.style.display = "block";
      chatToggle.textContent = "+";
    }
  });

  // Initialize chat
  if (conversationHistory.length === 0) {
    addMessageWithGooeyEffect("Hi! How can I help you today?", false);
  } else {
    conversationHistory.forEach(msg => {
      addMessageWithGooeyEffect(msg.content, msg.role === "user");
    });
  }
})();
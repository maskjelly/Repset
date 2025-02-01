(function () {
  const script = document.currentScript || [].slice.call(document.getElementsByTagName("script")).pop();

  // Configuration
  const config = {
    position: script.getAttribute("data-position") || "bottom-right",
    title: script.getAttribute("data-title") || "MUSTARD AI",
    fontFamily: script.getAttribute("data-font-family") || "'Inter', sans-serif",
  };

  // Generate persistent user ID
  let userId = localStorage.getItem('mustardUserId');
  if (!userId) {
    userId = `user_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('mustardUserId', userId);
  }

  // Load conversation history
  let history = JSON.parse(localStorage.getItem(`mustardHistory_${userId}`) || '[]');

  // Create widget container with Shadow DOM
  const widget = document.createElement("div");
  widget.id = "chatbot-widget";
  const shadow = widget.attachShadow({ mode: "open" });

  // Styles
  const style = document.createElement("style");
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

    .chat-container {
      position: fixed;
      ${config.position.includes("bottom") ? "bottom: 20px" : "top: 20px"};
      ${config.position.includes("right") ? "right: 20px" : "left: 20px"};
      width: 350px;
      background: #000000;
      border-radius: 12px;
      font-family: ${config.fontFamily};
      z-index: 9999;
      overflow: hidden;
      transition: all 0.3s ease;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
    }

    .chat-header {
      background: #000000;
      color: #ffffff;
      padding: 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .chat-header h3 {
      margin: 0;
      font-weight: 500;
      font-size: 16px;
    }

    .chat-toggle {
      background: none;
      border: none;
      color: #ffffff;
      font-size: 20px;
      cursor: pointer;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      opacity: 0.8;
      transition: opacity 0.2s ease;
    }

    .chat-toggle:hover {
      opacity: 1;
    }

    .chat-body {
      height: 400px;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: #000000;
    }

    .message {
      max-width: 85%;
      padding: 12px 16px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.5;
      animation: fadeIn 0.3s ease forwards;
      opacity: 0;
      transform: translateY(10px);
    }

    .user-message {
      background: #ffffff;
      color: #000000;
      align-self: flex-end;
    }

    .bot-message {
      background: #1a1a1a;
      color: #ffffff;
      align-self: flex-start;
      position: relative;
    }

    .typing-indicator {
      display: inline-flex;
      gap: 4px;
      padding: 12px 16px;
      background: #1a1a1a;
      border-radius: 12px;
    }

    .typing-dot {
      width: 6px;
      height: 6px;
      background: #555;
      border-radius: 50%;
      animation: typing 1.4s infinite;
    }

    .typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .typing-dot:nth-child(3) { animation-delay: 0.4s; }

    .input-container {
      display: flex;
      padding: 16px;
      background: #000000;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      gap: 8px;
    }

    input {
      flex: 1;
      padding: 12px 16px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      font-size: 14px;
      background: #1a1a1a;
      color: #ffffff;
    }

    input:focus {
      outline: none;
      border-color: rgba(255, 255, 255, 0.2);
    }

    button {
      background: #ffffff;
      color: #000000;
      border: none;
      padding: 12px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
    }

    @keyframes fadeIn {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes typing {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); background: #888; }
    }

    .footer {
      padding: 8px 16px;
      background: #000000;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .attribution {
      text-align: center;
      color: rgba(255, 255, 255, 0.5);
      font-size: 12px;
    }

    .attribution a {
      color: rgba(255, 255, 255, 0.7);
      text-decoration: none;
    }
  `;

  // Chat HTML
  const chatHTML = `
    <div class="chat-container">
      <div class="chat-header">
        <h3>${config.title}</h3>
        <button class="chat-toggle">−</button>
      </div>
      <div class="chat-body" id="chat-body"></div>
      <div class="input-container">
        <input type="text" placeholder="Type your message..." />
        <button>Send</button>
      </div>
      <div class="footer">
        <small class="attribution">made by maskjelly • <a href="https://x.com/LiquidZooo" target="_blank">Twitter</a></small>
      </div>
    </div>
  `;

  // Initialize
  shadow.appendChild(style);
  shadow.innerHTML += chatHTML;
  document.body.appendChild(widget);

  // Elements
  const chatBody = shadow.getElementById("chat-body");
  const chatInput = shadow.querySelector("input");
  const sendButton = shadow.querySelector("button");
  const chatToggle = shadow.querySelector(".chat-toggle");

  // Load history
  history.forEach(msg => addMessage(msg.content, msg.role === 'user'));

  // Add message with animation
  function addMessage(content, isUser) {
    const message = document.createElement("div");
    message.className = `message ${isUser ? "user-message" : "bot-message"}`;
    message.textContent = content;
    chatBody.appendChild(message);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  // Streaming response handler
  async function handleUserInput() {
    const userMessage = chatInput.value.trim();
    if (!userMessage) return;

    // Add user message
    addMessage(userMessage, true);
    history.push({ role: 'user', content: userMessage });
    chatInput.value = "";

    // Add typing indicator
    const typingIndicator = document.createElement("div");
    typingIndicator.className = "bot-message";
    typingIndicator.innerHTML = `
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    `;
    chatBody.appendChild(typingIndicator);
    chatBody.scrollTop = chatBody.scrollHeight;

    try {
      const response = await fetch("https://mustermask-gisr.vercel.app/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, history }),
      });

      // Remove typing indicator
      typingIndicator.remove();

      // Stream response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let responseText = "";
      
      const botMessage = document.createElement("div");
      botMessage.className = "bot-message";
      chatBody.appendChild(botMessage);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        responseText += decoder.decode(value);
        botMessage.textContent = responseText;
        chatBody.scrollTop = chatBody.scrollHeight;
      }

      history.push({ role: 'assistant', content: responseText });
      localStorage.setItem(`mustardHistory_${userId}`, JSON.stringify(history));

    } catch (error) {
      typingIndicator.remove();
      addMessage("Error connecting to chat service", false);
    }
  }

  // Event listeners
  sendButton.addEventListener("click", handleUserInput);
  chatInput.addEventListener("keypress", e => e.key === "Enter" && handleUserInput());
  
  let isOpen = true;
  chatToggle.addEventListener("click", () => {
    isOpen = !isOpen;
    chatBody.style.display = isOpen ? "block" : "none";
    chatToggle.textContent = isOpen ? "−" : "+";
  });

  // Initial greeting
  if (history.length === 0) {
    setTimeout(() => {
      addMessage("Hi! I'm MUSTARD, how can I help you today?", false);
      history.push({ role: 'assistant', content: "Hi! I'm MUSTARD, how can I help you today?" });
      localStorage.setItem(`mustardHistory_${userId}`, JSON.stringify(history));
    }, 1000);
  }
})();
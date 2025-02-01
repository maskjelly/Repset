// UPDATE
(function () {
  const script = document.currentScript || [].slice.call(document.getElementsByTagName("script")).pop();

  // Configuration
  const config = {
    position: script.getAttribute("data-position") || "bottom-right",
    title: script.getAttribute("data-title") || "MUSTARD AI",
    accentColor: script.getAttribute("data-accent-color") || "#4f46e5",
    fontFamily: script.getAttribute("data-font-family") || "Inter, sans-serif",
  };

  // Generate persistent user ID
  let userId = localStorage.getItem('mustardUserId');
  if (!userId) {
    userId = `user_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('mustardUserId', userId);
  }

  // Load conversation history
  let history = JSON.parse(localStorage.getItem(`mustardHistory_${userId}`) || '[]');

  // Create widget container
  const widget = document.createElement("div");
  widget.id = "mustard-chatbot";
  const shadow = widget.attachShadow({ mode: "open" });

  // Styles
  const style = document.createElement("style");
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
    
    :host {
      --accent: ${config.accentColor};
      --font: ${config.fontFamily};
    }

    * {
      box-sizing: border-box;
      margin: 0;
      font-family: var(--font);
    }

    .container {
      position: fixed;
      ${config.position.includes("bottom") ? "bottom: 20px" : "top: 20px"};
      ${config.position.includes("right") ? "right: 20px" : "left: 20px"};
      width: 400px;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 12px 32px rgba(0,0,0,0.1);
      transform: translateY(${config.position.includes("bottom") ? "20px" : "-20px"});
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .container.visible {
      transform: translateY(0);
      opacity: 1;
    }

    .header {
      padding: 20px;
      background: var(--accent);
      color: white;
      border-radius: 16px 16px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
    }

    .title {
      font-weight: 600;
      font-size: 18px;
      letter-spacing: -0.5px;
    }

    .close-btn {
      background: none;
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
      transition: opacity 0.2s;
    }

    .close-btn:hover {
      opacity: 0.8;
    }

    .messages {
      height: 500px;
      padding: 20px;
      overflow-y: auto;
      background: #f8fafc;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .message {
      max-width: 80%;
      padding: 14px 18px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.5;
      opacity: 0;
      transform: translateY(10px);
      animation: messageIn 0.3s ease forwards;
    }

    .user {
      background: var(--accent);
      color: white;
      align-self: flex-end;
      border-radius: 16px 16px 4px 16px;
    }

    .bot {
      background: white;
      color: #0f172a;
      align-self: flex-start;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      border-radius: 16px 16px 16px 4px;
      position: relative;
    }

    .typing {
      display: inline-block;
      padding: 14px 18px;
      background: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      border-radius: 16px 16px 16px 4px;
    }

    .typing-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      background: #ddd;
      border-radius: 50%;
      margin-right: 4px;
      animation: typing 1.4s infinite;
    }

    .typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .typing-dot:nth-child(3) { animation-delay: 0.4s; }

    .input-container {
      padding: 20px;
      background: white;
      border-top: 1px solid #f1f5f9;
      display: flex;
      gap: 12px;
    }

    input {
      flex: 1;
      padding: 12px 16px;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      font-size: 14px;
      transition: all 0.2s;
    }

    input:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: 0 0 0 3px ${config.accentColor}20;
    }

    button {
      background: var(--accent);
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 12px;
      cursor: pointer;
      font-weight: 500;
      transition: opacity 0.2s;
    }

    button:hover {
      opacity: 0.9;
    }

    @keyframes messageIn {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes typing {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); background: #94a3b8; }
    }
  `;

  // Chat HTML
  const chatHTML = `
    <div class="container">
      <div class="header">
        <div class="title">${config.title}</div>
        <button class="close-btn">×</button>
      </div>
      <div class="messages"></div>
      <div class="input-container">
        <input type="text" placeholder="Ask me anything..." />
        <button>Send</button>
      </div>
    </div>
  `;

  // Initialize
  shadow.appendChild(style);
  shadow.innerHTML += chatHTML;
  document.body.appendChild(widget);

  // Elements
  const container = shadow.querySelector('.container');
  const messagesEl = shadow.querySelector('.messages');
  const input = shadow.querySelector('input');
  const sendBtn = shadow.querySelector('button');
  const closeBtn = shadow.querySelector('.close-btn');

  // Show container with animation
  setTimeout(() => container.classList.add('visible'), 100);

  // Load history
  history.forEach(entry => {
    addMessage(entry.content, entry.role === 'user');
  });

  // Add message function
  function addMessage(content, isUser, isStreaming = false) {
    const message = document.createElement('div');
    message.className = `message ${isUser ? 'user' : 'bot'}`;
    
    if (isStreaming) {
      message.innerHTML = `
        <div class="typing">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </div>
      `;
    } else {
      message.textContent = content;
    }

    messagesEl.appendChild(message);
    messagesEl.scrollTo(0, messagesEl.scrollHeight);
  }

  // Handle messages
  async function handleSend() {
    const content = input.value.trim();
    if (!content) return;

    // Add user message
    addMessage(content, true);
    history.push({ role: 'user', content });
    input.value = '';

    // Add temporary bot message
    const botMessage = document.createElement('div');
    botMessage.className = 'message bot';
    messagesEl.appendChild(botMessage);
    
    // Streaming response
    try {
      const response = await fetch('https://mustermask-gisr.vercel.app/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, history }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let responseText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        responseText += chunk;
        
        // Animate streaming text
        botMessage.textContent = responseText;
        messagesEl.scrollTo(0, messagesEl.scrollHeight);
        
        // Smooth cursor effect
        if (!botMessage.querySelector('.cursor')) {
          const cursor = document.createElement('span');
          cursor.className = 'cursor';
          cursor.innerHTML = '▎';
          botMessage.appendChild(cursor);
        }
      }

      // Remove cursor and save to history
      botMessage.querySelector('.cursor')?.remove();
      history.push({ role: 'assistant', content: responseText });
      localStorage.setItem(`mustardHistory_${userId}`, JSON.stringify(history));

    } catch (error) {
      botMessage.textContent = "Sorry, I'm having trouble connecting. Please try again.";
      botMessage.style.color = '#ef4444';
    }
  }

  // Event listeners
  sendBtn.addEventListener('click', handleSend);
  input.addEventListener('keypress', e => e.key === 'Enter' && handleSend());
  closeBtn.addEventListener('click', () => container.remove());

  // Initial greeting
  if (history.length === 0) {
    setTimeout(() => {
      addMessage("Hi! I'm MUSTARD, your AI assistant. How can I help you today?", false);
      history.push({ 
        role: 'assistant', 
        content: "Hi! I'm MUSTARD, your AI assistant. How can I help you today?"
      });
      localStorage.setItem(`mustardHistory_${userId}`, JSON.stringify(history));
    }, 1000);
  }
})();
(function () {
  const script = document.currentScript || [].slice.call(document.getElementsByTagName("script")).pop();

  // Configuration
  const config = {
    position: script.getAttribute("data-position") || "bottom-right",
    title: script.getAttribute("data-title") || "MUSTARD AI",
    accentColor: script.getAttribute("data-accent-color") || "#4f46e5",
    fontFamily: script.getAttribute("data-font-family") || "Inter, sans-serif",
  };

  // User Management
  let userId = localStorage.getItem('mustardUserId');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    localStorage.setItem('mustardUserId', userId);
  }

  // Conversation History Management
  let history = JSON.parse(localStorage.getItem(`mustardHistory_${userId}`) || '[]');
  const saveHistory = () => localStorage.setItem(`mustardHistory_${userId}`, JSON.stringify(history));

  // Widget Construction
  const widget = document.createElement("div");
  widget.id = "mustard-chatbot";
  const shadow = widget.attachShadow({ mode: "open" });

  // Enhanced Styles
  const style = document.createElement("style");
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
    
    :host {
      --accent: ${config.accentColor};
      --font: ${config.fontFamily};
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
      z-index: 99999;
    }

    .container.visible { transform: translateY(0); opacity: 1; }

    .header {
      padding: 20px;
      background: var(--accent);
      color: white;
      border-radius: 16px 16px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
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
      position: relative;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .message:hover { transform: translateX(5px); }

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
    }

    .reply-indicator {
      font-size: 12px;
      color: var(--accent);
      padding: 4px 8px;
      background: rgba(0,0,0,0.05);
      border-radius: 4px;
      margin-bottom: 8px;
    }

    .input-container {
      padding: 20px;
      background: white;
      border-top: 1px solid #f1f5f9;
      display: flex;
      gap: 12px;
      position: relative;
    }

    input {
      flex: 1;
      padding: 12px 16px;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      font-size: 14px;
    }

    button {
      background: var(--accent);
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 12px;
      cursor: pointer;
    }

    .typing {
      position: absolute;
      top: -28px;
      left: 20px;
      display: flex;
      gap: 4px;
      background: white;
      padding: 6px 12px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }

    .typing-dot {
      width: 8px;
      height: 8px;
      background: #ddd;
      border-radius: 50%;
      animation: typing 1.4s infinite;
    }
  `;

  // Chat Interface
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
  const container = shadow.querySelector('.container');
  const messagesEl = shadow.querySelector('.messages');
  const input = shadow.querySelector('input');
  const sendBtn = shadow.querySelector('button');

  // Initialization
  setTimeout(() => container.classList.add('visible'), 100);
  renderHistory();

  // Message Handling
  let activeReplyId = null;

  function renderHistory() {
    messagesEl.innerHTML = '';
    history.forEach(msg => {
      const div = document.createElement('div');
      div.className = `message ${msg.role}`;
      div.innerHTML = `
        ${msg.replyTo ? `<div class="reply-indicator">Replying to: ${msg.replyTo}</div>` : ''}
        ${msg.content}
      `;
      div.dataset.id = msg.id;
      div.addEventListener('click', () => handleReply(msg));
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
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      replyTo: activeReplyId
    };

    // Update UI and history
    history.push(message);
    saveHistory();
    renderHistory();
    input.value = '';
    activeReplyId = null;
    input.placeholder = 'Ask me anything...';

    // Show typing indicator
    const typing = document.createElement('div');
    typing.className = 'typing';
    typing.innerHTML = `
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    `;
    messagesEl.appendChild(typing);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    try {
      const response = await fetch('https://mustermask-gisr.vercel.app/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          history: history.filter(m => !m.replyTo || m.id === activeReplyId),
          message
        })
      });

      const data = await response.json();
      
      // Add bot response
      history.push({
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
        replyTo: message.id
      });
      saveHistory();
      renderHistory();

    } catch (error) {
      console.error('Error:', error);
    } finally {
      typing.remove();
    }
  }

  // Event Listeners
  sendBtn.addEventListener('click', handleSend);
  input.addEventListener('keypress', e => e.key === 'Enter' && handleSend());

  // Initial Greeting
  if (history.length === 0) {
    history.push({
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm MUSTARD, your AI assistant. Ask me anything!",
      timestamp: new Date().toISOString()
    });
    saveHistory();
    renderHistory();
  }
})();
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: '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' // Replace with your actual Groq API key
});

(function() {
    const script = document.currentScript || [].slice.call(document.getElementsByTagName('script')).pop();
    
    // Configuration
    const config = {
      apiKey: script.getAttribute('data-api-key') || '',
      position: script.getAttribute('data-position') || 'bottom-right',
      title: script.getAttribute('data-title') || 'Chatbase AI',
      fontFamily: script.getAttribute('data-font-family') || "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    };
  
    // Create widget container with Shadow DOM for style isolation
    const widget = document.createElement('div');
    widget.id = 'chatbot-widget';
    const shadow = widget.attachShadow({ mode: 'open' });
  
    // Styles
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
  
      .chat-container {
        position: fixed;
        ${config.position.includes('bottom') ? 'bottom: 20px' : 'top: 20px'};
        ${config.position.includes('right') ? 'right: 20px' : 'left: 20px'};
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
        transition: all 0.2s ease;
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
      }
  
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
        transition: all 0.2s ease;
      }
  
      input::placeholder {
        color: rgba(255, 255, 255, 0.5);
      }
  
      input:focus {
        outline: none;
        border-color: rgba(255, 255, 255, 0.2);
        background: #262626;
      }
  
      button {
        background: #ffffff;
        color: #000000;
        border: none;
        padding: 12px 20px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 500;
        font-size: 14px;
        transition: all 0.2s ease;
      }
  
      button:hover {
        background: rgba(255, 255, 255, 0.9);
      }
  
      .chat-body::-webkit-scrollbar {
        width: 6px;
      }
  
      .chat-body::-webkit-scrollbar-track {
        background: #000000;
      }
  
      .chat-body::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 3px;
      }
  
      .chat-body::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.3);
      }
  
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(5px); }
        to { opacity: 1; transform: translateY(0); }
      }
  
      .message {
        animation: fadeIn 0.2s ease;
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
          <input type="text" id="chat-input" placeholder="Type your message..." />
          <button id="send-button">Send</button>
        </div>
      </div>
    `;
  
    // Attach elements
    shadow.appendChild(style);
    shadow.innerHTML += chatHTML;
  
    // Add to DOM
    document.body.appendChild(widget);
  
    // Chat functionality
    const chatContainer = shadow.querySelector('.chat-container');
    const chatBody = shadow.getElementById('chat-body');
    const chatInput = shadow.getElementById('chat-input');
    const sendButton = shadow.getElementById('send-button');
    const chatToggle = shadow.querySelector('.chat-toggle');
  
    function addMessage(message, isUser = true) {
      const messageDiv = document.createElement('div');
      messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
      messageDiv.textContent = message;
      chatBody.appendChild(messageDiv);
      chatBody.scrollTop = chatBody.scrollHeight;
    }
  
    async function handleUserInput() {
      const userMessage = chatInput.value.trim();
      if (!userMessage) return;
  
      addMessage(userMessage, true);
      chatInput.value = '';
  
      try {
        const stream = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: "You are a helpful sales assistant."
            },
            {
              role: "user",
              content: userMessage
            }
          ],
          model: "llama-3.3-70b-versatile",
          temperature: 0.5,
          max_completion_tokens: 1024,
          top_p: 1,
          stop: null,
          stream: true
        });
  
        let botMessage = '';
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        chatBody.appendChild(messageDiv);
  
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          botMessage += content;
          messageDiv.textContent = botMessage;
          chatBody.scrollTop = chatBody.scrollHeight;
        }
      } catch (error) {
        addMessage('Sorry, there was an error connecting to the chat service.', false);
      }
    }
  
    // Event listeners
    sendButton.addEventListener('click', handleUserInput);
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleUserInput();
    });
  
    let isOpen = true;
    chatToggle.addEventListener('click', () => {
      isOpen = !isOpen;
      chatBody.style.display = isOpen ? 'flex' : 'none';
      chatContainer.style.height = isOpen ? 'auto' : '60px';
      chatToggle.textContent = isOpen ? '−' : '+';
    });
  })();

//   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

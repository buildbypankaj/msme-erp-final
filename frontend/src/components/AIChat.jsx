import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import './AIChat.css';

function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Namaste! 👋 Main VyaparSathi AI hun. Aapke business ke baare mein koi bhi sawaal puchh sakte hain — GST, inventory, billing, accounting, ya kuch bhi!',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        throw new Error('AI request failed');
      }

      const data = await response.json();
      const aiMessage = {
        role: 'assistant',
        content: data.content,
      };

      setMessages([...newMessages, aiMessage]);
    } catch (error) {
      console.error(error);
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'Sorry, kuch technical issue aa gaya. Thodi der baad try karein.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <div className="ai-chat-fab" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="ai-chat-window">
          <div className="ai-chat-header">
            <div className="ai-chat-header-info">
              <div className="ai-avatar">
                <Bot size={20} />
              </div>
              <div>
                <p className="ai-chat-title">VyaparSathi AI</p>
                <p className="ai-chat-subtitle">Business Assistant</p>
              </div>
            </div>
            <X size={20} className="ai-chat-close" onClick={() => setIsOpen(false)} />
          </div>

          <div className="ai-chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`ai-message ${msg.role}`}>
                {msg.role === 'assistant' && (
                  <div className="ai-msg-avatar"><Bot size={14} /></div>
                )}
                <div className="ai-msg-bubble">{msg.content}</div>
              </div>
            ))}
            {loading && (
              <div className="ai-message assistant">
                <div className="ai-msg-avatar"><Bot size={14} /></div>
                <div className="ai-msg-bubble typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="ai-chat-input-area">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="GST, billing, inventory ke baare mein puchhen..."
              disabled={loading}
            />
            <button onClick={sendMessage} disabled={loading || !input.trim()}>
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default AIChat;
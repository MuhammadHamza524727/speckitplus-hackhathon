import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Simple RAG Chatbot Component
 * Adds text selection functionality to Docusaurus pages
 * Theme: Physical AI Book green palette
 */
const SimpleRagChatbot = () => {
  const [selectedText, setSelectedText] = useState('');
  const [showButton, setShowButton] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // ---- Color palette ----
  const C = {
    primary:    '#546B41',
    primaryMid: '#99AD7A',
    beige:      '#DCCCAC',
    cream:      '#FFF8EC',
    dark:       '#3d4f30',
    textDark:   '#2c3320',
    textMid:    '#4a5e38',
  };

  // Handle text selection
  useEffect(() => {
    const handleSelection = () => {
      setTimeout(() => {
        const selection = window.getSelection();
        const text = selection.toString().trim();

        if (text.length > 0 && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          const x = rect.left + window.pageXOffset;
          const y = rect.top + window.pageYOffset - 48;
          const buttonX = Math.max(10, Math.min(x, window.innerWidth - 100));
          const buttonY = Math.max(10, Math.min(y, window.innerHeight - 48));
          setButtonPosition({ x: buttonX, y: buttonY });
          setSelectedText(text);
          setShowButton(true);
        } else {
          setShowButton(false);
          setSelectedText('');
        }
      }, 10);
    };

    const handleKeyUp = (e) => {
      if (e.key === 'Escape') {
        setShowButton(false);
        setShowChat(false);
      }
    };

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Handle "Ask AI" button click
  const handleAskAI = async () => {
    if (!selectedText) return;
    setLoading(true);
    const userMessage = { type: 'user', content: selectedText, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setShowChat(true);

    try {
      const response = await fetch('https://hamza-developer-speckitplus-backend.hf.space/rag-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: selectedText }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      let responseText = data.answer || data.response || 'No response received';

      if (data.sources && data.sources.length > 0) {
        const sourcesText = `\n\n📎 Sources:\n${data.sources.map(s =>
          `• ${s.file} (Chunk: ${s.chunk_index}, Score: ${s.score})`
        ).join('\n')}`;
        responseText += sourcesText;
      }

      setMessages(prev => [...prev, { type: 'bot', content: responseText, timestamp: new Date() }]);
    } catch (err) {
      let errorContent = `⚠️ ${err.message}`;
      if (err.message.includes('500')) {
        errorContent = '⚠️ Server Error (500): The backend encountered an issue. Please try again shortly.';
      } else if (err.message.includes('404')) {
        errorContent = '⚠️ Endpoint not found (404). Please check the backend configuration.';
      } else if (err.message.includes('Failed to fetch') || err.message.includes('Network')) {
        errorContent = '⚠️ Cannot connect to the backend. Is it running?';
      }
      setMessages(prev => [...prev, { type: 'bot', content: errorContent, timestamp: new Date() }]);
    } finally {
      setLoading(false);
      setShowButton(false);
    }
  };

  const closeChat = () => {
    setShowChat(false);
    setMessages([]);
  };

  // ---- Ask Button ----
  const ButtonComponent = () => {
    if (!showButton) return null;
    return (
      <button
        style={{
          position: 'fixed',
          top: `${buttonPosition.y}px`,
          left: `${buttonPosition.x}px`,
          zIndex: 999999,
          background: `linear-gradient(135deg, ${C.primary}, ${C.dark})`,
          color: C.cream,
          border: `1.5px solid ${C.primaryMid}`,
          borderRadius: '22px',
          padding: '8px 16px',
          fontSize: '13px',
          fontWeight: '700',
          cursor: 'pointer',
          boxShadow: `0 4px 16px rgba(84,107,65,0.45)`,
          letterSpacing: '0.03em',
          userSelect: 'none',
          outline: 'none',
          minWidth: '80px',
          textAlign: 'center',
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
        onClick={handleAskAI}
        onMouseDown={(e) => e.preventDefault()}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = `0 8px 24px rgba(84,107,65,0.5)`;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = `0 4px 16px rgba(84,107,65,0.45)`;
        }}
      >
        💬 Ask AI
      </button>
    );
  };

  // ---- Chat Window ----
  const ChatComponent = () => {
    if (!showChat) return null;
    return (
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '400px',
        height: '480px',
        zIndex: 999998,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Inter', system-ui, sans-serif",
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(84,107,65,0.25), 0 4px 16px rgba(0,0,0,0.12)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, ${C.primary} 0%, ${C.dark} 100%)`,
          color: C.cream,
          padding: '14px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `2px solid ${C.primaryMid}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px',
              background: 'rgba(153,173,122,0.25)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px',
            }}>📚</div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '14px', lineHeight: 1 }}>Book AI Assistant</div>
              <div style={{ fontSize: '11px', color: C.beige, opacity: 0.8, marginTop: '2px' }}>
                Powered by Cohere + Qdrant RAG
              </div>
            </div>
          </div>
          <button
            style={{
              background: 'rgba(255,248,236,0.1)', border: 'none',
              color: C.cream, cursor: 'pointer', fontSize: '20px',
              width: '28px', height: '28px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              lineHeight: 1, padding: 0,
            }}
            onClick={closeChat}
          >×</button>
        </div>

        {/* Body */}
        <div style={{
          flex: 1,
          background: C.cream,
          padding: '16px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          {messages.length === 0 && !loading && (
            <div style={{
              textAlign: 'center',
              color: C.textMid,
              padding: '2rem 1rem',
              opacity: 0.6,
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💡</div>
              <div style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
                Select any text on the page and click "Ask AI" to get explanations from the book.
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} style={{
              padding: '10px 14px',
              borderRadius: msg.type === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              maxWidth: '88%',
              wordWrap: 'break-word',
              fontSize: '13.5px',
              lineHeight: '1.55',
              whiteSpace: 'pre-wrap',
              ...(msg.type === 'user'
                ? {
                    background: `linear-gradient(135deg, ${C.primary}, ${C.dark})`,
                    color: C.cream,
                    marginLeft: 'auto',
                    marginRight: '0',
                    boxShadow: '0 2px 8px rgba(84,107,65,0.25)',
                  }
                : {
                    background: '#fff',
                    color: C.textDark,
                    marginLeft: '0',
                    marginRight: 'auto',
                    border: `1px solid ${C.beige}`,
                    boxShadow: '0 2px 8px rgba(220,204,172,0.2)',
                  }),
            }}>
              {msg.content}
            </div>
          ))}
          {loading && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              background: '#fff',
              border: `1px solid ${C.beige}`,
              borderRadius: '16px 16px 16px 4px',
              width: 'fit-content',
              color: C.textMid,
              fontSize: '13px',
            }}>
              <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚙️</span>
              Thinking...
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div style={{
          background: '#fff',
          borderTop: `1px solid ${C.beige}`,
          padding: '8px 16px',
          fontSize: '11px',
          color: C.textMid,
          opacity: 0.7,
          textAlign: 'center',
        }}>
          Press Esc to close • Select text to ask another question
        </div>
      </div>
    );
  };

  return (
    <>
      {showButton && createPortal(<ButtonComponent />, document.body)}
      {showChat && createPortal(<ChatComponent />, document.body)}
    </>
  );
};

export default SimpleRagChatbot;

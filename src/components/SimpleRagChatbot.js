import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Simple RAG Chatbot Component
 * Adds text selection functionality to Docusaurus pages
 */
const SimpleRagChatbot = () => {
  const [selectedText, setSelectedText] = useState('');
  const [showButton, setShowButton] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Handle text selection
  useEffect(() => {
    const handleSelection = () => {
      // Small delay to ensure selection is complete
      setTimeout(() => {
        const selection = window.getSelection();
        const text = selection.toString().trim();

        console.log('Text selection detected:', text); // Debug log
        console.log('Selection range count:', selection.rangeCount); // Debug log

        if (text.length > 0 && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();

          console.log('Selection rect:', rect); // Debug log

          // More robust position calculation accounting for page scroll
          const x = rect.left + window.pageXOffset;
          const y = rect.top + window.pageYOffset - 40; // Position above the selection

          // Ensure the button stays within viewport
          const buttonX = Math.max(10, Math.min(x, window.innerWidth - 60));
          const buttonY = Math.max(10, Math.min(y, window.innerHeight - 40));

          console.log('Calculated button position:', { x: buttonX, y: buttonY }); // Debug log

          setButtonPosition({
            x: buttonX,
            y: buttonY,
          });

          setSelectedText(text);
          setShowButton(true);
        } else {
          console.log('No text selected or no range'); // Debug log
          setShowButton(false);
          setSelectedText('');
        }
      }, 10); // Small delay to ensure selection is finalized
    };

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('keyup', (e) => {
      if (e.key === 'Escape') {
        setShowButton(false);
        setShowChat(false);
      }
    });

    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('keyup', (e) => {
        if (e.key === 'Escape') {
          setShowButton(false);
          setShowChat(false);
        }
      });
    };
  }, []);

  // Handle "Ask AI" button click
  const handleAskAI = async () => {
    if (!selectedText) return;

    setLoading(true);

    // Add the selected text as a user message
    const userMessage = { type: 'user', content: selectedText, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);

    // Show the chat interface
    setShowChat(true);
// https://hamza-developer-speckitplus-backend.hf.space/
// http://127.0.0.1:8000
    try {
      // First, check if the backend is accessible
      const healthCheck = await fetch('https://hamza-developer-speckitplus-backend.hf.space/health');
      if (!healthCheck.ok) {
        console.warn('Backend health check failed:', healthCheck.status);
      }
      const response = await fetch('https://hamza-developer-speckitplus-backend.hf.space/rag-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: selectedText }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      // Handle response from backend
      let responseText = data.answer || data.response || 'No response received';

      // Add source information if available
      if (data.sources && data.sources.length > 0) {
        const sourcesText = `\n\nSources:\n${data.sources.map(source =>
          `- ${source.file} (Chunk: ${source.chunk_index}, Score: ${source.score})`
        ).join('\n')}`;
        responseText += sourcesText;
      }

      // Add AI response as a bot message
      const aiMessage = { type: 'bot', content: responseText, timestamp: new Date() };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('API Error:', err); // Log for debugging
      let errorMessageContent = `Error: ${err.message}`;

      // Provide more specific error messages
      if (err.message.includes('500')) {
        errorMessageContent = `Server Error (500): The backend service encountered an issue. This could be due to missing environment variables or service connectivity problems.`;
      } else if (err.message.includes('404')) {
        errorMessageContent = `API Endpoint Error (404): The backend endpoint may not be available.`;
      } else if (err.message.includes('Network Error')) {
        errorMessageContent = `Network Error: Unable to connect to the backend service. Please check if the service is running.`;
      }

      const errorMessage = { type: 'bot', content: errorMessageContent, timestamp: new Date() };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setShowButton(false);
    }
  };

  // Close chat
  const closeChat = () => {
    setShowChat(false);
    setMessages([]);
  };

  // Button component that appears on text selection
  const ButtonComponent = () => {
    if (!showButton) return null;

    const buttonStyle = {
      position: 'fixed',
      top: `${buttonPosition.y}px`,
      left: `${buttonPosition.x}px`,
      zIndex: 999999, // Very high z-index to ensure it appears on top of everything
      backgroundColor: '#3578e5',
      color: 'white',
      border: 'none',
      borderRadius: '20px',
      padding: '8px 12px',
      fontSize: '14px',
      fontWeight: 'bold',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      transform: 'translateY(-10px)',
      transition: 'all 0.2s ease, opacity 0.2s ease',
      pointerEvents: 'auto', // Ensure it can receive click events
      userSelect: 'none', // Prevent text selection issues
      MozUserSelect: 'none',
      WebkitUserSelect: 'none',
      msUserSelect: 'none',
      outline: 'none',
      minWidth: '50px',
      textAlign: 'center',
    };

    return (
      <button
        style={buttonStyle}
        onClick={handleAskAI}
        onMouseDown={(e) => e.preventDefault()} // Prevent text deselection
      >
        💬 Ask
      </button>
    );
  };

  // Chat component for displaying conversation
  const ChatComponent = () => {
    if (!showChat) return null;

    const chatContainerStyle = {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '380px',
      height: '450px',
      zIndex: 999998, // High z-index but slightly below the button
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      pointerEvents: 'auto',
    };

    const chatHeaderStyle = {
      backgroundColor: '#3578e5',
      color: 'white',
      padding: '12px 16px',
      borderTopLeftRadius: '8px',
      borderTopRightRadius: '8px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    };

    const chatBodyStyle = {
      flex: 1,
      backgroundColor: 'white',
      padding: '16px',
      overflowY: 'auto',
      borderBottomLeftRadius: '8px',
      borderBottomRightRadius: '8px',
      border: '1px solid #ddd',
      borderTop: 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    };

    const messageStyle = {
      padding: '10px 14px',
      borderRadius: '18px',
      maxWidth: '85%',
      wordWrap: 'break-word',
      fontSize: '14px',
      lineHeight: '1.4',
    };

    const userMessageStyle = {
      ...messageStyle,
      backgroundColor: '#e3f2fd',
      marginLeft: 'auto',
      marginRight: '0',
      border: '1px solid #bbdefb',
    };

    const botMessageStyle = {
      ...messageStyle,
      backgroundColor: '#f5f5f5',
      marginLeft: '0',
      marginRight: 'auto',
      border: '1px solid #e0e0e0',
    };

    const closeBtnStyle = {
      background: 'none',
      border: 'none',
      fontSize: '18px',
      cursor: 'pointer',
      color: 'white',
      padding: 0,
      width: '24px',
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      lineHeight: '1',
    };

    closeBtnStyle['&:hover'] = {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    };

    const loadingStyle = {
      textAlign: 'center',
      padding: '10px',
      color: '#666',
      fontStyle: 'italic',
    };

    return (
      <div style={chatContainerStyle}>
        <div style={chatHeaderStyle}>
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 'normal' }}>📚 Book Assistant</h4>
          <button style={closeBtnStyle} onClick={closeChat}>
            ×
          </button>
        </div>
        <div style={chatBodyStyle}>
          {messages.length === 0 && !loading && (
            <div style={{ textAlign: 'center', color: '#888', fontStyle: 'italic', marginTop: '20px' }}>
              Selected text will appear here...
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              style={message.type === 'user' ? userMessageStyle : botMessageStyle}
            >
              {message.content}
            </div>
          ))}
          {loading && (
            <div style={loadingStyle}>
              🤔 Thinking...
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render button and chat using React portals
  return (
    <>
      {showButton && createPortal(<ButtonComponent />, document.body)}
      {showChat && createPortal(<ChatComponent />, document.body)}
    </>
  );
};

export default SimpleRagChatbot;
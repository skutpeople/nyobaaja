// src/components/ChatMessage.jsx
import React from 'react';
import './ChatMessage.css';

export default function ChatMessage({ text, isUser }) {
  return (
    <div className={isUser ? 'chat-message user' : 'chat-message bot'}>
      <p>{text}</p>
    </div>
  );
}

// src/components/ChatInput.jsx
import React, { useState } from 'react';
import './ChatInput.css';

export default function ChatInput({ onSend }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (trimmed === '') return;
    onSend(trimmed);
    setText('');
  };

  return (
    <form className="chat-input-container" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Ketik deskripsi makanan..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="chat-input-field"
      />
      <button type="submit" className="chat-send-button">
        <span className="material-icons">send</span>
      </button>
    </form>
  );
}

// src/App.jsx
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import Navbar from './components/Navbar';

export default function App() {
  return (
    <BrowserRouter>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          backgroundColor: 'var(--color-dark-bg)',
        }}
      >
        {/* Bagian konten utama */}
        <main style={{ flex: 1, overflow: 'auto' }}>
          <AppRoutes />
        </main>

        {/* Navbar di bawah */}
        <Navbar />
      </div>
    </BrowserRouter>
  );
}

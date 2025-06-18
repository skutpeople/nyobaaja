// src/components/Navbar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate('/signin');
  };

  return (
    <nav className="navbar">
      {/* Jika user sudah login → tampilkan link Me, Chat, dan tombol Sign Out */}
      {user ? (
        <>
          <NavLink
            to="/me"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            <span className="material-icons">account_circle</span>
            <span>Me</span>
          </NavLink>

          <NavLink
            to="/chat?meal=breakfast"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            <span className="material-icons">chat_bubble_outline</span>
            <span>Chat</span>
          </NavLink>

          <button onClick={handleSignOut} className="nav-link" style={{ border: 'none', background: 'none' }}>
            <span className="material-icons">logout</span>
            <span>Sign Out</span>
          </button>
        </>
      ) : (
        // Jika belum login → tampilkan Sign In & Sign Up
        <>
          <NavLink
            to="/signin"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            <span className="material-icons">login</span>
            <span>Sign In</span>
          </NavLink>

          <NavLink
            to="/signup"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            <span className="material-icons">person_add</span>
            <span>Sign Up</span>
          </NavLink>
        </>
      )}
    </nav>
  );
}

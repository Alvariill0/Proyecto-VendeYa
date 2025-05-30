import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAutenticacion } from '../../context/ContextoAutenticacion'
import logo from '../../assets/VendeYa_Logo.png';
import Header from './Header';
import Navbar from './Navbar';

export default function Layout({ children }) {
  const { usuario, logout } = useAutenticacion()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-vh-100 d-flex flex-column">
      <Header />
      <Navbar />
      {/* Contenido principal */}
      <main className="flex-grow-1 py-4">
        <div className="container-fluid">
          {children}
        </div>
      </main>
    </div>
  )
} 
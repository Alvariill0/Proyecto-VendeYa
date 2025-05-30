import React from 'react'
import { Link } from 'react-router-dom'
import logo from '../../assets/VendeYa_Logo.png'

function HeaderPublico() {
    return (
        <nav className="navbar navbar-light bg-light fixed-top">
            <div className="container justify-content-center">
                <Link className="navbar-brand" to="/">
                <img src={logo} alt="VendeYa Logo" height="100" />
                </Link>
            </div>
        </nav>
    )
}

export default HeaderPublico 
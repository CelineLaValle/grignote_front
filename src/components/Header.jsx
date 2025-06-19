import React from 'react'
// import logoPusheen from '../assets/logo-pusheen.png'
import '../styles/layout/_header.scss'
import { Link } from 'react-router-dom'

function Header() {
  return (
    <div className='header'>

        <h1 className='title'>Grignote</h1>
                <Link to="/" className='nav'>Accueil</Link>
    </div>
  )
}

export default Header

        // <img className='logoHeader' src={logoPusheen} alt="logo" />

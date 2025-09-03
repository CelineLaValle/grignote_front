import React, { useEffect, useState } from 'react';
import cupcake from '../assets/cupcake.png';
import '../styles/layout/_header.scss';
import Menu from '../components/Menu'
import { Link, useNavigate } from 'react-router-dom';

function Header() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Charger l'utilisateur via l'endpoint /auth/me au lieu du localStorage
  useEffect(() => {
    fetch('http://localhost:4000/auth/me', {
      credentials: 'include' // Important pour envoyer les cookies
    })
      .then(res => {
        if (res.ok) {
          return res.json();
        }
        throw new Error('Non authentifié');
      })
      .then(data => {
        setUser(data.user);
      })
      .catch(err => {
        console.log('Utilisateur non connecté');
        setUser(null);
      });
  }, []);

  // Fonction de déconnexion
  const handleLogout = async () => {
    try {
      // Appelle le backend pour effacer le cookie token
      await fetch('http://localhost:4000/auth/logout', {
        method: 'POST',
        credentials: 'include' // très important pour envoyer le cookie au backend
      });

      // Réinitialise l'état
      setUser(null);

      // Redirige vers l'accueil
      navigate('/');
    } catch (err) {
      console.error('Erreur de déconnexion:', err);
    }
  };

  return (
    <div>
      <Menu />
      <div className='header'>
        <Link to="/"> <img className="header__logo" src={cupcake} alt="logo" /></Link>
        <h1 className='header__title'>Grignote</h1>

        <div className='header__nav'>
          <Link to="/" className='header__navLink'>Accueil</Link>

          {user ? (
            <>
              <button onClick={handleLogout} className='header__navLink'>Logout</button>
              {user.role === 'admin' && (
                <Link to="/admin" className='header__navLink'>Admin</Link>
              )}
            </>
          ) : (
            <Link to="/login" className='header__navLink'>Login</Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;
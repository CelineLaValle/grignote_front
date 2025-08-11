import React, { useEffect, useState } from 'react';
import cupcake from '../assets/cupcake.png';
import '../styles/layout/_header.scss';
import { Link, useNavigate } from 'react-router-dom';

function Header() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Charger l'utilisateur à partir du localStorage une seule fois
useEffect(() => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.idUser) {
    // Appel à l'API pour récupérer les infos utilisateur
    fetch(`http://localhost:4000/user/${user.idUser}`)
      .then(res => res.json())
      .then(data => {
        setUser(data);
      })
      .catch(err => {
        console.error('Erreur chargement user :', err);
        setUser(null);
      });
  } else {
    setUser(null);
  }
}, []);

// Fonction de déconnexion
const handleLogout = async () => {
  try {
    // Appelle le backend pour effacer le cookie token
    await fetch('http://localhost:4000/auth/logout', {
      method: 'POST',
      credentials: 'include' // très important pour envoyer le cookie au backend
    });

    // Supprimez la bonne clé du localStorage
    localStorage.removeItem('user');

    // Réinitialise l’état
    setUser(null);

    // Redirige vers l'accueil
    navigate('/');
  } catch (err) {
    console.error('Erreur de déconnexion:', err);
  }
};


  return (
    <div className='header'>
      <img className='logoHeader' src={cupcake} alt="logo" />
      <h1 className='title'>Grignote</h1>

      <Link to="/" className='nav'>Accueil</Link>

      {user ? (
        <>
          <button onClick={handleLogout} className='nav'>Logout</button>
          <Link to="/MyAccount" className='nav'>Mon compte</Link>
          {user.role === 'admin' && (
            <Link to="/admin" className='nav'>Admin</Link>
          )}
        </>
      ) : (
        <Link to="/login" className='nav'>Login</Link>
      )}
    </div>
  );
}

export default Header;


// import React from 'react'
// import cupcake from '../assets/cupcake.png'
// import '../styles/layout/_header.scss'
// import { Link } from 'react-router-dom'

// function Header() {
//   return (
//     <div className='header'>
//       <img className='logoHeader' src={cupcake} alt="logo" />
//       <h1 className='title'>Grignote</h1>
//       <Link to="/" className='nav'>Accueil</Link>
//       <Link to="/login" className='nav'>Login</Link>
//     </div>
//   )
// }

// export default Header

// <img className='logoHeader' src={logoPusheen} alt="logo" />

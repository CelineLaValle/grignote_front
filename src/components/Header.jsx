import { useEffect, useState } from 'react';
import cupcake from '../assets/cupcake.png';
import '../styles/layout/_header.scss';
import Menu from '../components/Menu'
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';


function Header() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Vérifie si l'utilisateur est connecté et stocke les informations dans le state user
  useEffect(() => {

    fetch(`${API_URL}/auth/me`, {
      credentials: 'include' // Important pour envoyer les cookies
    })
      .then(res => {
        if (res.ok) return res.json();
        if (res.status === 401) return null; // utilisateur non connecté
        throw new Error('Erreur serveur');   // toutes les autres erreurs remontent
      })
      .then(data => {
        if (data?.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(err => {
        console.error(err);
      });
  }, []);

  // Fonction de déconnexion
  const handleLogout = async () => {
    try {
      // Appelle le backend pour effacer le cookie token
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include' 
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
      <section className='header'>
        <Link to='/'> <img className='header__logo' src={cupcake} alt='logo représentant un cupcake' /></Link>
        <div className='header__containerNav'>
          <h1 className='header__title'>Grignote</h1>

          <div className='header__nav'>
            <Link to='/' className='header__navLink'>Accueil</Link>

            {user ? (
              <>
                <button onClick={handleLogout} className='header__navLink'>Se déconnecter</button>
                {user.role === 'admin' && (
                  <Link to='/AdminPage' className='header__navLink'>Page Admin</Link>
                )}
              </>
            ) : (
              <Link to='/login' className='header__navLink'>Se connecter</Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Header;
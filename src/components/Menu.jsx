import React, { useState, useEffect, useRef } from 'react';
import { useFilters } from './FilterContext';
import '../styles/layout/_menu.scss';
import { Link, useNavigate } from 'react-router-dom';

function Menu() {
  const [ouvert, setOuvert] = useState(false);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  const [tagSearch, setTagSearch] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  console.log('Menu - user prop:', user);
  console.log('Menu - user role:', user?.role);
  // Utilisation du contexte de filtres
  const {
    selectedCategory,
    setSelectedCategory,
    selectedTags,
    setSelectedTags,
    resetFilters
  } = useFilters();

  const dropdownRef = useRef(null);

  useEffect(() => {
    // Récupération des catégories
    fetch('http://localhost:4000/category')
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(data);
        }
      })
      .catch(err => console.error('Erreur chargement categories :', err));

    // Récupération des tags
    fetch('http://localhost:4000/tag')
      .then(response => response.json())
      .then(data => {
        setTags(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error('Erreur chargement tags :', err));
  }, []);

  useEffect(() => {

    fetch('http://localhost:4000/auth/me', {
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
        console.error(err); // ici on logue seulement les vraies erreurs
      });
  }, []);


  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setTagDropdownOpen(false);
        setTagSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const toggleTag = (idTag) => {
    setSelectedTags(prev =>
      prev.includes(idTag) ? prev.filter(t => t !== idTag) : [...prev, idTag]
    );
  };

  const filteredTags = tagSearch
    ? tags.filter(tag =>
      tag.name.toLowerCase().startsWith(tagSearch.toLowerCase())
    )
    : [];


  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  // Fonction pour réinitialiser tous les filtres
  const handleResetFilters = () => {
    resetFilters();
    setTagSearch('');
    setTagDropdownOpen(false);
  };

  return (
    <div className="menu">
      <button
        onClick={() => setOuvert(!ouvert)}
        className="menu__toogle"
      >
        {ouvert ? '✖' : '☰'}
      </button>

      <div className="menu__sidebar">
        <div className={`menu__content ${ouvert ? '' : 'ferme'}`}>
          <h3 className="menu__content__title">Mes informations :</h3>

          <ul>
            <li> <Link to="/MyAccount" className='menu__content__title__button' onClick={() => setOuvert(false)}>Mon compte</Link> </li>
            <li> <Link to="/MyFavorites" className='menu__content__title__button' onClick={() => setOuvert(false)}>Mes favoris</Link> </li>
          </ul>

          {/* Bloc d'auth juste sous "Mes informations" (visible mobile seulement via CSS) */}
          <div className="menu__mobileDiff">
            {/* Ligne de séparation */}
            <div className="menu__separator"></div>

            <div className="menu__accueil">
              <Link
                to="/"
                className="menu__accueilLink"
                onClick={() => setOuvert(false)}
              >
                Accueil
              </Link>
            </div>
            <div className="menu__auth">
              {user ? (
                <>
                  <button onClick={handleLogout} className='header__authLink'>Se déconnecter</button>
                  {user.role === "admin" && (
                    <Link
                      to="/AdminPage"
                      className="menu__authLink"
                      onClick={() => setOuvert(false)}
                    >
                      Page Admin
                    </Link>
                  )}
                </>
              ) : (
                <Link
                  to="/login"
                  className="menu__authLink"
                  onClick={() => setOuvert(false)}
                >
                  Se connecter
                </Link>
              )}
            </div>
          </div>
          {/* fin bloc auth */}

          <h3 className="menu__content__title">Filtres :</h3>

          <div className="containerFiltres">
            <label className='containerFiltres__title'>Par Catégorie</label>
            <select value={selectedCategory} onChange={handleCategoryChange}>
              <option value="">Toutes les catégories</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>{category}</option>
              ))}
            </select>

            <label className='containerFiltres__title'>Par Tag</label>
            <div className="containerFiltres__dropdown" ref={dropdownRef}>
              <input
                type="text"
                placeholder="Rechercher un tag..."
                value={tagSearch}
                onChange={e => {
                  setTagSearch(e.target.value);
                  if (!tagDropdownOpen) setTagDropdownOpen(true);
                }}
                onClick={() => setTagDropdownOpen(true)}
                autoComplete="off"
                aria-label="Recherche tags"
              />

              {tagDropdownOpen && (
                <div className="containerFiltres__dropdown__menuFiltres">
                  {filteredTags.length === 0 && (
                    <div className="containerFiltres__dropdown__menuFiltres__empty">Aucun tag trouvé</div>
                  )}
                  {filteredTags.map(tag => (
                    <label key={tag.idTag} className="containerFiltres__dropdown__menuFiltres__item">
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag.idTag)}
                        onChange={() => toggleTag(tag.idTag)}
                      />
                      {tag.name}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {selectedTags.length > 0 && (
              <div className="containerFiltres__dropdown__tags">
                <strong>Tags sélectionnés :</strong>{' '}
                {selectedTags
                  .map(id => {
                    const tag = tags.find(t => t.idTag === id);
                    return tag ? tag.name : '';
                  })
                  .join(', ')}
              </div>
            )}

            {/* Bouton pour réinitialiser les filtres */}
            {(selectedCategory || selectedTags.length > 0) && (
              <div className="containerFiltres__dropdown__reset">
                <button
                  onClick={handleResetFilters}
                  className="containerFiltres__dropdown__reset__button"
                  type="button"
                >
                  Effacer les filtres
                </button>
              </div>
            )}

            {/* Indicateur des filtres actifs */}
            {(selectedCategory || selectedTags.length > 0) && (
              <div className="containerFiltres__dropdown__reset__active">
                <strong>Filtres actifs :</strong>
                {selectedCategory && <span className="containerFiltres__dropdown__reset__active__category">Catégorie: {selectedCategory}</span>}
                {selectedTags.length > 0 && <span className="containerFiltres__dropdown__reset__active__tags">{selectedTags.length} tag(s)</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Menu;
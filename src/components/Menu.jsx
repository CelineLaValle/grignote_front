import { useState, useEffect, useRef } from 'react';
import { useFilters } from './FilterContext';
import '../styles/layout/_menu.scss';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

function Menu() {
  // État pour savoir si le menu est ouvert ou fermé
  const [ouvert, setOuvert] = useState(false);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  const [tagSearch, setTagSearch] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Utilisation du contexte pour gérer les filtres
  const {
    selectedCategory,
    setSelectedCategory,
    selectedTags,
    setSelectedTags,
    resetFilters
  } = useFilters();

  // useRef garde une référence vers un élément du DOM, ici pour fermer le menu des tags si on clique en dehors
  const dropdownRef = useRef(null);


  // useEffect pour récupérer les catégories et tags au chargement
  useEffect(() => {
    // Récupération des catégories
    fetch(`${API_URL}/category`)
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(data);
        }
      })
      .catch(err => console.error('Erreur chargement catégories:', err));

    // Récupération des tags
    fetch(`${API_URL}/tag`)
      .then(response => response.json())
      .then(data => {
        setTags(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error('Erreur chargement tags:', err));
  }, []);

  // useEffect pour récupérer l'utilisateur connecté
  useEffect(() => {
    fetch(`${API_URL}/auth/me`, {
      credentials: 'include'
    })
      .then(res => {
        if (res.ok) return res.json();
        if (res.status === 401) return null; // utilisateur non connecté
        throw new Error('Erreur lors de la communication avec le serveur');   // toutes les autres erreurs remontent
      })
      .then(data => {
        if (data?.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(err => console.error('Erreur vérification auth:', err));
  }, []);


  // useEffect pour fermer le dropdown si clic en dehors
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setTagDropdownOpen(false);
        setTagSearch('');
      }
    }
    // On ajoute un écouteur global sur le document pour détecter les clics en dehors du menu.
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  // Fonction de déconnexion
  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });

      // réinitialise l'état utilisateur
      setUser(null);

      navigate('/');
    } catch (err) {
      console.error('Erreur déconnexion:', err);
    }
  };

  // Fonction pour cocher/décocher (toogle) un tag dans les filtres
  const toggleTag = (idTag) => {
    setSelectedTags(prev =>
      // Si le tag est déjà sélectionné, en cliquant de nouveau on le retire (décoché), sinon on l'ajoute en cliquant (coché)
      prev.includes(idTag) ? prev.filter(tag => tag !== idTag) : [...prev, idTag]
    );
  };

  // Filtre des tags en fonction de la recherche
  const filteredTags = tagSearch
    ? tags.filter(tag =>
      tag.name.toLowerCase().startsWith(tagSearch.toLowerCase())
    )
    : [];

  // Changement de catégorie
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
    <div className='menu'>
      <button
        onClick={() => setOuvert(!ouvert)}
        className='menu__toogle'
      >
        {ouvert ? '✖' : '☰'}
      </button>

      <div className='menu__sidebar'>
        <div className={`menu__content ${ouvert ? '' : 'ferme'}`}>
          <h3 className='menu__content__title'>Mes informations :</h3>

          <ul>
            <li> <Link to='/MyAccount' className='menu__content__title__button' onClick={() => setOuvert(false)}>Mon compte</Link> </li>
            <li> <Link to='/MyFavorites' className='menu__content__title__button' onClick={() => setOuvert(false)}>Mes favoris</Link> </li>
          </ul>

          {/* Bloc d'auth juste sous 'Mes informations' (visible tablette et mobile seulement via CSS) */}
          <div className='menu__mobileDiff'>
            {/* Ligne de séparation */}
            <div className='menu__separator'></div>

            <div className='menu__accueil'>
              <Link
                to='/'
                className='menu__accueilLink'
                onClick={() => setOuvert(false)}
              >
                Accueil
              </Link>
            </div>
            <div className='menu__auth'>
              {user ? (
                <>
                  <button onClick={handleLogout} className='menu__authLink'>Se déconnecter</button>
                  {user.role === 'admin' && (
                    <Link
                      to='/AdminPage'
                      className='menu__authLink'
                      onClick={() => setOuvert(false)}
                    >
                      Page Admin
                    </Link>
                  )}
                </>
              ) : (
                <Link
                  to='/login'
                  className='menu__authLink'
                  onClick={() => setOuvert(false)}
                >
                  Se connecter
                </Link>
              )}
            </div>
          </div>
          {/* Fin bloc auth */}

          <h3 className='menu__content__title'>Filtres :</h3>

          <section className='containerFiltres'>
            <label className='containerFiltres__title'>Par Catégorie</label>
            <select value={selectedCategory} onChange={handleCategoryChange}>
              <option value=''>Toutes les catégories</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>{category}</option>
              ))}
            </select>

            <label className='containerFiltres__title'>Par Tag</label>
            <div className='containerFiltres__dropdown' ref={dropdownRef}>
              <input
                type='text'
                placeholder='Rechercher un tag...'
                value={tagSearch}
                onChange={e => {
                  setTagSearch(e.target.value);
                  if (!tagDropdownOpen) setTagDropdownOpen(true);
                }}
                onClick={() => setTagDropdownOpen(true)}
                autoComplete='off'
                aria-label='Recherche tags'
              />

              {tagDropdownOpen && (
                <div className='containerFiltres__dropdown__menuFiltres'>
                  {filteredTags.length === 0 && (
                    <div className='containerFiltres__dropdown__menuFiltres__empty'>Aucun tag trouvé</div>
                  )}
                  {filteredTags.map(tag => (
                    <label key={tag.idTag} className='containerFiltres__dropdown__menuFiltres__item'>
                      <input
                        type='checkbox'
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
              <div className='containerFiltres__dropdown__tags'>
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
              <div className='containerFiltres__dropdown__reset'>
                <button
                  onClick={handleResetFilters}
                  className='containerFiltres__dropdown__reset__button'
                  type='button'
                >
                  Effacer les filtres
                </button>
              </div>
            )}

            {/* Indicateur des filtres actifs */}
            {(selectedCategory || selectedTags.length > 0) && (
              <div className='containerFiltres__dropdown__reset__active'>
                <strong>Filtres actifs :</strong>
                {selectedCategory && <span className='containerFiltres__dropdown__reset__active__category'>Catégorie: {selectedCategory}</span>}
                {selectedTags.length > 0 && <span className='containerFiltres__dropdown__reset__active__tags'>{selectedTags.length} tag(s)</span>}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default Menu;
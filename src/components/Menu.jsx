import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../styles/layout/_menu.scss';

function Menu() {
    const [ouvert, setOuvert] = useState(false);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [tags, setTags] = useState([]);
    const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
    const [selectedTags, setSelectedTags] = useState([]);
    const [tagSearch, setTagSearch] = useState('');

    const dropdownRef = useRef(null);

    useEffect(() => {
        fetch('http://localhost:4000/article')
            .then(response => response.json())
            .then(data => {
                const uniqueCategories = [...new Set(data.map(article => article.category))];
                setCategories(uniqueCategories);
            })
            .catch(err => console.error('Erreur chargement articles :', err));

        fetch('http://localhost:4000/tag')
            .then(res => res.json())
            .then(data => setTags(Array.isArray(data) ? data : []))
            .catch(err => console.error('Erreur chargement tags :', err));
        setTags([]); // toujours un tableau
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

    const toggleTag = (idTag) => {
        setSelectedTags(prev =>
            prev.includes(idTag) ? prev.filter(t => t !== idTag) : [...prev, idTag]
        );
    };

    const filteredTags = Array.isArray(tags)
        ? tags.filter(tag =>
            tag.name.toLowerCase().startsWith(tagSearch.toLowerCase())
        )
        : [];

    const handleCategoryChange = (event) => {
        setSelectedCategory(event.target.value);
    };

    return (
        <div className="menu">
            <button
                onClick={() => setOuvert(!ouvert)}
                className="menu__toogle"
            >
                {ouvert ? '✖' : '☰'}
            </button>

            <div className="sidebar">
                <div className={`menu__content ${ouvert ? '' : 'ferme'}`}>
                    <h3 className="menu__content__information">Mes informations :</h3>
                    <ul>
                        <li> <Link to="/MyAccount" className='menu__content__information__button' onClick={() => setOuvert(false)}>Mon compte</Link> </li>
                        <li> <Link to="/MyFavorites" className='menu__content__information__button' onClick={() => setOuvert(false)}>Mes favoris</Link> </li>
                    </ul>

                    <h3>Filtres :</h3>

                    <label className='filtres'>Par Catégorie</label>
                    <select value={selectedCategory} onChange={handleCategoryChange}>
                        <option value="">Toutes les catégories</option>
                        {categories.map((category, index) => (
                            <option key={index} value={category}>{category}</option>
                        ))}
                    </select>

                    <label className='filtres'>Par Tag</label>
                    <div className="tag-dropdown" ref={dropdownRef}>
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
                            <div className="tag-dropdown-menu">
                                {filteredTags.length === 0 && (
                                    <div className="tag-dropdown-empty">Aucun tag trouvé</div>
                                )}
                                {filteredTags.map(tag => (
                                    <label key={tag.idTag} className="tag-dropdown-item">
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
                        <div className="selected-tags">
                            <strong>Tags sélectionnés :</strong>{' '}
                            {Array.isArray(tags)
                                ? selectedTags
                                    .map(id => {
                                        const tag = tags.find(t => t.idTag === id);
                                        return tag ? tag.name : '';
                                    })
                                    .join(', ')
                                : ''}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

export default Menu;

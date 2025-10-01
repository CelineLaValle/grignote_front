import { useState, useEffect } from 'react';
import '../styles/layout/_add.scss';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';
import { API_URL } from '../config'; 

function AddArticle() {
    // Déclaration des états pour le titre et le contenu
    const navigate = useNavigate(); // Initialiser useNavigate
    const [user, setUser] = useState(null); // On crée un état pour stocker l'utilisateur connecté
    const categories = ['Entrée', 'Plat', 'Dessert'];
    const [title, setTitle] = useState('');
    const [ingredient, setIngredient] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState(categories[0]);
    const [image, setImage] = useState(null); // Fichier image
    const [allTags, setAllTags] = useState([]);       // tous les tags existants récupérés depuis le backend
    const [selectedTags, setSelectedTags] = useState([]); // tags choisis par l'utilisateur
    const [currentTag, setCurrentTag] = useState(''); // input en cours
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [imageError, setImageError] = useState('');



    // useEffect permet de récupérer l'utilisateur via l'endpoint /auth/me
    useEffect(() => {
        fetch(`${API_URL}/auth/me`, {
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
                navigate('/login');
            });
    }, []); // Ce code ne s'exécute qu'une seule fois au chargement du composant


    useEffect(() => {
        fetch(`${API_URL}/tag`)
            .then(res => res.json())
            .then(data => setAllTags(data))
            .catch(err => console.error('Erreur chargement tags:', err));
    }, []);


    // Fonction pour gérer la soumission du formulaire
    const handleSubmit = async (e) => {
        e.preventDefault(); // Empêche le rechargement de la page

        // Vérifie que l'utilisateur est bien chargé avant de soumettre
        if (!user || !user.idUser) {
            return;
        }

        // Créer les tags qui n'existent pas encore
        const tagIds = [];
        for (let tag of selectedTags) {
            let existingTag = allTags.find(t => t.name.toLowerCase() === tag.name.toLowerCase());
            if (!existingTag) {
                const res = await fetch(`${API_URL}/tag`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: tag.name })
                });
                existingTag = await res.json();
                setAllTags(prev => [...prev, existingTag]);
            }
            tagIds.push(existingTag.id || existingTag.idTag);
        }

        // Utilisation de FormData pour gérer texte + fichier
        const formData = new FormData();
        formData.append('title', title);
        formData.append('ingredient', ingredient);
        formData.append('content', content);
        formData.append('category', category);
        formData.append('tags', JSON.stringify(tagIds));
        formData.append('idUser', user.idUser);
        if (image) {
            formData.append('image', image); // Ajoute le fichier s'il existe
        }

        // Envoi de la requête POST au backend
        try {
            const response = await fetch(`${API_URL}/article`, {
                method: 'POST',
                body: formData, // PAS besoin de Content-Type ici, le navigateur le définit
            });

            // Vérification de la réponse
            if (!response.ok) {
                throw new Error('Erreur lors de l\'envoi de l\'article');
            }

            // const result = await response.json(); // Si le backend renvoie des données
            // Rediriger vers la page principale
            navigate('/');
        } catch (error) {
            console.error('Erreur lors de la soumission:', error);
        }

        // Réinitialisation des champs du formulaire
        setTitle('');
        setIngredient('');
        setContent('');
        setCategory(categories[0]);
        setSelectedTags([]);
        setImage(null);
    };


    return (
        <div className='article'>
            <h2 className='article__title'>Ajouter une recette</h2>
            <form className='article__form' onSubmit={handleSubmit} encType='multipart/form-data'>
                {/* Champ pour le titre */}
                <div className='article__field'>
                    <label htmlFor='title' className='article__label'>Titre de la recette</label>
                    <input
                        className='article__input'
                        type='text'
                        id='title'
                        value={title}
                        onChange={(e) => {
                            const value = e.target.value.replace(/[^a-zA-ZÀ-ÿ0-9 '",.!?()-]/g, '');
                            setTitle(value);
                        }}
                        placeholder='Entrez le nom de la recette'
                    />
                </div>

                {/* Champ pour la liste d'ingrédients */}
                <div className='article__field'>
                    <label htmlFor='ingredient' className='article__label'>Liste des ingrédients</label>
                    <textarea
                        className='article__textarea'
                        rows='20'
                        cols='33'
                        id='ingredient'
                        name='ingredient'
                        value={ingredient}
                        onChange={(e) => {
                            const value = e.target.value.replace(/[^a-zA-ZÀ-ÿ0-9 '",.!?():;\n-]/g, '');
                            setIngredient(value);
                        }}      
                        placeholder='Noter les ingrédients'
                    />
                </div>

                {/* Champ pour le contenu */}
                <div className='article__field'>
                    <label htmlFor='content' className='article__label'>Contenu de la recette</label>
                    <textarea
                        className='article__textarea'
                        rows='20'
                        cols='33'
                        id='content'
                        value={content}
                         onChange={(e) => {
                            const value = e.target.value.replace(/[^a-zA-ZÀ-ÿ0-9 '",.!?():;\n-]/g, '');
                            setContent(value);
                        }}
                        placeholder='Entrez le contenu de la recette'
                    />
                </div>

                {/* Champ pour la catégorie */}
                <div className='article__field'>
                    <label htmlFor='category' className='article__label'>Catégorie de la recette</label>
                    <select
                        id='category'
                        className='article__select'
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        {categories.map((cat, index) => (
                            <option key={index} value={cat}>{cat}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Champ pour les tags */}

                <div className='article__field'>
                    <label htmlFor='tags' className='article__label'>Tags</label>
                    <div>
                        {selectedTags.map((tag, index) => (
                            <span key={index}>
                                #{tag.name || tag}
                                <button type='button' onClick={() => {
                                    setSelectedTags(selectedTags.filter((_, i) => i !== index));
                                }}>x</button>
                            </span>
                        ))}

                        <input
                            type='text'
                            value={currentTag}
                                onChange={e => {
                                    const value = e.target.value.replace(/[^a-zA-ZÀ-ÿ0-9-]/g, '');
                                    setCurrentTag(value);
                                }}
                            onKeyDown={e => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const trimmed = currentTag.trim();
                                    if (!trimmed) return;
                                    if (!selectedTags.some(t => t.name?.toLowerCase() === trimmed.toLowerCase())) {
                                        setSelectedTags([...selectedTags, { name: trimmed }]);
                                    }
                                    setCurrentTag('');
                                }
                            }}
                            placeholder='Tapez un tag et appuyez sur Entrée'
                            className='article__input'
                        />
                    </div>
                </div>


                {/* Champ pour le fichier image */}
                <div className='article__field'>
                    
                    {/* Aperçu de l'image */}
                    {image && (
                        <div className='article__field'>
                            <span className='article__label'>Aperçu de l'image</span>
                            <img
                                className='article__preview'
                                src={URL.createObjectURL(image)}
                                alt='Aperçu'
                            />
                        </div>
                    )}

                        <label htmlFor='image' className='article__label'>Image de la recette</label>
                    <input
                        id='image'
                        className='article__file'
                        type='file'
                        accept='image/*'
                          onChange={(e) => {
                            const file = e.target.files[0];
                            const maxSize = 1 * 1024 * 1024; // 1 Mo en octets

                            if (file && file.size > maxSize) {
                                setImageError('Le fichier est trop volumineux (max 1 Mo)');
                                setImage(null);
                                e.target.value = ''; // reset input
                            } else {
                                setImageError('');
                                setImage(file);
                            }
                        }}
                    />
                    <label htmlFor='image' className='article__image'>Choisir une image</label>
                    
                    {/* Message d'erreur */}
                    {imageError && <p className='article__error'>{imageError}</p>}
                </div>
                
                <div className='article__buttons'>
                    <button
                        className='article__submit'
                        type='button'
                         onClick={() => setShowCancelModal(true)}
                    >
                        Annuler
                    </button>
                    <button className='article__submit' type='submit'>Valider</button>
                </div>
            </form>

               {/* Modale d’annulation */}
            {showCancelModal && (
                <ConfirmModal
                    title='Confirmation'
                    message='Êtes-vous sûr de vouloir annuler ? Vos modifications seront perdues.'
                    onConfirm={() => navigate('/')} // redirection
                    onCancel={() => setShowCancelModal(false)} // ferme la modale
                />
            )}
        </div>
    );
}

export default AddArticle;
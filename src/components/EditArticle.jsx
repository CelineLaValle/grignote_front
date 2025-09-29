import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import '../styles/layout/_editArticle.scss';

function EditArticle() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [article, setArticle] = useState(null); // null = pas encore de données
    const [notFound, setNotFound] = useState(false);
    const [categories, setCategories] = useState([]);
    const [newTag, setNewTag] = useState('');
    const [tags, setTags] = useState([]); // tous les tags existants
    const [selectedTags, setSelectedTags] = useState([]); // tags de l'article
    // Récupérer la page d'origine depuis l'état de navigation
    const fromPage = location.state?.from || 'MyAccount';

    useEffect(() => {
        fetch(`http://localhost:4000/article/${id}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.message === 'Article non trouvé') {
                    setNotFound(true);
                } else {
                    setArticle(data);

                    // on coche les tags de l’article si le backend les envoie
                    if (Array.isArray(data.tags)) {
                        setSelectedTags(data.tags.map((tag) => tag.idTag));
                    }
                }
            })
            .catch((err) => {
                console.error('Erreur :', err);
                setNotFound(true);
            });
    }, [id]);


    useEffect(() => {
        fetch('http://localhost:4000/category')
            .then((res) => res.json())
            .then((data) => setCategories(data))
            .catch((err) => console.error('Erreur categories :', err));
    }, []);

    useEffect(() => {
        fetch('http://localhost:4000/tag')
            .then((res) => res.json())
            .then((data) => setTags(Array.isArray(data) ? data : []))
            .catch((err) => console.error('Erreur tags :', err));
    }, []);

    const handleTagToggle = (tagId) => {
        setSelectedTags((prev) =>
            prev.includes(tagId)
                ? prev.filter((t) => t !== tagId)
                : [...prev, tagId]
        );
    };

    // Nouvelle fonction : ajouter un tag
    const handleAddTag = async () => {
        if (!newTag.trim()) return;

        try {
            const response = await fetch('http://localhost:4000/tag', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`, // si tu utilises JWT
                },
                body: JSON.stringify({ name: newTag }),
            });

            // Ligne 76
            if (!response.ok) throw new Error('Erreur lors de l\'ajout du tag');

            const createdTag = await response.json();

            // Ajout immédiat dans la liste et sélection
            setTags((prev) => [...prev, createdTag]);
            setSelectedTags((prev) => [...prev, createdTag.idTag]);
            setNewTag('');
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!article) return;

        try {
            const formData = new FormData();
            formData.append('title', article.title);
            formData.append('ingredient', article.ingredient);
            formData.append('content', article.content);
            formData.append('category', article.category);

            // On ajoute les tags sélectionnés
            formData.append('tags', JSON.stringify(selectedTags));

            // Si l'image est un fichier (nouvelle image)
            if (article.image instanceof File) {
                formData.append('image', article.image);
            }

            const token = localStorage.getItem('token'); // ou récupérer d'où tu stockes ton JWT

            const response = await fetch(`http://localhost:4000/article/${id}`, {
                method: 'PUT',
                headers: {
                    Authorization: token ? `Bearer ${token}` : '', // JWT
                },
                credentials: 'include',
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json();
                // Ligne 121
                throw new Error(errData.message || 'Erreur lors de la mise à jour de l\'article');
            }

            // Redirection avec message et conservation de l'onglet actif
            const tab = location.state?.tab || '';
            navigate(`/${fromPage}${tab ? `?tab=${tab}` : ''}`, {
                state: {
                    message: {
                        text: 'Article mis à jour avec succès !',
                        type: 'success'
                    },
                    activeTab: tab
                }
            });

        } catch (error) {
            console.error(error);
        }
    };

    if (!article) {
        return null; // on affiche rien si pas encore reçu les données
    }


    return (
        <div className='articleModify'>
            <h2 className='articleModify__title'>Modifier l'article</h2>
            <form className='articleModify__form' onSubmit={handleSubmit}>

                {/* Titre */}
                <div className='articleModify__field'>
                    <input
                        className='articleModify__input'
                        type='text'
                        value={article.title}
                        onChange={(e) =>
                            setArticle({...article, title: e.target.value.replace(/[^a-zA-ZÀ-ÿ0-9 '",.!?()-]/g, '')
                        })
                    }
                        placeholder='Titre'
                    />
                </div>

                {/* Ingrédients */}
                <div className='articleModify__field'>
                    <textarea
                        className='articleModify__textarea'
                        value={article.ingredient}
                        onChange={(e) =>
                            setArticle({...article, ingredient: e.target.value.replace(/[^a-zA-ZÀ-ÿ0-9 '",.!?():\n-]/g, '')
                        })
                    }
                        placeholder='Ingrédients'
                    />
                </div>

                {/* Contenu */}
                <div className='articleModify__field'>
                    <textarea
                        className='articleModify__textarea'
                        value={article.content}
                        onChange={(e) =>
                            setArticle({...article, content: e.target.value.replace(/[^a-zA-ZÀ-ÿ0-9 '",.!?():\n-]/g, '')
                        })
                    }
                        placeholder='Contenu'
                    />
                </div>

                {/* Catégorie */}
                <div className='articleModify__field'>
                    <select
                        className='articleModify__select'
                        value={article.category}
                        onChange={(e) => 
                            setArticle({ ...article, category: e.target.value })}
                    >
                        <option value=''>-- Sélectionner une catégorie --</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>
                <div className='articleModify__field'>
                    <span className='articleModify__label'>Tags</span>

                    {/* Tags existants */}
                    <div className='articleModify__tags'>
                        {tags.map((tag) => (
                            <label key={tag.idTag}>
                                <input
                                    type='checkbox'
                                    checked={selectedTags.includes(tag.idTag)}
                                    onChange={() => handleTagToggle(tag.idTag)}
                                />
                                {tag.name}
                            </label>
                        ))}
                    </div>

                    {/* Ajout d’un nouveau tag */}
                    <div className='articleModify__newTag'>
                        <input
                            type='text'
                            placeholder='Ajouter un tag...'
                            value={newTag}
                            onChange={(e) => 
                                setNewTag(e.target.value.replace(/[^a-zA-ZÀ-ÿ0-9-]/g, ''))
                            }
                            onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                        />
                        <button type='button' onClick={handleAddTag}>
                            Ajouter
                        </button>
                    </div>
                </div>

                {/* Aperçu image */}
                {article.image && (
                    <div className='articleModify__field'>
                        <span className='articleModify__label'>Image actuelle</span>
                        <img
                            className='articleModify__preview'
                            src={
                                typeof article.image === 'string'
                                    ? `http://localhost:4000/uploads/${article.image}`
                                    : URL.createObjectURL(article.image)
                            }
                            alt='Aperçu'
                        />
                    </div>
                )}

                {/* Nouvelle image */}
                <div className='articleModify__field'>
                    <label htmlFor='image' className='articleModify__label'>Changer l'image</label>
                    <input
                        id='image'
                        className='articleModify__file'
                        type='file'
                        accept='image/*'
                        onChange={(e) => setArticle({ ...article, image: e.target.files[0] })}
                    />
                    <label htmlFor='image' className='articleModify__image'>Choisir une image</label>
                </div>

                <div className='articleModify__buttons'>
                    <button className='articleModify__submit' type='submit'>Enregistrer</button>
                </div>
            </form>
        </div>
    );
}

export default EditArticle;

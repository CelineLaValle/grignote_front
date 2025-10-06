import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import '../styles/layout/_articleDetails.scss';
import NotFound from '../components/NotFound';
import { API_URL } from '../config';
import React from 'react';


function ArticleDetails() {
    const { idArticle } = useParams(); // Récupérer l'ID depuis l'URL
    const [article, setArticle] = useState(null); // État pour l'article
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isFavori, setIsFavori] = useState(false);

    // Récupérer l'utilisateur connecté
    useEffect(() => {
        fetch(`${API_URL}/auth/me`, {
            credentials: 'include'
        })
            .then(res => {
                if (!res.ok) throw new Error('Vous n\'êtes pas connecté');
                return res.json();
            })
            .then(data => setUser(data.user))
            .catch(() => setUser(null));
    }, []);


    // Fonction pour récupérer l'article depuis le backend
    useEffect(() => {
        async function fetchArticle() {
            try {
                const response = await fetch(`${API_URL}/article/${idArticle}`);
                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération de l\'article');
                }
                const data = await response.json();
                setArticle(data);
            } catch (error) {
                console.error('Erreur chargement article:', error);
            }
        }

        fetchArticle();
    }, [idArticle]);

    // Vérifier si déjà en favori
    useEffect(() => {
        if (user) {
            fetch(`${API_URL}/favori`, { credentials: 'include' })
                .then(res => res.json())
                .then(data => {
                    const exists = data.some(fav => fav.idArticle === parseInt(idArticle));
                    setIsFavori(exists);
                })
                .catch(err => console.error('Erreur vérification favoris:', err));
        }
    }, [idArticle, user]);

    // Ajouter ou retirer des favoris
    const handleToggleFavori = async () => {
        if (!user) {
            navigate(`/login?redirect=/article/${idArticle}`);
            return;
        }

        try {
            if (isFavori) {
                // Retirer des favoris
                await fetch(`${API_URL}/favori/${idArticle}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                setIsFavori(false);
            } else {
                // Ajouter aux favoris
                await fetch(`${API_URL}/favori`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idArticle })
                });
                setIsFavori(true);
            }
        } catch (err) {
            console.error('Erreur gestion favoris:', err);
        }
    };

    // Récupérer les commentaires
    useEffect(() => {
        async function fetchComments() {
            try {
                const res = await fetch(`${API_URL}/comment/${idArticle}`);
                if (!res.ok) throw new Error('Erreur récupération commentaires');
                const data = await res.json();
                setComments(data);
            } catch (err) {
                console.error('Erreur chargement commentaires:', err);
            }
        }

        fetchComments();
    }, [idArticle]);

    // Ajouter un commentaire
    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        try {

            const res = await fetch(`${API_URL}/comment`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    idArticle,
                    content: newComment
                })
            });
            const data = await res.json();

            // Ajouter le nouveau commentaire en haut de la liste
            setComments([{ idComment: data.idComment, content: newComment, pseudo: user.pseudo, date: new Date() }, ...comments]);
            setNewComment('');
        } catch (err) {
            console.error('Erreur ajout commentaire:', err);
        }
    };

    if (!article) {
        return <NotFound />;
    }

    // Gestion des ingrédients : on parse la chaîne JSON pour obtenir un tableau exploitable. Au départ, la valeur est une chaîne de caractères.
    const ingredientItems = Array.isArray(article.ingredient)
        ? article.ingredient
        : (() => {
            try {
                const parsed = JSON.parse(article.ingredient);
                if (Array.isArray(parsed)) return parsed;
            } catch { }
            // Si le JSON est invalide, on découpe manuellement la chaîne en utilisant les retours à la ligne, virgules ou points-virgules pour recréer un tableau propre.
            return String(article.ingredient)
                .split(/\r?\n|,|;/)
                .map(s => s.trim())
                .filter(Boolean);
        })();

    return (
        <>
            <article className='articleDetails'>
                <section className='articleDetails__container'>
                    <h2 className='articleDetails__title'>{article.title}</h2>

                    {article.image && (
                        <img
                            className='articleDetails__image'
                            src={article.image}
                            alt={article.title}
                        />
                    )}
                    <ul className='articleDetails__ingredientList'>
                        {ingredientItems.map((ing, i) => (
                            <li key={i} className='articleDetails__ingredientList__ingredient'>
                                {ing}
                            </li>
                        ))}
                    </ul>

                    {/* Ligne de séparation */}
                    <div className='articleDetails__separator'></div>

                    <p className='articleDetails__content'>
                        {article.content.split('\n').map((line, index) => (
                            <React.Fragment key={index}>
                                {line}
                                <br />
                            </React.Fragment>
                        ))}
                    </p>
                    <div className='articleDetails__meta'>

                        {article.category && (
                            <p className='articleDetails__category'>
                                <strong>Catégorie: &nbsp;</strong> {article.category}
                            </p>
                        )}

                        {/* Ajout du bouton favori */}
                        <button
                            className='articleDetails__favoriButton'
                            onClick={handleToggleFavori}
                        >
                            {isFavori ? '⭐ Retirer des favoris' : '☆ Ajouter aux favoris'}
                        </button>
                    </div>

                    {article.tags && article.tags.length > 0 && (
                        <div className='articleDetails__tags'>
                            <strong>Tags :</strong>{' '}
                            {article.tags.map(tag => (
                                <span className='articleDetails__tag' key={tag.idTag}>
                                    #{tag.name}
                                </span>
                            ))}
                        </div>
                    )}
                </section>
                <section className='articleDetails__comments'>
                    <h3>Commentaires</h3>

                    {user ? (
                        <>
                            <textarea
                                className='articleDetails__commentsInput'
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder='Écrivez un commentaire...'
                            />

                            <button
                                className='articleDetails__commentsButton'
                                onClick={handleAddComment}
                            >
                                Ajouter
                            </button>
                        </>
                    ) : (
                        <button
                            className='articleDetails__commentsButton'
                            onClick={() => navigate(`/login?redirect=/article/${idArticle}`)}
                        >
                            Se connecter pour commenter
                        </button>
                    )}



                    {comments.length > 0 && (
                        <div className='articleDetails__commentsList'>
                            {comments.map(comment => (
                                <div key={comment.idComment} className='articleDetails__comment'>
                                    <strong>{comment.pseudo} :</strong> {comment.content}
                                    <em> ({new Date(comment.date).toLocaleString()})</em>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </article>

        </>
    );
}

export default ArticleDetails;
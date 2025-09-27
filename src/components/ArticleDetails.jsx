import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import '../styles/layout/_articledetails.scss';
import NotFound from "../components/NotFound";


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
        // // Vérifier si un cookie JWT est présent AVANT d'appeler /auth/me
        // if (!document.cookie.includes('token=')) {
        //     // Pas de cookie = pas connecté => on ne fait pas la requête
        //     setUser(null);
        //     return;
        // }

        fetch("http://localhost:4000/auth/me", {
            credentials: "include"
        })
            .then(res => {
                if (!res.ok) throw new Error("Non connecté");
                return res.json();
            })
            .then(data => setUser(data.user))
            .catch(() => setUser(null));
    }, []);


    // Fonction pour récupérer l'article depuis le backend
    useEffect(() => {
        async function fetchArticle() {
            try {
                const response = await fetch(`http://localhost:4000/article/${idArticle}`);
                if (!response.ok) {
                    throw new Error("Erreur lors de la récupération de l'article");
                }
                const data = await response.json();
                console.log('Article reçu:', data);
                setArticle(data);
            } catch (error) {
                console.error('Erreur :', error);
            }
        }

        fetchArticle();
    }, [idArticle]);

    // Vérifier si déjà en favori
    useEffect(() => {
        if (user) {
            fetch("http://localhost:4000/favori", { credentials: "include" })
                .then(res => res.json())
                .then(data => {
                    const exists = data.some(fav => fav.idArticle === parseInt(idArticle));
                    setIsFavori(exists);
                })
                .catch(err => console.error(err));
        }
    }, [idArticle, user]);

    // Fonction toggle favori
    const handleToggleFavori = async () => {
        if (!user) {
            navigate(`/login?redirect=/article/${idArticle}`);
            return;
        }

        try {
            if (isFavori) {
                // Retirer
                await fetch(`http://localhost:4000/favori/${idArticle}`, {
                    method: "DELETE",
                    credentials: "include"
                });
                setIsFavori(false);
            } else {
                // Ajouter
                await fetch("http://localhost:4000/favori", {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ idArticle })
                });
                setIsFavori(true);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Récupérer les commentaires
    useEffect(() => {
        async function fetchComments() {
            try {
                const res = await fetch(`http://localhost:4000/comment/${idArticle}`);
                if (!res.ok) throw new Error('Erreur récupération commentaires');
                const data = await res.json();
                setComments(data);
            } catch (err) {
                console.error(err);
            }
        }

        fetchComments();
    }, [idArticle]);


    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        try {

            const res = await fetch('http://localhost:4000/comment', {
                method: 'POST',
                credentials: "include",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    idArticle,
                    content: newComment
                })
            });
            const data = await res.json();

            // Ajouter le nouveau commentaire en haut
            setComments([{ idComment: data.idComment, content: newComment, pseudo: user.pseudo, date: new Date() }, ...comments]);
            setNewComment('');
        } catch (err) {
            console.error(err);
        }
    };

    // if (!article) {
    //     return <div>Chargement...</div>; // Message de chargement
    // }

    if (!article) {
        return <NotFound />;
    }


    const ingredientItems = Array.isArray(article.ingredient)
        ? article.ingredient
        : (() => {
            // essaie de parser du JSON ["Farine","Oeufs"]
            try {
                const parsed = JSON.parse(article.ingredient);
                if (Array.isArray(parsed)) return parsed;
            } catch { }
            // sinon split sur retour à la ligne, virgule ou point-virgule
            return String(article.ingredient)
                .split(/\r?\n|,|;/)
                .map(s => s.trim())
                .filter(Boolean);
        })();

    return (
        <>
            <div className='articleDetails'>
                <div className='articleDetails__container'>
                    <h2 className='articleDetails__title'>{article.title}</h2>

                    {article.image && (
                        <img
                            className='articleDetails__image'
                            src={`http://localhost:4000/uploads/${article.image}`}
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
                    <div className="articleDetails__separator"></div>

                    <p className='articleDetails__content'>{article.content}</p>
                    <div className='articleDetails__meta'>

                        {article.category && (
                            <p className='articleDetails__category'>
                                <strong>Catégorie: &nbsp;</strong> {article.category}
                            </p>
                        )}

                        {/* Ajout du bouton favori */}
                        <button
                            className="articleDetails__favoriButton"
                            onClick={handleToggleFavori}
                        >
                            {isFavori ? "⭐ Retirer des favoris" : "☆ Ajouter aux favoris"}
                        </button>
                    </div>

                    {article.tags && article.tags.length > 0 && (
                        <div className='articleDetails__tags'>
                            <strong>Tags :</strong>{" "}
                            {article.tags.map(tag => (
                                <span className='articleDetails__tag' key={tag.idTag}>
                                    #{tag.name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
                <div className='articleDetails__comments'>
                    <h3>Commentaires</h3>

                    {user ? (
                        <>
                            <textarea
                                className='articleDetails__commentsInput'
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Écrivez un commentaire..."
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
                </div>
            </div>

        </>
    );
}

export default ArticleDetails;
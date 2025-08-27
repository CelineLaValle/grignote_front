import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/layout/_articledetails.scss';

function ArticleDetails() {
    const { idArticle } = useParams(); // Récupérer l'ID depuis l'URL
    const [article, setArticle] = useState(null); // État pour l'article
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    // Fonction pour récupérer l'article depuis le backend
    useEffect(() => {
        async function fetchArticle() {
            console.log('bonjour');
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
            // Remplace 1 par user.idUser si tu as l'utilisateur connecté
            const res = await fetch('http://localhost:4000/comment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    idUser: 1,
                    idArticle,
                    content: newComment
                })
            });
            const data = await res.json();

            // Ajouter le nouveau commentaire en haut
            setComments([{ idComment: data.idComment, content: newComment, pseudo: "Vous", date: new Date() }, ...comments]);
            setNewComment('');
        } catch (err) {
            console.error(err);
        }
    };


        if (!article) {
        return <div>Chargement...</div>; // Message de chargement
    }

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
                            style={{ maxWidth: "400px", borderRadius: "12px" }}
                        />
                    )}
                    <p className='articleDetails__ingredient'>{article.ingredient}</p>
                    <p className='articleDetails__content'>{article.content}</p>
                    {article.category && (
                        <p className='articleDetails__category'>
                            <strong>Catégorie :</strong> {article.category}
                        </p>
                    )}

                    {article.tags && article.tags.length > 0 && (
                        <div className='articleDetails__tags'>
                            <strong>Tags :</strong>{" "}
                            {article.tags.map(tag => (
                                <span key={tag.idTag}>
                                    #{tag.name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            <div className='articleDetails__comments'>
                <h3>Commentaires</h3>

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
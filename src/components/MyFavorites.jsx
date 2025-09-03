import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import Pagination from '../components/Pagination'; // si tu veux garder la pagination

function MyFavorites() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [message, setMessage] = useState(null);

    const articlesPerPage = 5; 
    const totalPages = Math.ceil(favorites.length / articlesPerPage);
    const currentArticles = favorites.slice(
        (currentPage - 1) * articlesPerPage,
        currentPage * articlesPerPage
    );

    // Pagination
    const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    // Récupérer l'utilisateur connecté
    useEffect(() => {
        fetch("http://localhost:4000/auth/me", { credentials: "include" })
            .then(res => {
                if (!res.ok) throw new Error("Non connecté");
                return res.json();
            })
            .then(data => setUser(data.user))
            .catch(() => setUser(null));
    }, []);

    // Récupérer les favoris de l'utilisateur
    useEffect(() => {
        if (!user) return;

        async function fetchFavorites() {
            try {
                const res = await fetch(`http://localhost:4000/favori`, {
                    credentials: "include",
                });
                if (!res.ok) throw new Error("Erreur lors de la récupération des favoris");
                const data = await res.json();
                
                // data doit contenir au moins idArticle
                setFavorites(data);
            } catch (err) {
                console.error(err);
            }
        }

        fetchFavorites();
    }, [user]);

    if (!user) {
        return (
            <div className="containerAccount">
                <p>Vous devez être connecté pour voir vos favoris.</p>
            </div>
        );
    }

    return (
        <div className='containerAccount'>
            <div className='my-account'>
                <h2>Mes Favoris</h2>

                {favorites.length > 0 ? (
                    <>
                        <ul className='article-list'>
                            {currentArticles.map(article => (
                                <li className="article-item" key={article.idArticle}>
                                    <h4 className="article-title">{article.title}</h4>
                                    <img
                                        className="article-img"
                                        src={`http://localhost:4000/uploads/${article.image}`}
                                        alt={article.title}
                                    />
                                    <p className="article-content">
                                        {article.content ? article.content.slice(0, 100) : ''}{article.content && article.content.length > 100 ? '...' : ''}
                                    </p>
                                    <p className="article-date">
                                        {article.date ? new Date(article.date).toLocaleDateString('fr-FR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        }) : ''}
                                    </p>

                                    {/* Bouton pour accéder à l'article */}
                                    <button
                                        className="article-edit"
                                        onClick={() => navigate(`/article/${article.idArticle}`)}
                                    >
                                        Voir l'article
                                    </button>

                                    {/* Bouton pour retirer des favoris */}
                                    <button
                                        className="article-delete"
                                        onClick={async () => {
                                            if (!window.confirm("Voulez-vous vraiment retirer cet article de vos favoris ?")) return;
                                            try {
                                                const res = await fetch(`http://localhost:4000/favori/${article.idArticle}`, {
                                                    method: 'DELETE',
                                                    credentials: "include",
                                                });
                                                if (!res.ok) throw new Error("Erreur suppression favori");

                                                // Mise à jour du state
                                                setFavorites(prev => prev.filter(f => f.idArticle !== article.idArticle));

                                                setMessage({ text: "Article retiré des favoris.", type: "success" });
                                                setTimeout(() => setMessage(null), 3000);
                                            } catch (err) {
                                                console.error(err);
                                                setMessage({ text: err.message, type: "error" });
                                                setTimeout(() => setMessage(null), 3000);
                                            }
                                        }}
                                    >
                                        Retirer
                                    </button>
                                </li>
                            ))}
                        </ul>

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            nextPage={nextPage}
                            prevPage={prevPage}
                        />
                    </>
                ) : (
                    <p>Vous n'avez aucun favori pour le moment.</p>
                )}

                {/* Message dynamique */}
                {message && (
                    <div className={message.type === "error" ? "error-message" : "success-message"}>
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyFavorites;

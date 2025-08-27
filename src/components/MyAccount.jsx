import React, { useEffect, useState } from 'react'
import '../styles/layout/_myaccount.scss';
import '../styles/layout/_pagination.scss'
import { useNavigate } from "react-router-dom";
import Pagination from './Pagination';
import { useLocation } from "react-router-dom";

function MyAccount() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [articles, setArticles] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const articlesPerPage = 5;
    const location = useLocation();
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetch('http://localhost:4000/auth/me', {
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                setUser(data.user); // ici on stocke l'utilisateur
                console.log(data.user)
                return fetch(`http://localhost:4000/article/user/${data.user.idUser}`);

            })
            .then(res => res.json())
            .then(data => { // On vérifie que c'est bien un tableau
               if (Array.isArray(data)) {
                    setArticles(data);
                } else {
                    console.error("Réponse inattendue :", data);
                    setArticles([]); // évite les plantages
                }
            })

            .catch(err => console.error('Erreur:', err));
    }, []);

    useEffect(() => {
        if (location.state?.message) {
            setMessage(location.state.message);
            setTimeout(() => setMessage(null), 5000); // disparaît après 5s
        }
    }, [location.state]);


    if (!user) {
        return <div>Chargement des informations utilisateur...</div>;
    }

    // Pagination
    const totalPages = Math.ceil((Array.isArray(articles) ? articles.length : 0) / articlesPerPage);
    const indexOfLastArticle = currentPage * articlesPerPage;
    const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
    const currentArticles = Array.isArray(articles)
        ? articles.slice(indexOfFirstArticle, indexOfLastArticle)
        : [];

    const nextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const prevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };


    return (
        <div className='containerAccount'>
            <div className='my-account'>


                {/* Message dynamique */}
                {message && (
                    <div className={message.type === "error" ? "error-message" : "success-message"}>
                        {message.text}
                    </div>
                )}

                <h2>Mon Compte</h2>

                <div className='user-info'>
                    <p><strong>Pseudo:</strong> {user.pseudo}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                </div>
                <h3>Mes Articles</h3>
                {articles.length > 0 ? (
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
                                        {article.content.slice(0, 100)}{article.content.length > 100 ? '...' : ''}
                                    </p>
                                    <p className="article-date">
                                        {new Date(article.date).toLocaleDateString('fr-FR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                    <button
                                        className="article-edit"
                                        onClick={() => navigate(`/EditArticle/${article.idArticle}`)}
                                    >
                                        Modifier
                                    </button>

                                    <button
                                        className="article-delete"
                                        onClick={async () => {
                                            if (!window.confirm("Voulez-vous vraiment supprimer cet article ?")) return;

                                            try {
                                                const token = localStorage.getItem("token"); // si tu utilises JWT
                                                const response = await fetch(`http://localhost:4000/article/${article.idArticle}`, {
                                                    method: "DELETE",
                                                    headers: {
                                                        Authorization: token ? `Bearer ${token}` : "",
                                                    },
                                                    credentials: "include",
                                                });

                                                if (!response.ok) {
                                                    const errData = await response.json();
                                                    throw new Error(errData.message || "Erreur lors de la suppression");
                                                }

                                                // Supprime l'article du state
                                                setArticles(prev => prev.filter(a => a.idArticle !== article.idArticle));

                                                // Affiche le message dynamique
                                                setMessage({ text: "Article supprimé avec succès !", type: "error" });
                                                setTimeout(() => setMessage(null), 5000); // disparaît après 5 secondes
                                            } catch (error) {
                                                console.error(error);
                                                setMessage("Échec de la suppression : " + error.message);
                                                setTimeout(() => setMessage(null), 5000);
                                            }
                                        }}
                                    >
                                        Supprimer
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
                    <p>Aucun article trouvé.</p>
                )}
            </div>
        </div >
    );
}

export default MyAccount;
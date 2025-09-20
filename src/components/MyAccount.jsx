import React, { useEffect, useState } from 'react'
import '../styles/layout/_myaccount.scss';
import '../styles/layout/_pagination.scss'
import { useNavigate } from "react-router-dom";
import Pagination from './Pagination';
import { useLocation } from "react-router-dom";
import ConfirmModal from "../components/ConfirmModal";

function MyAccount() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [articles, setArticles] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const articlesPerPage = 5;
    const location = useLocation();
    const [message, setMessage] = useState(null);
    const [articleToDelete, setArticleToDelete] = useState(null);

    useEffect(() => {
        // // Vérifier si un cookie JWT est présent AVANT d'appeler /auth/me
        // if (!document.cookie.includes('token=')) {
        //     // Pas de cookie = pas connecté => on ne fait pas la requête
        //     setUser(null);
        //     return;
        // }
    fetch('http://localhost:4000/auth/me', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
            setUser(data.user); // stocke l'utilisateur
            return fetch(`http://localhost:4000/article/user/${data.user.idUser}`);
        })
        .then(res => res.json())
        .then(data => {
            setArticles(data); // on fait confiance à l'API
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
        return (
            <div className="containerAccount">
                <p>Vous devez être connecté pour accéder à votre compte.</p>
            </div>
        );
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

     const handleDelete = async () => {
        if (!articleToDelete) return;
        try {
            const response = await fetch(`http://localhost:4000/article/${articleToDelete.idArticle}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || "Erreur lors de la suppression");
            }

            setArticles(prev => prev.filter(a => a.idArticle !== articleToDelete.idArticle));
            setMessage({ text: "Article supprimé avec succès !", type: "error" });
            setTimeout(() => setMessage(null), 5000);
        } catch (error) {
            console.error(error);
            setMessage("Échec de la suppression : " + error.message);
            setTimeout(() => setMessage(null), 5000);
        } finally {
            setArticleToDelete(null); // ✅ ferme la modale
        }
    };


    return (
        <div className='containerMyAccount'>
            <div className='containerMyAccount__content'>


                {/* Message dynamique */}
                {message && (
                    <div className={message.type === "error" ? "error-message" : "success-message"}>
                        {message.text}
                    </div>
                )}

                <h2 className='containerMyAccount__content__title'>Mon Compte</h2>

                <div className='containerMyAccount__content__userInfo'>
                    <p><strong>Pseudo:</strong> {user.pseudo}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                </div>
                <h3 className='containerMyAccount__content__title__article'>Mes Articles</h3>
                {articles.length > 0 ? (
                    <>
                        <ul className='containerMyAccount__content__article__list'>
                            {currentArticles.map(article => (
                                <li className="containerMyAccount__content__article__list__item" key={article.idArticle}>
                                    <h4 className="containerMyAccount__content__article__list__item__title">{article.title}</h4>
                                    <img
                                        className="containerMyAccount__content__article__list__item__image"
                                        src={`http://localhost:4000/uploads/${article.image}`}
                                        alt={article.title}
                                    />
                                    <p className="containerMyAccount__content__article__list__item__content">
                                        {article.content.slice(0, 100)}{article.content.length > 100 ? '...' : ''}
                                    </p>
                                    <p className="containerMyAccount__content__article__list__item__date">
                                        {new Date(article.date).toLocaleDateString('fr-FR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                    <button
                                        className="containerMyAccount__content__article__list__item__edit"
                                        onClick={() => navigate(`/EditArticle/${article.idArticle}`)}
                                    >
                                        Modifier
                                    </button>

                                   
                                    <button
                                        className="containerMyAccount__content__article__list__item__delete"
                                        onClick={() => setArticleToDelete(article)} // Ouvre la modale
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

                   {/* Modale affichée si articleToDelete est défini */}
                {articleToDelete && (
                    <ConfirmModal
                        title="Confirmation de suppression"
                        message={`Voulez-vous vraiment supprimer l’article « ${articleToDelete.title} » ?`}
                        onConfirm={handleDelete}
                        onCancel={() => setArticleToDelete(null)}
                    />
                )}

            </div>
        </div >
    );
}

export default MyAccount;
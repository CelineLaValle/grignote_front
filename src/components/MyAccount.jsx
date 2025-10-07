import { useEffect, useState } from 'react'
import '../styles/layout/_myAccount.scss';
import '../styles/layout/_pagination.scss'
import { Link, useNavigate } from 'react-router-dom';
import Pagination from './Pagination';
import { useLocation } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';
import { API_URL } from '../config';


function MyAccount() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [articles, setArticles] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const articlesPerPage = 5;
    const location = useLocation();
    const [message, setMessage] = useState(null);
    const [articleToDelete, setArticleToDelete] = useState(null);

    // Récupérer l'utilisateur connecté et ses articles
    useEffect(() => {
        fetch(`${API_URL}/auth/me`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                setUser(data.user); // Stocke l'utilisateur
                return fetch(`${API_URL}/article/user/${data.user.idUser}`);
            })
            .then(res => res.json())
            .then(data => {
                setArticles(data); // Stocke les articles de l'utilisateur
            })
            .catch(err => console.error('Erreur chargement données:', err));
    }, []);

    // Affiche un message de confirmation ou d’information envoyé depuis une autre page (modification)
    useEffect(() => {
        if (location.state?.message) {
            setMessage(location.state.message);
            setTimeout(() => setMessage(null), 5000);
        }
    }, [location.state]);


    // Si pas connecté, message et bouton pour se connecter
    if (!user) {
        return (
            <div className='myAccount'>
                <div className='myAccount__login'>
                    <p>Vous devez être connecté pour accéder à votre compte.</p>
                </div>
                <div className='buttonMyAccount'>
                    <Link to='/login' className='buttonMyAccount__link'>Se connecter</Link>
                </div>
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

    // Supprime un article après confirmation
    const handleDelete = async () => {
        if (!articleToDelete) return;
        try {
            const response = await fetch(`${API_URL}/article/${articleToDelete.idArticle}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Erreur lors de la suppression de l\'article');
            }

            // Mise à jour du state pour retirer l'article
            setArticles(prev => prev.filter(a => a.idArticle !== articleToDelete.idArticle));
            setMessage({ text: 'Article supprimé avec succès !', type: 'success' });
            setTimeout(() => setMessage(null), 5000);
        } catch (error) {
            console.error('Erreur suppression:', error);
            setMessage({ text: "Échec de la suppression : " + error.message, type: 'error' });
            setTimeout(() => setMessage(null), 5000);
        } finally {
            setArticleToDelete(null); // Ferme la modale
        }
    };


    return (
        <div className='containerMyAccount'>
            <div className='containerMyAccount__content'>


                {/* Message dynamique */}
                {message && (
                    <div className={message.type === 'error' ? 'error-message' : 'success-message'}>
                        {message.text}
                    </div>
                )}

                <h2 className='containerMyAccount__content__title'>Mon Compte</h2>

                <section className='containerMyAccount__content__userInfo'>
                    <p><strong>Pseudo:</strong> {user.pseudo}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                </section>
                <section className='containerMyAccount__content__article__list__item__separator'></section>
                <h3 className='containerMyAccount__content__article'>Mes Articles</h3>
                {articles.length > 0 ? (
                    <>
                        <ul className='containerMyAccount__content__article__list'>
                            {currentArticles.map(article => (
                                <li className='containerMyAccount__content__article__list__item' key={article.idArticle}>
                                    <h4 className='containerMyAccount__content__article__list__item__title'>{article.title}</h4>
                                    <img
                                        className='containerMyAccount__content__article__list__item__image'
                                        src={article.image}
                                        alt={article.title}
                                    />
                                    <p className='containerMyAccount__content__article__list__item__content'>
                                        {article.content.slice(0, 100)}{article.content.length > 100 ? '...' : ''}
                                    </p>
                                    <p className='containerMyAccount__content__article__list__item__date'>
                                        {new Date(article.date).toLocaleDateString('fr-FR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                    <button
                                        className='containerMyAccount__content__article__list__item__edit'
                                        onClick={() => navigate(`/EditArticle/${article.idArticle}`)}
                                    >
                                        Modifier
                                    </button>


                                    <button
                                        className='containerMyAccount__content__article__list__item__delete'
                                        onClick={() => setArticleToDelete(article)}
                                    >
                                        Supprimer
                                    </button>
                                    <div className='containerMyAccount__content__article__list__item__separator'></div>
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
                        title='Confirmation de suppression'
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
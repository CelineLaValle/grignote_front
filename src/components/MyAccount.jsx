import React, { useEffect, useState } from 'react'
import '../styles/layout/_myaccount.scss';
import Pagination from './Pagination';

function MyAccount() {
    const [user, setUser] = useState(null);
    const [articles, setArticles] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const articlesPerPage = 5;

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
            .then(data => {
                setArticles(data); // ici on stocke les articles
            })
            .catch(err => console.error('Erreur:', err));
    }, []);



    if (!user) {
        return <div>Chargement des informations utilisateur...</div>;
    }

    // Pagination
    const indexOfLastArticle = currentPage * articlesPerPage;
    const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
    const currentArticles = articles.slice(indexOfFirstArticle, indexOfLastArticle);
    const totalPages = Math.ceil(articles.length / articlesPerPage);

    const nextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const prevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };


    return (
        <div className='containerAccount'>
            <div className='my-account'>
                <h2>Mon Compte</h2>
                <div className='user-info'>
                    <p><strong>Pseudo:</strong> {user.pseudo}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                </div>
                <h3>Mes Articles</h3>
                {articles.length > 0 ? (
                    <>
                        <ul className='article-list'>
                            {articles.map(article => (
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
                                    <button className="article-edit">Modifier</button>
                                    <button className="article-delete">Supprimer</button>
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
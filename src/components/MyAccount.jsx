import React, { useEffect, useState } from 'react'

function MyAccount() {
    const [user, setUser] = useState(null);
    const [articles, setArticles] = useState([]);

    useEffect(() => {
    fetch('http://localhost:4000/auth/me', {
        credentials: 'include'
    })
        .then(res => res.json())
        .then(data => {
            setUser(data.user); // ici on stocke l'utilisateur
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
    return (
        <div className='my-compte'>
            <h2>Mon Compte</h2>
            <div className='user-info'>
                <p><strong>Pseudo:</strong> {user.pseudo}</p>
                <p><strong>Email:</strong> {user.email}</p>
            </div>
            <h3>Mes Articles</h3>
            {articles.length > 0 ? (
                <ul className='article-list'>
                    {articles.map(article => (
                        <li key={article.idArticle}>
                            <h4>{article.title}</h4>
                            <p>{article.content}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Aucun article trouvé.</p>
            )}
        </div>
    );
}

export default MyAccount;
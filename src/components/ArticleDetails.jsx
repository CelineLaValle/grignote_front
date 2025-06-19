import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// import '../styles/Add.css'

function ArticleDetails() {
    const { id } = useParams(); // Récupérer l'ID depuis l'URL
    const [article, setArticle] = useState(null); // État pour l'article

    // Fonction pour récupérer l'article depuis le backend
    useEffect(() => {
        async function fetchArticle() {
            try {
                const response = await fetch(`http://localhost:4000/api/article/${id}`);
                if (!response.ok) {
                    throw new Error("Erreur lors de la récupération de l'article");
                }
                const data = await response.json();
                setArticle(data);
            } catch (error) {
                console.error('Erreur :', error);
            }
        }

        fetchArticle();
    }, [id]);

    if (!article) {
        return <div>Chargement...</div>; // Message de chargement
    }

    return (
        <div className='articleForm'>
            <h2 className='articleTitre articlePolice'>{article.title}</h2>
            <p className='articleContenu textPolice'>{article.content}</p>
        </div>
    );
}

export default ArticleDetails;
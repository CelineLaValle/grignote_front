import React, { useEffect, useState } from 'react'
import '../styles/layout/_accueilpage.scss'
import '../styles/layout/_pagination.scss'
import { Link } from 'react-router-dom'
import Pagination from './Pagination';


function AccueilPage() {

  const [articles, setArticles] = useState([])
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 4;



  // Fonction qui retourne les articles
async function getWorks() {
  try {
    const response = await fetch('http://localhost:4000/article');
    if (!response.ok) throw new Error(`Erreur serveur: ${response.status}`);
    
    const data = await response.json();
    console.log('Données récupérées :', data);

    setArticles(Array.isArray(data) ? data : Array.isArray(data.articles) ? data.articles : []);
  } catch (err) {
    console.error(err);
    setArticles([]); // fallback
  }
}

  useEffect(() => {
    getWorks();
  }, []);

  // Calcul des articles actuels
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = (Array.isArray(articles) ? articles : []).slice(
    indexOfFirstArticle,
    indexOfLastArticle
  );
  const totalPages = Math.ceil((Array.isArray(articles) ? articles : []).length / articlesPerPage);


  // Gestion de la page suivante
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Gestion de la page précédente
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // async function deleteArticle(articleId) {
  //   try {
  //     const response = await fetch(`http://localhost:4000/api/article/${articleId}`, {
  //       method: 'DELETE',
  //     });
  //     if (!response.ok) {
  //       throw new Error('Erreur lors de la suppression de l\'article');
  //     }
  //     // Rafraîchir la liste des articles après la suppression
  //     getWorks(); 
  //   } catch (error) {
  //     console.error('Erreur:', error);
  //   }
  // }


  return (
    <div className='container'>
      <h2 className='container__title'>Articles</h2>
      <div className='articlesContainer'>
        <article className='articlesContainer__article'>
          {currentArticles.map(item => (
            <div className='articlesContainer__article__div' key={item.idArticle}>
              <div className='articlesContainer__article__div__card'>
                <span className='articlesContainer__article__div__card__title'>{item.title}</span>
                {/* Affichage de l'image si elle existe */}
                {item.image && <img src={`http://localhost:4000/uploads/${item.image}`} alt={item.title} className="articlesContainer__article__div__card__image" />}




                <Link to={`/article/${item.idArticle}`} className='fullLink'></Link>
                <span className="articleContent">{item.content}</span>

                {/* Affichage de la catégorie */}
                <div className='articleCategory'>{item.category}</div>
              </div>
            </div>
          ))}
        </article>
      </div>
      <div className='containerButton'>
        <Link to="/AddArticle" className='containerButton__link'>Ajouter une recette</Link>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        nextPage={nextPage}
        prevPage={prevPage}
      />
    </div>
  )

}

export default AccueilPage


// <div className='buttonContainer'>
// <Link to={`/article/${item._id}`} className='articleButton'>Lire</Link>
// <button className='articleButton' onClick={() => deleteArticle(item._id)}>Supprimer</button>
// <Link to={`/edit/${item._id}`} className='articleButton'>Modifier</Link>
// </div>
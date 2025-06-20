import React, { useEffect, useState } from 'react'
import '../styles/layout/_accueilpage.scss'
import { Link } from 'react-router-dom'
import Pagination from './Pagination';


function AccueilPage() {

 const [articles, setArticles] = useState([])  
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 4;



  // Fonction qui retourne les articles
  async function getWorks() {

    const response = await fetch('http://localhost:4000/api/article');
    const data = await response.json();
    console.log('Données récupérées :', data);
    setArticles(data);
    if (!response.ok) {
      throw new Error(`Erreur de serveur: ${response.status}`);
    }
  }

  useEffect(() => {
    getWorks();
  }, []);

    // Calcul des articles actuels
    const indexOfLastArticle = currentPage * articlesPerPage;
    const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
    const currentArticles = articles.slice(indexOfFirstArticle, indexOfLastArticle);
    const totalPages = Math.ceil(articles.length / articlesPerPage);
  
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
    <div className='containerAccueil'>
      <h2 className='titleArticle'>Articles</h2>
<div className='articlesContainer'>
  <article className='articles'>
    {currentArticles.map(item => (
      <div className='articleDiv' key={item._id}>
        <div className='cardArticle'>
        <span className='articleTitle'>{item.title}</span>
            {/* Affichage de l'image si elle existe */}
    {item.image && <img src={`http://localhost:4000/uploads/${item.image}`} alt={item.title} className="articleImage" />}




          <Link to={`/article/${item._id}`} className='fullLink'></Link>
          <span className="articleContent">{item.content}</span>

            {/* Affichage de la catégorie */}
    <div className='articleCategory'>{item.category}</div>
          </div>
      </div>
    ))}
  </article>
</div>
      <div className='containerButton'>
        <Link to="/AddArticle" className='addButton'>Ajouter un article</Link>
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
import { useEffect, useState } from 'react'
import '../styles/layout/_accueilPage.scss'
import '../styles/layout/_pagination.scss'
import { Link } from 'react-router-dom'
import { useFilters } from './FilterContext';
import Pagination from './Pagination';
import { API_URL } from '../config'; 

function AccueilPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 4;

  // Utilisation du contexte de filtres
  const { applyFilters, selectedCategory, selectedTags } = useFilters();

  // Fonction qui retourne les articles
  const getWorks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/article`);
      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des données: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
      
      
      setArticles(data);
    } catch (err) {
      console.error('Erreur lors du chargement des articles:', err);
      setError(err.message);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getWorks();
  }, []);

  // Appliquer les filtres aux articles
  const filteredArticles = applyFilters(articles);

  // Réinitialiser la page courante quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedTags]);

  // Calcul des articles actuels (après filtrage)
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = filteredArticles.slice(indexOfFirstArticle, indexOfLastArticle);
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);

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

  return (
    <div className='containerFilter'>
      <h2 className='containerFilter__title'>
        Articles 
        {(selectedCategory || selectedTags.length > 0) && (
          <span className='containerFilter__indicator'>
            ({filteredArticles.length} résultat{filteredArticles.length > 1 ? 's' : ''})
          </span>
        )}
      </h2>

    {/* Si erreur */}
    {error && (
      <div className='error'>
        <p>Erreur lors du chargement des articles : {error}</p>
        <button onClick={getWorks}>Réessayer</button>
      </div>
    )}

      {/* Si aucun résultat avec filtres */}
      {filteredArticles.length === 0 && articles.length > 0 && (
        <div className='containerFilter__noResults'>
          <p>Aucun article ne correspond aux filtres sélectionnés.</p>
        </div>
      )}

      {/* Affichage des articles */}
      {filteredArticles.length > 0 && (
        <div className='articlesContainer'>
          <article className='articlesContainer__article'>
            {currentArticles.map(item => (
              <div className='articlesContainer__article__div' key={item.idArticle}>
                <div className='articlesContainer__article__div__card'>
                  <h3 className='articlesContainer__article__div__card__title'>{item.title}</h3>
                  
                  {/* Affichage de l'image si elle existe */}
                  {item.image && (
                    <img 
                      src={`${API_URL}/uploads/${item.image}`} 
                      alt={item.title} 
                      className='articlesContainer__article__div__card__image' 
                    />
                  )}

                  <Link to={`/article/${item.idArticle}`} className='fullLink'></Link>
                  <p className='articlesContainer__article__div__card__content'>{item.content}</p>

                  {/* Affichage de la catégorie */}
                  <div className='articlesContainer__article__div__card__category'>{item.category}</div>
                  
                  {/* Affichage des tags si disponibles */}
                  {item.tags && item.tags.length > 0 && (
                    <div className='articlesContainer__article__div__card__tags'>
                      {item.tags.map((tag, index) => (
                        <span key={index} className='tag-badge'>
                          {typeof tag === 'object' ? tag.name : tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </article>
        </div>
      )}

      <div className='containerButton'>
        <Link to='/AddArticle' className='containerButton__link'>Ajouter une recette</Link>
      </div>

      {/* Affichage de la pagination seulement s'il y a des résultats */}
      {filteredArticles.length > 0 && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          nextPage={nextPage}
          prevPage={prevPage}
        />
      )}
    </div>
  );
}

export default AccueilPage;
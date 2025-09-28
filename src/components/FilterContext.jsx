// components/FilterContext.jsx
import { createContext, useState, useContext } from 'react';

const FilterContext = createContext();

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};

export const FilterProvider = ({ children }) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  // Fonction pour réinitialiser les filtres
  const resetFilters = () => {
    setSelectedCategory('');
    setSelectedTags([]);
  };

  // Fonction pour appliquer les filtres sur une liste d'articles
  const applyFilters = (articles) => {
    if (!Array.isArray(articles)) return [];

    return articles.filter(article => {
      // Filtre par catégorie
      const categoryMatch = !selectedCategory || article.category === selectedCategory;
      
      // Filtre par tags - vérifie si l'article a au moins un des tags sélectionnés
      let tagMatch = true; // Par défaut, si aucun tag sélectionné
      
      if (selectedTags.length > 0) {
        // Il faut qu'au moins un tag de l'article soit dans les tags sélectionnés
        if (!article.tags || !Array.isArray(article.tags)) {
          tagMatch = false; // L'article n'a pas de tags
        } else {
          tagMatch = article.tags.some(tag => {
            const tagId = typeof tag === 'object' ? tag.idTag : tag;
            return selectedTags.includes(tagId);
          });
        }
      }

      return categoryMatch && tagMatch;
    });
  };

  const value = {
    selectedCategory,
    setSelectedCategory,
    selectedTags,
    setSelectedTags,
    resetFilters,
    applyFilters
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
};
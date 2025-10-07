// components/FilterContext.jsx
import { createContext, useState, useContext } from 'react';

// Création du contexte pour partager les filtres dans toute l'application
const FilterContext = createContext();

// Hook personnalisé pour accéder facilement au contexte
export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters doit être utilisé dans un FilterProvider');
  }
  return context;
};

// Provider qui englobe les composants et fournit l'état des filtres
export const FilterProvider = ({ children }) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  // Fonction pour réinitialiser les filtres
  const resetFilters = () => {
    setSelectedCategory('');
    setSelectedTags([]);
  };

  // Fonction pour filtrer une liste d'articles selon la catégorie et les tags
  const applyFilters = (articles) => {
    if (!Array.isArray(articles)) return [];

    return articles.filter(article => {
      // Vérifie si l'article correspond à la catégorie sélectionnée
      const categoryMatch = !selectedCategory || article.category === selectedCategory;

      // Vérifie si l'article correspond à au moins un tag sélectionné
      let tagMatch = true; // Par défaut, si aucun tag sélectionné

      if (selectedTags.length > 0) {
        if (!article.tags || !Array.isArray(article.tags)) {
          tagMatch = false; // L'article n'a pas de tags
        } else {
          // Vérifie si l'article possède au moins un des tags choisis par l'utilisateur
          tagMatch = article.tags.some(tag => {
            const tagId = typeof tag === 'object' ? tag.idTag : tag;
            return selectedTags.includes(tagId);
          });
        }
      }

      return categoryMatch && tagMatch;
    });
  };


  // Valeurs fournies à tous les composants enfants via le contexte
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
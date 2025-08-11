import React, { useState, useEffect } from 'react';
import '../styles/layout/_add.scss';
import { useNavigate } from 'react-router-dom';


function AddArticle() {
    // Déclaration des états pour le titre et le contenu
    const navigate = useNavigate(); // Initialiser useNavigate
    const [idUser, setIdUser] = useState(null); // On crée un état pour stocker l'id de l'utilisateur connecté
    const categories = ['Entrée', 'Plat', 'Dessert'];
    const [title, setTitle] = useState('');
    const [ingredient, setIngredient] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState(categories[0]);
    const [image, setImage] = useState(null); // Fichier image


    // useEffect permet de récupérer l'idUser après que le composant ait été monté
    useEffect(() => {
        const storedId = localStorage.getItem('user'); // On récupère l'id stocké dans le localStorage
        if (!storedId) {
            // Si aucun id trouvé, on redirige vers la page de connexion
            navigate('/login');
        } else {
            // Sinon, on met à jour l'état idUser avec la valeur trouvée
            setIdUser(storedId);
        }
    }, []); // Ce code ne s'exécute qu'une seule fois au chargement du composant

    // Fonction pour gérer la soumission du formulaire
    const handleSubmit = async (e) => {
        e.preventDefault(); // Empêche le rechargement de la page

        // console.log('Valeurs envoyées :', {
        //     title,
        //     list,
        //     content,
        //     category,
        //     image
        // });

        // Vérifie que l'id de l'utilisateur est bien chargé avant de soumettre
        if (!idUser) {
            alert("Utilisateur non connecté.");
            return;
        }

        // Utilisation de FormData pour gérer texte + fichier
        const formData = new FormData();
        formData.append('title', title);
        formData.append('ingredient', ingredient);
        formData.append('content', content);
        formData.append('category', category);
        formData.append("idUser", idUser);
        if (image) {
            formData.append('image', image); // Ajoute le fichier s'il existe
        }


        // Envoi de la requête POST au backend
        try {
            const response = await fetch('http://localhost:4000/article', {
                method: 'POST',
                body: formData, // PAS besoin de Content-Type ici, le navigateur le définit
            });

            // Vérification de la réponse
            if (!response.ok) {
                throw new Error('Erreur lors de l\'envoi de l\'article');
            }

            const result = await response.json(); // Si le backend renvoie des données
            console.log('Article envoyé avec succès:', result);
            // Rediriger vers la page principale
            navigate('/');
        } catch (error) {
            console.error('Erreur:', error);
        }

        // Réinitialisation des champs du formulaire
        setTitle('');
        setIngredient('');
        setContent('');
        setCategory(categories[0]);
        setImage(null);

    };

    return (
        <div>
            <h2 className="articleH2">Ajouter</h2>
            <form className="articleForm" onSubmit={handleSubmit} encType="multipart/form-data">

                {/* Champ pour le titre */}
                <div className="articleTitre">
                    <label htmlFor="title">Titre de l'article</label>
                    <input
                        className="inputField"
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)} // Met à jour l'état du titre
                        placeholder="Entrez le titre de l'article"
                    />
                </div>

                {/* Champ pour la liste d'ingrédients */}
                <div className="listIngredients">
                    <label htmlFor="ingredient">Liste des ingrédients</label>
                    <textarea
                        className="textArea"
                        rows="20"
                        cols="33"
                        id="ingredient"
                        name="ingredient"
                        value={ingredient}
                        onChange={(e) => setIngredient(e.target.value)} // Met à jour l'état du contenu
                        placeholder="Noter les ingrédients"
                    />
                </div>

                {/* Champ pour le contenu */}
                <div className="articleContenu">
                    <label htmlFor="content">Contenu de l'article</label>
                    <textarea
                        className="textArea"
                        rows="20"
                        cols="33"
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)} // Met à jour l'état du contenu
                        placeholder="Entrez le contenu de l'article"
                    />
                </div>

                {/* Champ pour la catégorie */}
                <div className="articleCategorie">
                    <label htmlFor="category">Catégorie de l'article</label>
                    <select
                        id="category"
                        className="inputField"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        {categories.map((cat, index) => (
                            <option key={index} value={cat}>{cat}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Champ pour le fichier image */}
                <div className="articleImage">
                    <label htmlFor="image">Image de l'article</label>
                    <input
                        id="image"
                        className="inputField"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files[0])} // Récupère le fichier
                    />
                </div>


                <button className="submitButton" type="submit">Valider</button>
            </form>
        </div>
    );
}

export default AddArticle
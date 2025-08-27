import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function EditArticle() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState(null); // null = pas encore de données
    const [notFound, setNotFound] = useState(false);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetch(`http://localhost:4000/article/${id}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.message === "Article non trouvé") {
                    setNotFound(true);
                } else {
                    setArticle(data);
                }
            })
            .catch((err) => {
                console.error("Erreur :", err);
                setNotFound(true);
            });
    }, [id]);


    useEffect(() => {
        fetch("http://localhost:4000/category")
            .then((res) => res.json())
            .then((data) => setCategories(data))
            .catch((err) => console.error("Erreur categories :", err));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!article) return;

        try {
            const formData = new FormData();
            formData.append("title", article.title);
            formData.append("ingredient", article.ingredient);
            formData.append("content", article.content);
            formData.append("category", article.category);

            // Si l'image est un fichier (nouvelle image)
            if (article.image instanceof File) {
                formData.append("image", article.image);
            }

            const token = localStorage.getItem("token"); // ou récupérer d'où tu stockes ton JWT

            const response = await fetch(`http://localhost:4000/article/${id}`, {
                method: "PUT",
                headers: {
                    Authorization: token ? `Bearer ${token}` : "", // JWT
                },
                credentials: "include",
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || "Erreur lors de la mise à jour");
            }

            // Redirection avec message
            navigate("/MyAccount", { state: { message: "Article mis à jour avec succès !" } });

        } catch (error) {
            console.error(error);
            alert("Échec de la mise à jour : " + error.message);
        }
    };

    if (notFound) {
        return <p style={{ color: "red" }}>Article inexistant</p>;
    }

    if (!article) {
        return null; // on affiche rien si pas encore reçu les données
    }


    return (
        <div>
            <h2>Modifier l'article</h2>
            <form onSubmit={handleSubmit}>

                {/* Titre */}
                <input
                    type="text"
                    value={article.title}
                    onChange={(e) => setArticle({ ...article, title: e.target.value })}
                    placeholder="Titre"
                />

                {/* Ingrédients */}
                <textarea
                    value={article.ingredient}
                    onChange={(e) => setArticle({ ...article, ingredient: e.target.value })}
                    placeholder="Ingrédients"
                />

                {/* Contenu */}
                <textarea
                    value={article.content}
                    onChange={(e) => setArticle({ ...article, content: e.target.value })}
                    placeholder="Contenu"
                />

                {/* Catégorie */}
                <select
                    value={article.category}
                    onChange={(e) => setArticle({ ...article, category: e.target.value })}
                >
                    <option value="">-- Sélectionner une catégorie --</option>
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>

                {/* Image */}

                {/* Aperçu de l'image actuelle */}
                {article.image && typeof article.image === "string" && (
                    <div>
                        <p>Image actuelle :</p>
                        <img
                            src={`http://localhost:4000/uploads/${article.image}`}
                            alt="Article"
                            style={{ width: "200px", marginBottom: "10px" }}
                        />
                    </div>
                )}

                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                        setArticle({ ...article, image: e.target.files[0] })
                    }
                />

                <button type="submit">Enregistrer</button>
            </form>
        </div>
    );
}

export default EditArticle;

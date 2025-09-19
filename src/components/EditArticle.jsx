import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import '../styles/layout/_editArticle.scss';

function EditArticle() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState(null); // null = pas encore de données
    const [notFound, setNotFound] = useState(false);
    const [categories, setCategories] = useState([]);
    const [newTag, setNewTag] = useState("");
    const [tags, setTags] = useState([]); // tous les tags existants
    const [selectedTags, setSelectedTags] = useState([]); // tags de l’article

    useEffect(() => {
        fetch(`http://localhost:4000/article/${id}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.message === "Article non trouvé") {
                    setNotFound(true);
                } else {
                    setArticle(data);

                    // on coche les tags de l’article si le backend les envoie
                    if (Array.isArray(data.tags)) {
                        setSelectedTags(data.tags.map((tag) => tag.idTag));
                    }
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

    useEffect(() => {
        fetch("http://localhost:4000/tag")
            .then((res) => res.json())
            .then((data) => setTags(Array.isArray(data) ? data : []))
            .catch((err) => console.error("Erreur tags :", err));
    }, []);

    const handleTagToggle = (tagId) => {
        setSelectedTags((prev) =>
            prev.includes(tagId)
                ? prev.filter((t) => t !== tagId)
                : [...prev, tagId]
        );
    };

    // Nouvelle fonction : ajouter un tag
    const handleAddTag = async () => {
        if (!newTag.trim()) return;

        try {
            const response = await fetch("http://localhost:4000/tag", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`, // si tu utilises JWT
                },
                body: JSON.stringify({ name: newTag }),
            });

            if (!response.ok) throw new Error("Erreur lors de l’ajout du tag");

            const createdTag = await response.json();

            // Ajout immédiat dans la liste et sélection
            setTags((prev) => [...prev, createdTag]);
            setSelectedTags((prev) => [...prev, createdTag.idTag]);
            setNewTag("");
        } catch (err) {
            console.error(err);
            alert("Impossible d’ajouter le tag");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!article) return;

        try {
            const formData = new FormData();
            formData.append("title", article.title);
            formData.append("ingredient", article.ingredient);
            formData.append("content", article.content);
            formData.append("category", article.category);

            // On ajoute les tags sélectionnés
            formData.append("tags", JSON.stringify(selectedTags));

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
            navigate("/MyAccount", {
                state: {
                    message: {
                        text: "Article mis à jour avec succès !",
                        type: "success"
                    }
                }
            });

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
        <div className="articleModify">
            <h2 className="articleModify__title">Modifier l'article</h2>
            <form className="articleModify__form" onSubmit={handleSubmit}>

                {/* Titre */}
                <div className="articleModify__field">
                    <input
                        className="articleModify__input"
                        type="text"
                        value={article.title}
                        onChange={(e) => setArticle({ ...article, title: e.target.value })}
                        placeholder="Titre"
                    />
                </div>

                {/* Ingrédients */}
                <div className="articleModify__field">
                    <textarea
                        className="articleModify__textarea"
                        value={article.ingredient}
                        onChange={(e) => setArticle({ ...article, ingredient: e.target.value })}
                        placeholder="Ingrédients"
                    />
                </div>

                {/* Contenu */}
                <div className="articleModify__field">
                    <textarea
                        className="articleModify__textarea"
                        value={article.content}
                        onChange={(e) => setArticle({ ...article, content: e.target.value })}
                        placeholder="Contenu"
                    />
                </div>

                {/* Catégorie */}
                <div className="articleModify__field">
                    <select
                        className="articleModify__select"
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
                </div>
                <div className="articleModify__field">
                    <span className="articleModify__label">Tags</span>

                    {/* Tags existants */}
                    <div className="articleModify__tags">
                        {tags.map((tag) => (
                            <label key={tag.idTag} style={{ display: "block" }}>
                                <input
                                    type="checkbox"
                                    checked={selectedTags.includes(tag.idTag)}
                                    onChange={() => handleTagToggle(tag.idTag)}
                                />
                                {tag.name}
                            </label>
                        ))}
                    </div>

                    {/* Ajout d’un nouveau tag */}
                    <div className="articleModify__newTag">
                        <input
                            type="text"
                            placeholder="Ajouter un tag..."
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddTag()} // permet Enter
                        />
                        <button type="button" onClick={handleAddTag}>
                            Ajouter
                        </button>
                    </div>
                </div>

                {/* Aperçu image */}
                {article.image && (
                    <div className="articleModify__field">
                        <span className="articleModify__label">Image actuelle</span>
                        <img
                            className="articleModify__preview"
                            src={
                                typeof article.image === "string"
                                    ? `http://localhost:4000/uploads/${article.image}`
                                    : URL.createObjectURL(article.image)
                            }
                            alt="Aperçu"
                        />
                    </div>
                )}

                {/* Nouvelle image */}
                <div className="articleModify__field">
                    <label htmlFor="image" className="articleModify__label">Changer l'image</label>
                    <input
                        id="image"
                        className="articleModify__file"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setArticle({ ...article, image: e.target.files[0] })}
                    />
                    <label htmlFor="image" className="articleModify__image">Choisir une image</label>
                </div>

                <div className="articleModify__buttons">
                    <button className="articleModify__submit" type="submit">Enregistrer</button>
                </div>
            </form>
        </div>
    );
}

export default EditArticle;

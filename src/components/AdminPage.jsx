import React, { useEffect, useState } from "react";
import Pagination from "../components/Pagination";

function AdminPage() {
    const [activeTab, setActiveTab] = useState("user");
    const [users, setUsers] = useState([]);
    const [articles, setArticles] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Pagination
    const totalPages =
        activeTab === "user"
            ? Math.ceil(users.length / itemsPerPage)
            : Math.ceil(articles.length / itemsPerPage);

    const currentItems =
        activeTab === "user"
            ? users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
            : articles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);


    // Récupération des utilisateurs
    useEffect(() => {
        fetch("http://localhost:4000/user")
            .then((res) => res.json())
            .then((data) => setUsers(data))
            .catch((err) => console.error("Erreur chargement utilisateurs :", err));
    }, []);

    const toggleSuspend = async (idUser) => {
        try {
            const response = await fetch(
                `http://localhost:4000/user/suspend/${idUser}`,
                {
                    method: "PATCH",
                    credentials: "include",
                }
            );

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            // Mise à jour dans le state
            setUsers((prev) =>
                prev.map((u) =>
                    u.idUser === idUser ? { ...u, suspended: data.suspended } : u
                )
            );
        } catch (err) {
            console.error(err);
            alert("Erreur lors de la mise à jour : " + err.message);
        }
    };

    // Récupération des articles
    useEffect(() => {
        fetch("http://localhost:4000/article")
            .then((res) => res.json())
            .then((data) => setArticles(data))
            .catch((err) => console.error("Erreur chargement articles :", err));
    }, []);

    return (
        <div className="admin">
            <div className="admin__content">
                <h2 className="admin__title">Tableau de bord Admin</h2>

                {/* Onglets */}
                <div className="admin__tabs">
                    <button
                        className={`admin__tab ${activeTab === "user" ? "active" : ""}`}
                        onClick={() => setActiveTab("user")}
                    >
                        Utilisateurs
                    </button>
                    <button
                        className={`admin__tab ${activeTab === "article" ? "active" : ""}`}
                        onClick={() => setActiveTab("article")}
                    >
                        Articles
                    </button>
                </div>

                {/* Contenu onglet Users */}
                {activeTab === "user" && (
                    <ul className="admin__list">
                        {currentItems.map(user => (
                            <li className="admin__list__item" key={user.idUser}>
                                <p>
                                    <strong>Pseudo:</strong> {user.pseudo} <br />
                                    <strong>Email:</strong> {user.email}
                                </p>
                                <button className="admin__list__item__edit">Modifier</button>
                                <button className="admin__list__item__delete">Supprimer</button>
                                <button onClick={() => toggleSuspend(user.idUser)}>
                                    {user.suspended ? "Réactiver" : "Suspendre"}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                {/* Contenu onglet Articles */}
                {activeTab === "article" && (
                    <ul className="admin__list">
                        {currentItems.map(article => (
                            <li className="admin__list__item" key={article.idArticle}>
                                <h4>{article.title}</h4>
                                <img
                                    src={`http://localhost:4000/uploads/${article.image}`}
                                    alt={article.title}
                                    className="admin__list__item__image"
                                />
                                <p>{article.content?.slice(0, 100)}...</p>
                                <button className="admin__list__item__edit">Modifier</button>
                                <button className="admin__list__item__delete">Supprimer</button>
                            </li>
                        ))}
                    </ul>
                )}

                {/* Pagination */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    nextPage={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    prevPage={() => setCurrentPage(p => Math.max(p - 1, 1))}
                />
            </div>
        </div>
    );
}

export default AdminPage;
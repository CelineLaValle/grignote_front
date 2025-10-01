import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Pagination from './Pagination';
import ConfirmModal from './ConfirmModal';
import '../styles/layout/_adminPage.scss';
import { API_URL } from '../config'; 


function AdminPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('user');
    const [users, setUsers] = useState([]);
    const [articles, setArticles] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [actionToConfirm, setActionToConfirm] = useState(null);
    const itemsPerPage = 5;
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(true);

    
    // Récupérer l'onglet actif depuis l'état de navigation
    const location = useLocation();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch(`${API_URL}/auth/me`, {
                    method: 'GET',
                    credentials: 'include',
                });
                if (!res.ok) throw new Error('Non authentifié');
                const data = await res.json();

                if (data.user.role !== 'admin') {
                    navigate('/login'); // Redirection si pas admin
                } else {
                    setLoading(false);
                }
            } catch (err) {
                console.error('Erreur auth:', err);
                navigate("/login");
            }
        };

        checkAuth();
    }, [navigate]);

    
    useEffect(() => {
        // Si un onglet actif est spécifié dans l'état, l'utiliser
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab);
        }
        
        // Récupérer le message s'il existe
        if (location.state?.message) {
            setMessage(location.state.message);
            setTimeout(() => setMessage(null), 5000); // disparaît après 5s
        }
    }, [location.state]);
    // Pagination
    const totalPages =
        activeTab === 'user'
            ? Math.ceil(users.length / itemsPerPage)
            : Math.ceil(articles.length / itemsPerPage);

    const currentItems =
        activeTab === 'user'
            ? users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
            : articles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);


    // Récupération des utilisateurs
    useEffect(() => {
        fetch(`${API_URL}/user`)
            .then((res) => res.json())
            .then((data) => setUsers(data))
            .catch((err) => console.error('Erreur chargement utilisateurs:', err));
    }, []);


    // Récupération des articles
    useEffect(() => {
        fetch(`${API_URL}/article`)
            .then((res) => res.json())
            .then((data) => setArticles(data))
            .catch((err) => console.error('Erreur chargement articles:', err));
    }, []);

    // Fonction qui s’exécute après confirmation
    const handleConfirmAction = async () => {
        if (!actionToConfirm) return;

        try {
            if (actionToConfirm.type === 'deleteUser') {
                const res = await fetch(`${API_URL}/user/${actionToConfirm.item.idUser}`, {
                    method: 'DELETE',
                    credentials: 'include',
                });
                if (!res.ok) throw new Error('Erreur suppression utilisateur');
                setUsers(prev => prev.filter(u => u.idUser !== actionToConfirm.item.idUser));
                setMessage({ text: 'Utilisateur supprimé avec succès !', type: 'success' });
                setTimeout(() => setMessage(null), 5000);
            }

            if (actionToConfirm.type === 'suspendUser') {
                const res = await fetch(`${API_URL}/user/suspend/${actionToConfirm.item.idUser}`, {
                    method: 'PATCH',
                    credentials: 'include',
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message);
                setUsers(prev =>
                    prev.map(u =>
                        u.idUser === actionToConfirm.item.idUser
                            ? { ...u, suspended: data.suspended }
                            : u
                    )
                );
                setMessage({ 
                    text: data.suspended ? 
                        `L'utilisateur ${actionToConfirm.item.pseudo} a été suspendu` : 
                        `L'utilisateur ${actionToConfirm.item.pseudo} a été réactivé`, 
                    type: 'success' 
                });
                setTimeout(() => setMessage(null), 5000);
            }

            if (actionToConfirm.type === 'deleteArticle') {
                const res = await fetch(`${API_URL}/article/${actionToConfirm.item.idArticle}`, {
                    method: 'DELETE',
                    credentials: 'include',
                });
                if (!res.ok) throw new Error('Erreur lors de la suppression de l\'article');
                setArticles(prev => prev.filter(a => a.idArticle !== actionToConfirm.item.idArticle));
                setMessage({ text: 'Article supprimé avec succès !', type: 'success' });
                setTimeout(() => setMessage(null), 5000);
            }
        } catch (err) {
            console.error('Erreur suspension utilisateur:', err);
        } finally {
            setActionToConfirm(null); // Ferme la modale
        }
    };

    return (
        <div className='admin'>
            <div className='admin__content'>
                <h2 className='admin__title'>Tableau de bord Admin</h2>

                {/* Message dynamique */}
                {message && (
                    <div className={message.type === 'error' ? 'error-message' : 'success-message'}>
                        {message.text}
                    </div>
                )}

                {/* Onglets */}
                <div className='admin__tabs'>
                    <button
                        className={`admin__tabs__tab ${activeTab === 'user' ? 'active' : ''}`}
                        onClick={() => setActiveTab('user')}
                    >
                        Utilisateurs
                    </button>
                    <button
                        className={`admin__tabs__tab ${activeTab === 'article' ? 'active' : ''}`}
                        onClick={() => setActiveTab('article')}
                    >
                        Articles
                    </button>
                </div>

                {/* Contenu onglet Users */}
                {activeTab === 'user' && (
                    <ul className='admin__list'>
                        {currentItems.map(user => (
                            <li className='admin__list__item' key={user.idUser}>
                                <p className='admin__list__item__info'>
                                    <strong>Pseudo:</strong> {user.pseudo} <br />
                                    <strong>Email:</strong> {user.email}
                                </p>
                                <div className='admin__list__item__buttons'>
                                    <button 
                                        className='admin__list__item__edit'
                                        onClick={() => navigate(`/EditUser/${user.idUser}`, { state: { from: 'AdminPage', tab: 'user' } })}>
                                        Modifier
                                    </button>

                                    <button
                                        className='admin__list__item__delete'
                                        onClick={() =>
                                            setActionToConfirm({ type: 'deleteUser', item: user })
                                        }
                                    >
                                        Supprimer
                                    </button>

                                    <button
                                        className='admin__list__item__suspend'
                                        onClick={() =>
                                            setActionToConfirm({ type: 'suspendUser', item: user })
                                        }
                                    >
                                        {user.suspended ? 'Réactiver' : 'Suspendre'}
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                {/* Contenu onglet Articles */}
                {activeTab === 'article' && (
                    <ul className='admin__list'>
                        {currentItems.map(article => (
                            <li className='admin__list__item' key={article.idArticle}>
                                <h4 className='admin__list__item__title'>{article.title}</h4>
                                <img
                                    src={article.image}
                                    alt={article.title}
                                    className='admin__list__item__image'
                                />
                                <p className='admin__list__item__content'>{article.content?.slice(0, 100)}...</p>
                                <div className='admin__list__item__buttons'>
                                    <button className='admin__list__item__edit'
                                            onClick={() => navigate(`/EditArticle/${article.idArticle}`, { state: { from: 'AdminPage', tab: 'article' } })}>
                                            Modifier
                                            </button>
                                    <button
                                        className='admin__list__item__delete'
                                        onClick={() =>
                                            setActionToConfirm({ type: 'deleteArticle', item: article })
                                        }
                                    >
                                        Supprimer
                                    </button>
                                </div>
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

                {/* Modale de confirmation */}
                {actionToConfirm && (
                    <ConfirmModal
                        title='Confirmation'
                        message={
                            actionToConfirm.type === 'deleteUser'
                                ? `Voulez-vous vraiment supprimer l'utilisateur '${actionToConfirm.item.pseudo}' ?`
                                : actionToConfirm.type === 'suspendUser'
                                    ? `Voulez-vous vraiment ${actionToConfirm.item.suspended ? 'réactiver' : 'suspendre'
                                    } '${actionToConfirm.item.pseudo}' ?`
                                    : `Voulez-vous vraiment supprimer l'article '${actionToConfirm.item.title}' ?`
                        }
                        onConfirm={handleConfirmAction}
                        onCancel={() => setActionToConfirm(null)}
                    />
                )}


            </div>
        </div>
    );
}

export default AdminPage;
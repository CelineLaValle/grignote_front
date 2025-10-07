import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import '../styles/layout/_editUser.scss';
import { API_URL } from '../config';

function EditUser() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Récupérer la page d'origine depuis l'état de navigation (permet de rester dans l'onglet Articles si l'on modifie un article)
    const fromPage = location.state?.from || 'AdminPage';


    // Vérifie que l'utilisateur connecté est bien admin
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

    // Récupère les informations de l'utilisateur à modifier
    useEffect(() => {
        fetch(`${API_URL}/user/${id}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.message === 'Utilisateur non trouvé') {
                    navigate('/not-found'); // Redirection vers une page 404
                } else {
                    setUser(data);
                }
            })
            .catch((err) => {
                console.error('Erreur :', err);
                navigate('/NotFound'); // Redirige vers la page 404 si l'utilisateur n'existe pas
            });
    }, [id, navigate]);


    // Fonction pour envoyer les modifications au backend
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;

        try {
            const response = await fetch(`${API_URL}/user/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    pseudo: user.pseudo,
                    email: user.email,
                    role: user.role
                }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Erreur lors de la mise à jour');
            }

            // Redirection avec message et conservation de l'onglet actif
            const tab = location.state?.tab || '';
            navigate(`/${fromPage}${tab ? `?tab=${tab}` : ''}`, {
                state: {
                    message: {
                        text: 'Utilisateur mis à jour avec succès !',
                        type: 'success'
                    },
                    activeTab: tab
                }
            });

        } catch (error) {
            console.error(error);
        }
    };

    if (!user) {
        return null; // On affiche rien si pas encore reçu les données
    }

    return (
        <div className='userModify'>
            <h2 className='userModify__title'>Modifier l'utilisateur</h2>
            <form className='userModify__form' onSubmit={handleSubmit}>

                {/* Pseudo */}
                <div className='userModify__field'>
                    <label className='userModify__label'>Pseudo</label>
                    <input
                        className='userModify__input'
                        type='text'
                        value={user.pseudo}
                        onChange={(e) =>
                            setUser({
                                ...user, pseudo: e.target.value.replace(/[^a-zA-ZÀ-ÿ0-9 _-]/g, '')
                            })
                        }
                        placeholder='Pseudo'
                    />
                </div>

                {/* Email */}
                <div className='userModify__field'>
                    <label className='userModify__label'>Email</label>
                    <input
                        className='userModify__input'
                        type='email'
                        value={user.email}
                        onChange={(e) => setUser({ ...user, email: e.target.value })}
                        placeholder='Email'
                    />
                </div>

                {/* Rôle */}
                <div className='userModify__field'>
                    <label className='userModify__label'>Rôle</label>
                    <select
                        className='userModify__select'
                        value={user.role}
                        onChange={(e) => setUser({ ...user, role: e.target.value })}
                    >
                        <option value='user'>Utilisateur</option>
                        <option value='admin'>Administrateur</option>
                    </select>
                </div>

                <div className='userModify__buttons'>
                    <button
                        className='userModify__cancel'
                        type='button'
                        onClick={() => navigate(`/${fromPage}`, {
                            state: { activeTab: location.state?.tab || 'user' }
                        })}
                    >
                        Annuler
                    </button>
                    <button className='userModify__submit' type='submit'>Enregistrer</button>
                </div>
            </form>
        </div>
    );
}

export default EditUser;
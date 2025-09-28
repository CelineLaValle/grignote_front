import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import '../styles/layout/_editUser.scss';

function EditUser() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [notFound, setNotFound] = useState(false);
    // Récupérer la page d'origine depuis l'état de navigation
    const fromPage = location.state?.from || 'AdminPage';

    useEffect(() => {
        fetch(`http://localhost:4000/user/${id}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.message === 'Utilisateur non trouvé') {
                    setNotFound(true);
                } else {
                    setUser(data);
                }
            })
            .catch((err) => {
                console.error('Erreur :', err);
                setNotFound(true);
            });
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;

        try {
            const response = await fetch(`http://localhost:4000/user/${id}`, {
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
        return null; // on affiche rien si pas encore reçu les données
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
                            setUser({ ...user, pseudo: e.target.value.replace(/[^a-zA-ZÀ-ÿ0-9 _-]/g, '')
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
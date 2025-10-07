import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Permet de rediriger après connexion
import '../styles/layout/_account.scss';
import { API_URL } from '../config';


function Login() {
    // On initialise des états pour stocker les champs du formulaire
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate(); // Permet de rediriger vers une autre page
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');


    // Fonction appelée lors de la soumission du formulaire
    const handleLogin = async (e) => {
        e.preventDefault(); // Empêche le rechargement de la page

        try {
            // On envoie la requête POST au backend avec email et mot de passe
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // On envoie du JSON
                },
                credentials: 'include', // On envoie le cookie avec la requête
                body: JSON.stringify({ email, password }) // Envoi les données dans le body sous format json
            });

            const data = await response.json(); // On récupère la réponse du serveur

            // Si la réponse n'est pas OK (ex: mauvais mot de passe), on affiche une erreur
            if (!response.ok) {
                throw new Error(data.message || 'Erreur de connexion');
            }

            navigate('/');
            window.location.reload(); // Pour recharger la page et mettre à jour l'état de l'application
        } catch (error) {
            console.error('Erreur de connexion:', error);
            setMessage('Connexion échouée : ' + error.message);
            setMessageType('error');
        }
    };

    return (
        <div className='containerAccount'>
            {message && (
                <div className={`message ${messageType}`}>
                    {message}
                </div>
            )}
            <h2 className='containerAccount__title'>Connexion</h2>
            <form onSubmit={handleLogin} className='containerAccount__form'>
                {/* Champ pour l'email */}
                <label htmlFor='email'>Email :</label>
                <input
                    type='email'
                    id='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} // Met à jour l'état
                    required
                />

                {/* Champ pour le mot de passe */}
                <label htmlFor='password'>Mot de passe :</label>
                <input
                    type='password'
                    id='password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} // Met à jour l'état
                    required
                />

                {/* Bouton de soumission */}
                <button className='accountButton' type='submit'>Se connecter</button>
            </form>

            <p>Pas encore de compte ?</p>
            <button className='accountButton' onClick={() => navigate('/register')}>S’inscrire</button>

        </div>
    );
}

export default Login;
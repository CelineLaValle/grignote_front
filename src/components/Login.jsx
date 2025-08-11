import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Permet de rediriger après connexion

function Login() {
    // On initialise des états pour stocker les champs du formulaire
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate(); // Permet de rediriger vers une autre page

    // Fonction appelée lors de la soumission du formulaire
    const handleLogin = async (e) => {
        e.preventDefault(); // Empêche le rechargement de la page

        try {
            // On envoie la requête POST au backend avec email et mot de passe
            const response = await fetch('http://localhost:4000/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // On envoie du JSON
                },
                credentials: 'include', // Pour inclure les cookies (comme le token JWT)
                body: JSON.stringify({ email, password }) // Corps de la requête = données du formulaire
            });

            const data = await response.json(); // On récupère la réponse du serveur (idUser, message, etc.)
            console.log('Login response:', data);
            // Si la réponse n'est pas OK (ex: mauvais mot de passe), on affiche une erreur
            if (!response.ok) {
                throw new Error(data.message || "Erreur de connexion");
            }

            // Si la connexion est réussie :
            // On stocke l'ID de l'utilisateur dans le localStorage (permet de s'en servir ailleurs)
            localStorage.setItem('user', JSON.stringify(data.user));// Assure-toi que backend renvoie bien `user.idUser`


            // On redirige vers la page d'acceuil'
            navigate('/');
            window.location.reload(); // Pour recharger la page et mettre à jour l'état de l'application
        } catch (error) {
            console.error('Erreur de connexion:', error);
            alert('Connexion échouée : ' + error.message);
        }
    };

    return (
        <div className="login-container">
            <h2>Connexion</h2>
            <form onSubmit={handleLogin} className="login-form">
                {/* Champ pour l'email */}
                <label htmlFor="email">Email :</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} // Met à jour l'état
                    required
                />

                {/* Champ pour le mot de passe */}
                <label htmlFor="password">Mot de passe :</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} // Met à jour l'état
                    required
                />

                {/* Bouton de soumission */}
                <button type="submit">Se connecter</button>
            </form>
        </div>
    );
}

export default Login;
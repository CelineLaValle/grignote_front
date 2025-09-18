import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/layout/_account.scss';
function Register() {
    const [pseudo, setPseudo] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setMessage("Les mots de passe ne correspondent pas");
            setMessageType("error");
            return;
        }


        // Vérif pseudo (côté front)
        const pseudoRegex = /^[a-zA-Z0-9_-]{3,20}$/;
        if (!pseudoRegex.test(pseudo)) {
            setMessage("Le pseudo doit faire entre 3 et 20 caractères et contenir uniquement lettres, chiffres, _ ou -.");
            setMessageType("error");
            return;
        }

        try {
            const response = await fetch('http://localhost:4000/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ pseudo, email, password })
            });

            const data = await response.json();
            console.log('Register response:', data);

            if (!response.ok) {
                throw new Error(data.message || "Erreur d'inscription");
            }

            setTimeout(() => {
                navigate('/login', {
                    state: {
                        message: "Confirmez votre inscription en cliquant sur le lien envoyé par mail.",
                        messageType: "success"
                    }
                });
            }, 2000);
        } catch (error) {
            console.error("Erreur d'inscription:", error);
            setMessage("Inscription échouée : " + error.message);
            setMessageType("error");
        }
    };

    return (
        <div className="containerAccount">
            <h2 className='containerAccount__title'>Inscription</h2>
            <form className='containerAccount__form' onSubmit={handleRegister}>
                <label htmlFor="pseudo">Pseudo :</label>
                <input
                    type="text"
                    id="pseudo"
                    value={pseudo}
                    onChange={(e) => setPseudo(e.target.value)}
                    required
                    minLength={3}
                    maxLength={20}
                    pattern="^[a-zA-Z0-9_\-]+$"
                    title="Le pseudo doit contenir uniquement des lettres, chiffres, _ ou -"
                />

                <label htmlFor="email">Email :</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <label htmlFor="password">Mot de passe :</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <label htmlFor="confirmPassword">Confirmer le mot de passe :</label>
                <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />

                <button className='accountButton' type="submit">S’enregistrer</button>
            </form>

            <p>Déjà un compte ?</p>
            <button className='accountButton' onClick={() => navigate('/login')}>Se connecter</button>
        </div>
    );
}

export default Register;

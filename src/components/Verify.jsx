import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { API_URL } from '../config';

function Verify() {
    const [searchParams] = useSearchParams();
    const [message, setMessage] = useState('');


    // Vérifie le token de vérification depuis l'URL et récupère le message du serveur
    useEffect(() => {
        const token = searchParams.get('token'); // Récupère le token depuis l'URL
        if (!token) {
            setMessage("Lien de vérification invalide."); // Message si pas de token
            return;
        }
        fetch(`${API_URL}/verify?token=${token}`)
            .then(res => res.json())
            .then(data => {
                setMessage(data.message || "Votre compte a été vérifié !"); // Affiche le message du serveur
            })
            .catch(() => setMessage("Erreur lors de la vérification."));
    }, [searchParams]);
    return (
        <section>
            <h2>Vérification du compte</h2>
            <p>{message}</p>
        </section>
    );
}
export default Verify;
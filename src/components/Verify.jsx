import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { API_URL } from '../config';

function Verify() {
    const [searchParams] = useSearchParams();
    const [message, setMessage] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setMessage("Lien de vérification invalide.");
            return;
        }
        fetch(`${API_URL}/verify?token=${token}`)
            .then(res => res.json())
            .then(data => {
                setMessage(data.message || "Votre compte a été vérifié !");
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
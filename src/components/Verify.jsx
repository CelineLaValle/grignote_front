import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

function Verify() {
    const [searchParams] = useSearchParams();
    const [message, setMessage] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setMessage("Lien de vérification invalide.");
            return;
        }
        fetch(`http://localhost:4000/verify?token=${token}`)
            .then(res => res.json())
            .then(data => {
                setMessage(data.message || "Votre compte a été vérifié !");
            })
            .catch(() => setMessage("Erreur lors de la vérification."));
    }, [searchParams]);
    return (
        <div>
            <h2>Vérification du compte</h2>
            <p>{message}</p>
        </div>
    );
}
export default Verify;
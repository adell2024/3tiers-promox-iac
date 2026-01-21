import * as React from 'react'; // Utilise l'import "étoile"
import { useEffect, useState } from "react";

function App() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [status, setStatus] = useState('');

  // URL de l'API (à adapter selon ton ingress ou service)
  const API_URL = '' ; // import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Charger les messages au démarrage
  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${API_URL}/api/messages`);
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error("Erreur lors de la récupération:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage }),
      });

      if (response.ok) {
        setNewMessage(''); // Vide le champ
        setStatus('Message envoyé avec succès !');
        fetchMessages();   // Rafraîchit la liste
        setTimeout(() => setStatus(''), 3000);
      }
    } catch (err) {
      console.error("Erreur lors de l'envoi:", err);
      setStatus("Erreur lors de l'envoi.");
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Système de Messages (3-Tiers)</h1>

      {/* Formulaire d'ajout */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Écrivez un message..."
          style={{ padding: '8px', width: '250px' }}
        />
        <button type="submit" style={{ padding: '8px 15px', marginLeft: '10px', cursor: 'pointer' }}>
          Envoyer
        </button>
      </form>

      {status && <p style={{ color: 'green' }}>{status}</p>}

      <hr />

      {/* Liste des messages */}
      <h2>Messages récents</h2>
      <ul>
        {messages.map((msg) => (
          <li key={msg.id}>
            <strong>#{msg.id} :</strong> {msg.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;

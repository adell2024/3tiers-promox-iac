// Test GitHub Actions v1.0
import * as React from 'react'; // Utilise l'import "étoile"
import { useEffect, useState } from "react";


function App() {
  console.log("React chargé pour sûr:", !!React); // Petit test pour la console
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("Initialisation...");

  useEffect(() => {
    // URL relative pour passer par l'Ingress
    const API_URL = '';

    fetch(`${API_URL}/api/messages`)
      .then(res => {
        if (!res.ok) throw new Error(`Erreur HTTP! Statut: ${res.status}`);
        return res.json();
      })
      .then(data => {
        // CORRECTION : On force la vérification du type Array
        let finalData = [];
        
        if (Array.isArray(data)) {
          finalData = data;
        } else if (data && data.messages && Array.isArray(data.messages)) {
          finalData = data.messages;
        } else if (data && typeof data === 'object') {
          // Si on reçoit un objet simple {"message":"..."}, on l'enveloppe dans un tableau
          finalData = [data];
        }

        setMessages(finalData);
        setStatus(`Connecté : ${finalData.length} élément(s) trouvé(s).`);
      })
      .catch(err => {
        console.error("Erreur Fetch:", err);
        setStatus("Erreur API : " + err.message);
        setMessages([]); // On vide la liste en cas d'erreur
      });
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Mon App 3-Tiers : pipeline CI/CD complet</h1>
      <p><strong>Status :</strong> {status}</p>
      <hr />
      
      {/* Sécurité supplémentaire : vérification que messages est un tableau avant le .map */}
      <ul>
        {Array.isArray(messages) && messages.length > 0 ? (
          messages.map((m, i) => (
            <li key={i} style={{ marginBottom: '10px' }}>
               {/* Affiche m.message, ou m.content, ou l'objet brut */}
               {m.message || m.content || JSON.stringify(m)}
            </li>
          ))
        ) : (
          <li>Aucun message à afficher.</li>
        )}
      </ul>
    </div>
  );
}

export default App;


const API_URL = "https://ai-wardrobe-backend-qtz2.onrender.com";

async function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('error-msg');

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('userId', data.user_id);
            document.getElementById('user-name').innerText = data.username;
            showWardrobe();
        } else {
            errorMsg.innerText = data.detail || "Errore durante il login";
        }
    } catch (error) {
        errorMsg.innerText = "Impossibile connettersi al server.";
    }
}

async function showWardrobe() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('wardrobe-section').classList.remove('hidden');
    
    const userId = localStorage.getItem('userId');
    const response = await fetch(`${API_URL}/get-clothes?user_id=${userId}`);
    const clothes = await response.json();

    const grid = document.getElementById('clothes-grid');
    grid.innerHTML = clothes.map(item => `
    <div class="card" data-id="${item.item_id}"> <img src="${item.image_base64}" alt="${item.sub_category}">
        <p><strong>${item.sub_category}</strong></p>
        <p>${item.style} - ${item.season}</p>
    </div>
    `).join('');
}
let chatHistory = []; // Per mantenere il contesto della conversazione

async function askStylist() {
    const question = document.getElementById('user-question').value;
    const btn = document.getElementById('ask-button');
    const answerDiv = document.getElementById('ai-answer');
    
    if (!question) return;

    btn.innerText = "Pensando...";
    btn.disabled = true;

    // Aggiungiamo la domanda alla cronologia
    chatHistory.push({ role: "user", content: question });

    const userId = localStorage.getItem('userId');

    try {
        const response = await fetch(`${API_URL}/ask-outfit?user_id=${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(chatHistory) // Inviamo l'intera cronologia
        });

        const data = await response.json();

        if (data.suggestion) {
            document.getElementById('suggestion-text').innerText = data.suggestion;
            answerDiv.classList.remove('hidden');
            
            // Salviamo la risposta del modello nella cronologia
            chatHistory.push({ role: "model", content: data.suggestion });
            
            // Evidenziamo i capi scelti
            highlightClothes(data.selected_ids);
        }
    } catch (error) {
        console.error("Errore AI:", error);
    } finally {
        btn.innerText = "Ottieni Consiglio";
        btn.disabled = false;
    }
}

function highlightClothes(ids) {
    // Rimuoviamo evidenziazioni precedenti
    document.querySelectorAll('.card').forEach(card => card.classList.remove('highlighted'));
    
    // Aggiungiamo il bordo ai capi suggeriti dall'AI
    ids.forEach(id => {
        const card = document.querySelector(`[data-id="${id}"]`);
        if (card) card.classList.add('highlighted');
    });
}
function logout() {
    localStorage.removeItem('userId');
    location.reload();
}

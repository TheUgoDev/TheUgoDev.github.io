
const API_URL = "https://ai-wardrobe-backend-qtz2.onrender.com";

// 1. Inizializzazione
window.onload = () => {
    const userId = localStorage.getItem('userId');
    if (userId) {
        showWardrobe();
    } else {
        document.getElementById('login-form').classList.remove('hidden');
        document.getElementById('wardrobe-section').classList.add('hidden');
    }
};

function showRegister() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-section').classList.remove('hidden');
}

function showLogin() {
    document.getElementById('register-section').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
}


// 2. Funzione Login (CORRETTA)
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
            localStorage.setItem('userEmail', email); // Salviamo l'email per i controlli successivi
            document.getElementById('user-name').innerText = data.username;
            showWardrobe();
        } else {
            errorMsg.innerText = data.detail || "Errore durante il login";
        }
    } catch (error) {
        errorMsg.innerText = "Impossibile connettersi al server.";
    }
} // <--- Questa chiusura mancava o era posizionata male

// 3. Funzione Upload
async function handleUpload() {
    const fileInput = document.getElementById('file-input');
    const btn = document.getElementById('upload-button');
    const status = document.getElementById('upload-status');
    const userId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('userEmail'); // Salveremo l'email al login
    if (userEmail === "test@test.it") {
        alert("Modalità Demo: non puoi aggiungere capi in questo account.");
        return;
    }

    if (!fileInput.files[0]) {
        status.innerText = "Seleziona prima un'immagine.";
        return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', userId);

    btn.innerText = "Analisi AI in corso...";
    btn.disabled = true;
    status.innerText = "Il server sta rimuovendo lo sfondo e classificando il capo...";

    try {
        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            status.innerText = "Capo aggiunto con successo!";
            fileInput.value = "";
            showWardrobe();
        } else {
            const err = await response.json();
            status.innerText = "Errore: " + (err.detail || "Impossibile caricare");
        }
    } catch (error) {
        status.innerText = "Errore di connessione al server.";
    } finally {
        btn.innerText = "Carica e Analizza";
        btn.disabled = false;
    }
}

// 4. Mostra Armadio
async function showWardrobe() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('wardrobe-section').classList.remove('hidden');
    const userEmail = localStorage.getItem('userEmail');
    const isTest = userEmail === "test@test.it";

    const userId = localStorage.getItem('userId');
    const response = await fetch(`${API_URL}/get-clothes?user_id=${userId}`);
    const clothes = await response.json();

    const grid = document.getElementById('clothes-grid');
    grid.innerHTML = clothes.map(item => `
        <div class="card" data-id="${item.item_id}">
            ${!isTest ? `<button class="delete-btn" onclick="deleteCapo('${item.item_id}')">×</button>` : ''}
        <img src="${item.image_base64}" alt="${item.sub_category}">
            <p><strong>${item.sub_category}</strong></p>
            <p>${item.style} - ${item.season}</p>
        </div>
    `).join('');
    // Nascondi anche il box di upload se è test
    document.getElementById('upload-section').style.display = isTest ? 'none' : 'block';
}

// 5. Stylist AI
let chatHistory = [];
async function askStylist() {
    const question = document.getElementById('user-question').value;
    const btn = document.getElementById('ask-button');
    const answerDiv = document.getElementById('ai-answer');

    if (!question) return;

    btn.innerText = "Pensando...";
    btn.disabled = true;
    chatHistory.push({ role: "user", content: question });
    const userId = localStorage.getItem('userId');

    try {
        const response = await fetch(`${API_URL}/ask-outfit?user_id=${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(chatHistory)
        });

        const data = await response.json();
        if (data.suggestion) {
            document.getElementById('suggestion-text').innerText = data.suggestion;
            answerDiv.classList.remove('hidden');
            chatHistory.push({ role: "model", content: data.suggestion });
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
    document.querySelectorAll('.card').forEach(card => card.classList.remove('highlighted'));
    ids.forEach(id => {
        const card = document.querySelector(`[data-id="${id}"]`);
        if (card) card.classList.add('highlighted');
    });
}

// --- FUNZIONE REGISTRAZIONE ---
async function handleRegister() {
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const errorMsg = document.getElementById('reg-error');
    const successMsg = document.getElementById('reg-success');
    const btn = document.getElementById('reg-button');

    if (!username || !email || !password) {
        errorMsg.innerText = "Tutti i campi sono obbligatori.";
        return;
    }

    btn.innerText = "Registrazione in corso...";
    btn.disabled = true;

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            successMsg.innerText = "Account creato! Verrai reindirizzato al login...";
            errorMsg.innerText = "";
            setTimeout(() => {
                window.location.href = "index.html";
            }, 2000);
        } else {
            errorMsg.innerText = data.detail || "Errore durante la registrazione";
            btn.disabled = false;
            btn.innerText = "Crea Account";
        }
    } catch (error) {
        errorMsg.innerText = "Errore di connessione al server.";
        btn.disabled = false;
        btn.innerText = "Crea Account";
    }
}

// --- LOGICA DI PROTEZIONE UTENTE DEMO ---

// Modifica handleUpload esistente aggiungendo questo all'inizio:
async function handleUpload() {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail === "test@test.it") {
        alert("Account Demo: Non puoi aggiungere capi. Registrati con la tua email per farlo!");
        return;
    }
    // ... resto del codice handleUpload esistente ...
}

// Modifica deleteCapo esistente aggiungendo questo all'inizio:
async function deleteCapo(itemId) {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail === "test@test.it") {
        alert("Account Demo: Non puoi eliminare capi. Registrati per gestire il tuo armadio!");
        return;
    }
    // ... resto del codice deleteCapo esistente ...
}



function logout() {
    localStorage.clear();
    location.reload();
}

async function deleteCapo(itemId) {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail === "test@test.it") {
        alert("Modalità Demo: non puoi eliminare capi in questo account.");
        return;
    }
    if (!confirm("Vuoi davvero eliminare questo capo?")) return;

    try {
        const response = await fetch(`${API_URL}/clothes/${itemId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            // Rimuove la card visivamente con un piccolo effetto
            const card = document.querySelector(`[data-id="${itemId}"]`);
            if (card) {
                card.style.opacity = '0';
                setTimeout(() => card.remove(), 300);
            }
        } else {
            alert("Errore del server durante la cancellazione.");
        }
    } catch (error) {
        console.error("Errore:", error);
        alert("Errore di connessione al server.");
    }
}

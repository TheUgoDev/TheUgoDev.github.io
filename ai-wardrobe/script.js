
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
        <div class="card">
            <img src="${item.image_base64}" alt="${item.sub_category}">
            <p><strong>${item.sub_category}</strong></p>
            <p>${item.style} - ${item.season}</p>
        </div>
    `).join('');
}

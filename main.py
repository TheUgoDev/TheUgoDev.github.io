from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import uuid
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)
CORS(app)

# Caricamento e preparazione dati
try:
    df = pd.read_csv('conoscenza.csv', quotechar='"', skipinitialspace=True)
    df.columns = df.columns.str.strip()
    # Uniamo domanda e intento per creare un campo di ricerca più ricco
    df['search_text'] = df['domanda'].fillna('') + " " + df['intento'].fillna('')
except Exception as e:
    print(f"Errore caricamento CSV: {e}")

sessions = {}

def get_best_response(user_msg):
    # Creiamo il vettorizzatore TF-IDF
    vectorizer = TfidfVectorizer()
    
    # Trasformiamo tutte le domande del CSV + la domanda dell'utente in vettori
    all_texts = df['search_text'].tolist() + [user_msg]
    tfidf_matrix = vectorizer.fit_transform(all_texts)
    
    # Calcoliamo la similitudine tra l'ultimo elemento (utente) e tutti gli altri (CSV)
    similarities = cosine_similarity(tfidf_matrix[-1], tfidf_matrix[:-1])
    
    # Troviamo l'indice della riga più simile
    best_index = similarities.argmax()
    highest_score = similarities[0][best_index]
    
    # Soglia di confidenza: se la similitudine è troppo bassa (< 0.2), diamo risposta di default
    if highest_score < 0.15:
        return "Non sono sicuro di aver capito. Posso aiutarti con automazioni, prezzi o servizi tech?"
    
    return df.iloc[best_index]['risposta']

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '').lower().strip()
    session_id = data.get('session_id') or str(uuid.uuid4())

    if session_id not in sessions:
        sessions[session_id] = []

    # Otteniamo la risposta con la nuova logica "Smarter"
    risposta_final = get_best_response(user_message)

    sessions[session_id].append({"role": "user", "content": user_message})
    sessions[session_id].append({"role": "bot", "content": risposta_final})
    
    return jsonify({
        "response": risposta_final,
        "session_id": session_id
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
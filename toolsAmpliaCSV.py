import pandas as pd

def amplia_csv(input_file, output_file, n_repliche):
    try:
        # Carica il CSV originale
        # Usiamo quotechar='"' perché i tuoi testi contengono virgole
        df = pd.read_csv(input_file, quotechar='"', skipinitialspace=True)
        
        print(f"File originale caricato: {len(df)} righe.")

        # Repplica ogni riga per n_repliche volte
        # Usiamo la funzione repeat sull'indice del dataframe
        df_ampliato = df.loc[df.index.repeat(n_repliche)].reset_index(drop=True)

        # Salva il nuovo CSV
        # quoting=1 assicura che i testi rimangano tra virgolette
        df_ampliato.to_csv(output_file, index=False, quotechar='"', quoting=1)
        
        print(f"Successo! Creato '{output_file}' con {len(df_ampliato)} righe.")
        print(f"Ogni riga è stata replicata {n_repliche} volte.")

    except Exception as e:
        print(f"Errore durante l'elaborazione: {e}")

# --- CONFIGURAZIONE ---
N = 30  # <--- Cambia questo valore (10, 20, 30, ecc.)
amplia_csv('conoscenza.csv', 'conoscenza_ampliato.csv', N)
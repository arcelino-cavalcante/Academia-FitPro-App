import json
import time
from openai import OpenAI

# ==========================================================
# CONFIGURAÇÃO
# ==========================================================
# COLOQUE SUA CHAVE API AQUI:
OPENAI_API_KEY = "SUA_CHAVE_AQUI"
FILE_PATH = "/Users/arc/Projetos/Academia-app/src/data/exercises.json"
# ==========================================================

client = OpenAI(api_key=OPENAI_API_KEY)

def get_pro_categories(exercises_subset):
    prompt = """
    Você é um Treinador de Elite e Especialista em Cinesiologia. 
    Analise a lista de exercícios abaixo e retorne APENAS um objeto JSON onde a CHAVE é o ID do exercício e o VALOR é o grupo muscular correto.
    
    Categorias permitidas:
    - Peitoral
    - Costas
    - Ombros
    - Bíceps
    - Tríceps
    - Quadríceps
    - Posteriores de Coxa
    - Glúteos
    - Panturrilhas
    - Antebraço
    - Trapézio
    - Abdominal
    - Cardio
    - Mobilidade
    - Variados (Apenas se recrutar o corpo todo EX: LPO)

    Lista de exercícios:
    """ + json.dumps(exercises_subset, ensure_ascii=False)

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "Você é um mestre em educação física. Responda apenas com JSON puro."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"Erro na API: {e}")
        return {}

def run_categorization():
    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        exercises = json.load(f)

    print(f"Iniciando categorização IA de {len(exercises)} exercícios...")
    
    # Processar em lotes de 40 para não estourar limite de contexto/tokens
    batch_size = 40
    new_data_map = {}
    
    for i in range(0, len(exercises), batch_size):
        batch = exercises[i:i + batch_size]
        subset = [{"id": ex['id'], "name": ex['name']} for ex in batch]
        
        print(f"Processando lote {i//batch_size + 1}...")
        results = get_pro_categories(subset)
        new_data_map.update(results)
        time.sleep(1) # Evitar rate limit

    # Aplicar mudanças
    updated_count = 0
    for ex in exercises:
        if ex['id'] in new_data_map:
            if ex['muscleGroup'] != new_data_map[ex['id']]:
                ex['muscleGroup'] = new_data_map[ex['id']]
                updated_count += 1

    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(exercises, f, indent=2, ensure_ascii=False)

    print(f"🏁 Finalizado! {updated_count} exercícios foram recategorizados profissionalmente pela IA.")

if __name__ == "__main__":
    if OPENAI_API_KEY == "SUA_CHAVE_AQUI":
        print("❌ ERRO: Você precisa colocar sua chave API da OpenAI no script!")
    else:
        run_categorization()

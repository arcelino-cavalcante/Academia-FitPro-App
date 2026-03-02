import json
import time
from openai import OpenAI

# ==========================================================
# CONFIGURAÇÃO MASTER IA
# ==========================================================
OPENAI_API_KEY = "SUA_CHAVE_AQUI"
FILE_PATH = "/Users/arc/Projetos/Academia-app/src/data/exercises.json"
MODEL = "gpt-4o" # Modelo mais potente e inteligente
# ==========================================================

client = OpenAI(api_key=OPENAI_API_KEY)

def get_pro_categories(exercises_subset):
    system_prompt = """
    Você é um Doutor em Cinesiologia e Treinador de Atletas de Elite (Coach Master).
    Sua missão é realizar uma análise BIOMECÂNICA PROFUNDA de cada exercício para determinar qual o MÚSCULO AGONISTA PRIMÁRIO.
    
    REGRAS DE OURO DE CATEGORIZAÇÃO:
    1. PEITORAL: Supinos, crucifixos, voador, flexões de braço, paralelas com torso inclinado.
    2. COSTAS: Puxadas, remadas, barra fixa, serrote, pulldown, levantamento terra (convencional), extensões lombares.
    3. OMBROS: Desenvolvimentos, elevações laterais/frontais, posterior de ombro, manguito rotador.
    4. BÍCEPS: Todas as roscas (curls) de bíceps.
    5. TRÍCEPS: Extensões de cotovelo, tríceps testa, pulley, mergulho (dips).
    6. ANTEBRAÇO: Roscas inversas, flexões/extensões de punho, exercícios de pegada.
    7. TRAPÉZIO: Encolhimentos (shrugs), remada alta.
    8. QUADRÍCEPS: Agachamentos (back/front), leg press, extensão de joelho (extensora), sissy squat, agachamento hack.
    9. POSTERIORES DE COXA: Flexão de joelho (mesa/cadeira flexora), stiff, terra romeno, flexão nórdica.
    10. GLÚTEOS: Elevação pélvica, hip thrust, abdução de quadril, coice (cable kickback), afundo (lunges), búlgaro, agachamento sumô.
    11. PANTURRILHAS: Flexões plantares (gêmeos em pé/sentado), tibial anterior.
    12. ABDOMINAL: Crunches, pranchas, elevações de perna (ABS), rotações de tronco, core em geral.
    13. CARDIO: Exercícios cíclicos (corrida, bike) e gestos esportivos metabólicos (boxe, burpee, corda).
    14. MOBILIDADE: Alongamentos, rolo de espuma, ioga, soltura articular.
    
    IMPORTANTE: Analise a biomecânica. Se o nome for 'Agachamento Sumô', o foco é Glúteo/Adutor. Se for 'Supino Fechado', o foco é Tríceps.
    Retorne um JSON onde as chaves são os IDs e os valores são UMA das categorias acima.
    """

    user_content = f"Analise estes exercícios e categorize-os conforme as regras de elite: {json.dumps(exercises_subset, ensure_ascii=False)}"

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
            ],
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"Erro na API Lote: {e}")
        return {}

def run_categorization():
    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        exercises = json.load(f)

    print(f"🚀 Iniciando Análise Master de Cinesiologia (GPT-4o) para {len(exercises)} exercícios...")
    
    # Lotes menores (20 unidades) para garantir foco total e precisão cirúrgica por item
    batch_size = 20
    new_data_map = {}
    
    for i in range(0, len(exercises), batch_size):
        batch = exercises[i:i + batch_size]
        # Enviamos ID e Nome para a IA processar a biomecânica do nome
        subset = [{"id": ex['id'], "name": ex['name']} for ex in batch]
        
        print(f"📦 Analisando Lote {i//batch_size + 1} de {len(exercises)//batch_size + 1}...")
        results = get_pro_categories(subset)
        
        # A IA pode retornar chaves diferentes, buscamos os valores mapeados aos IDs enviados
        new_data_map.update(results)
        time.sleep(1.5) # Aguarda para manter estabilidade da conexão

    # Aplicar a nova inteligência ao banco de dados
    updated_count = 0
    for ex in exercises:
        # A chave no JSON retornado pode ser o ID
        if ex['id'] in new_data_map:
            new_cat = new_data_map[ex['id']]
            if ex['muscleGroup'] != new_cat:
                ex['muscleGroup'] = new_cat
                updated_count += 1
        else:
            # Fallback caso a IA use o nome como chave em vez do ID (algumas vezes acontece no JSON output)
            if ex['name'] in new_data_map:
                new_cat = new_data_map[ex['name']]
                if ex['muscleGroup'] != new_cat:
                    ex['muscleGroup'] = new_cat
                    updated_count += 1

    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(exercises, f, indent=2, ensure_ascii=False)

    print(f"\n✅ MISSÃO CONCLUÍDA!")
    print(f"🔥 {updated_count} exercícios foram re-categorizados com Inteligência Elite GPT-4o.")
    print(f"📊 Categorias finais padrão Ouro agora estão ativas no App.")

if __name__ == "__main__":
    run_categorization()

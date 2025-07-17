from fastapi import FastAPI
from fastapi.responses import JSONResponse
import openai
from serpapi import GoogleSearch
from rich.console import Console
from urllib.parse import urlparse
import re
import asyncio
from fastapi.middleware.cors import CORSMiddleware
import dotenv
import os
# CONFIGURAZIONI

dotenv.load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SERPAPI_API_KEY = os.getenv("SERPAPI_API_KEY")

client = openai.OpenAI(api_key=OPENAI_API_KEY)
console = Console()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def debug_log(message):
    console.rule("[bold blue]DEBUG")
    console.print(f"[cyan]{message}")

def extract_domain(url):
    parsed = urlparse(url)
    domain = parsed.netloc.lower()
    if domain.startswith("www."):
        domain = domain[4:]
    return domain

def normalize_text(text):
    return re.sub(r'[^a-z0-9]', '', text.lower())

def is_official_website(business_name, website_url):
    domain = extract_domain(website_url)
    normalized_domain = normalize_text(domain)
    words = [normalize_text(w) for w in business_name.split() if len(w) > 3]
    for w in words:
        if w in normalized_domain:
            return True
    return False

def search_business_on_google_maps(query, location, next_page_token=None):
    params = {
        "engine": "google_maps",
        "q": query,
        "location": location,
        "api_key": SERPAPI_API_KEY,
    }
    if next_page_token:
        params["next_page_token"] = next_page_token

    debug_log(f"Chiamata a SerpApi con parametri: {params}")

    search = GoogleSearch(params)
    results = search.get_dict()

    businesses = results.get('local_results', [])
    next_token = results.get('next_page_token')

    debug_log(f"Trovati {len(businesses)} business in questa pagina.")
    debug_log(f"Prossimo token di paginazione: {next_token}")

    return businesses, next_token

def check_website_presence(business):
    website = business.get('website')
    if website:
        debug_log(f"Sito trovato direttamente: {website}")
        return website
    else:
        search_term = business['title'] + ' ' + business.get('address', '')
        debug_log(f"Cercando sito su Google con: '{search_term}'")

        params = {
            "engine": "google",
            "q": search_term,
            "api_key": SERPAPI_API_KEY
        }
        search = GoogleSearch(params)
        results = search.get_dict().get('organic_results', [])
        for result in results:
            if 'link' in result:
                return result['link']

    return None

def generate_message_sync(business_name):
    prompt = f"""
        Sei un esperto di copywriting persuasivo e psicologia del marketing. Devi redigere un messaggio professionale e personalizzato rivolto a {business_name}, con l’obiettivo di convincere il destinatario ad affidarmi la realizzazione di un sito web moderno e performante.

        Prima di scrivere il messaggio:
        - Analizza il sito web esistente di {business_name} (se disponibile) per rilevare eventuali criticità come: design obsoleto, scarsa usabilità, lentezza di caricamento, mancanza di ottimizzazione mobile, contenuti datati, mancanza di elementi di fiducia o call to action.
        - Se il sito non esiste, evidenzia quanto questa assenza limiti la credibilità, la visibilità e le opportunità di acquisizione clienti rispetto ai competitor.

        Quando scrivi il messaggio:
        - Usa un tono professionale e rispettoso, dando del "Lei".
        - Dimostra immediata empatia, facendo capire di aver compreso le esigenze e le sfide del loro settore.
        - Evidenzia in modo concreto i benefici di avere un sito web professionale: aumento della visibilità online, maggiore credibilità, fidelizzazione dei clienti, incremento delle vendite e del posizionamento rispetto alla concorrenza.
        - Integra tecniche persuasive di marketing: autorità (presentando la mia competenza), riprova sociale (menzionando eventuali progetti o risultati di successo), reciprocità (offrendo una consulenza gratuita o un'analisi senza impegno), scarsità (proponendo un’offerta limitata o la disponibilità limitata di posti), e una forte chiamata all’azione emozionale.
        - Il messaggio deve essere breve ma incisivo, chiaro e orientato a stimolare una risposta immediata.
        - Personalizza il testo con eventuali dettagli specifici legati al sito o al settore del cliente.

        Alla fine, aggiungi la mia firma personale con i seguenti dettagli di contatto:

        Nome: Artur Onoicencu  
        Telefono: 3276577730  
        Email: arturonoicencu@gmail.com  
        GitHub: github.com/aartuur  

        Il messaggio va scritto come se fosse rivolto direttamente al cliente di {business_name}, pronto per essere inviato.

        ---
        Inizia ora a scrivere il messaggio per {business_name}.
        """
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"Errore generazione messaggio: {str(e)}"

async def generate_message_async(business_name):
    return await asyncio.to_thread(generate_message_sync, business_name)

def parse_keywords(keywords_input):
    cleaned = re.sub(r'\b(in|a|in italia)\b', '', keywords_input, flags=re.IGNORECASE)
    return [k.strip() for k in re.split(r'[,\s]+', cleaned) if k.strip()]

@app.get("/imprese-senza-sito")
async def imprese_senza_sito(
    paese: str = "Italia",
    città: str = "Milano",
    target: int = 5,
    keywords: str = "ristoranti"
):
    found = 0
    next_page_token = None
    imprese_senza_sito = []

    location = f"{città}, {paese}"
    keyword_list = parse_keywords(keywords)

    debug_log(f"Ricerca imprese con keywords: {keyword_list} in {location}")

    keyword_index = 0

    while found < target and keyword_index < len(keyword_list):
        current_keyword = keyword_list[keyword_index]
        full_query = f"{current_keyword} a {città} in {paese}"
        debug_log(f"Eseguo ricerca con query: '{full_query}' e location: '{location}'")

        businesses, next_page_token = search_business_on_google_maps(
            query=full_query,
            location=location,
            next_page_token=next_page_token
        )

        if not businesses:
            debug_log(f"Nessun business trovato per '{current_keyword}'. Passo alla prossima keyword.")
            keyword_index += 1
            next_page_token = None
            continue

        candidates = []
        for business in businesses:
            if found >= target:
                break

            name = business.get('title')
            website = check_website_presence(business)

            if website and is_official_website(name, website):
                debug_log(f"Salto {name} perché ha già un sito ufficiale: {website}")
                continue

            candidates.append({
                "name": name,
                "website": website,
                "phone": business.get('phone'),
                "email": business.get('email'),
                "address": business.get('address'),
                "locality": business.get('locality'),
                "region": business.get('region'),
                "postal_code": business.get('postal_code'),
                "country": business.get('country'),
            })

        tasks = [generate_message_async(candidate["name"]) for candidate in candidates]
        messages = await asyncio.gather(*tasks)

        for i, candidate in enumerate(candidates):
            if found >= target:
                break
            message = messages[i]
            imprese_senza_sito.append({
                "nome": candidate["name"],
                "sito": candidate["website"],
                "telefono": candidate["phone"],
                "email": candidate.get("email"),
                "indirizzo": candidate["address"],
                "città": candidate["locality"],
                "regione": candidate["region"],
                "cap": candidate["postal_code"],
                "paese": candidate["country"],
                "messaggio": message
            })
            found += 1

        if not next_page_token:
            debug_log(f"Fine dei risultati per la keyword '{current_keyword}'. Passo alla prossima.")
            keyword_index += 1
            next_page_token = None

    debug_log(f"Trovate {found} imprese senza sito ufficiale.")
    return JSONResponse(content=imprese_senza_sito)
   
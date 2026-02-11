import os
import re
import time
import uuid
import json
import asyncio
import logging
from typing import List, Optional, Dict, Any, Set, Tuple
from urllib.parse import urlparse

import dotenv
from fastapi import FastAPI, Query, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from serpapi import GoogleSearch
import google.generativeai as genai

dotenv.load_dotenv()

SERPAPI_API_KEY = os.getenv("SERPAPI_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = (os.getenv("GEMINI_MODEL") or "").strip()

if not SERPAPI_API_KEY or not GEMINI_API_KEY:
    raise RuntimeError("MISSING API KEYS IN .ENV FILE")

LOG_LEVEL = (os.getenv("LOG_LEVEL") or "INFO").upper()
logging.basicConfig(
    level=LOG_LEVEL,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("lead-gen")

genai.configure(api_key=GEMINI_API_KEY)

generation_config = {
    "temperature": 0.7,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 900,
    "response_mime_type": "text/plain",
}

app = FastAPI(title="Lead Gen Sniper", version="2.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","https://imprese.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DIRECTORY_DOMAINS = {
    "facebook.com", "instagram.com", "linkedin.com", "yelp.com", "tripadvisor.com",
    "tripadvisor.it", "paginegialle.it", "virgilio.it", "thefork.it", "thefork.com",
    "justeat.it", "glovoapp.com", "deliveroo.it", "uber.com", "google.com"
}

class Lead(BaseModel):
    business_name: str
    address: Optional[str]
    phone: Optional[str]
    rating: Optional[float]
    reviews: Optional[int]
    current_status: str
    detected_url: Optional[str]
    sales_pitch: str

def _safe_json(obj: Any, limit: int = 2400) -> str:
    try:
        s = json.dumps(obj, ensure_ascii=False, default=str)
        return s if len(s) <= limit else s[:limit] + "..."
    except Exception:
        return str(obj)

def is_valid_website(url: str) -> bool:
    if not url or not isinstance(url, str):
        return False
    try:
        u = url.strip()
        if not u:
            return False
        if not re.match(r"^https?://", u, re.IGNORECASE):
            u = "https://" + u
        parsed = urlparse(u)
        domain = (parsed.netloc or "").lower().strip()
        if domain.startswith("www."):
            domain = domain[4:]
        if not domain or "." not in domain:
            return False
        for d in DIRECTORY_DOMAINS:
            if d in domain:
                return False
        return True
    except Exception:
        return False

async def search_google_maps(query: str, start: int, hl: str = "it") -> Dict[str, Any]:
    params = {
        "engine": "google_maps",
        "type": "search",
        "q": query,
        "hl": hl,
        "api_key": SERPAPI_API_KEY,
        "start": start,
    }
    loop = asyncio.get_running_loop()
    t0 = time.time()
    try:
        data = await loop.run_in_executor(None, lambda: GoogleSearch(params).get_dict())
    except Exception as e:
        logger.exception(f"SERPAPI request failed | params={_safe_json(params)} | err={e}")
        return {}
    dt = int((time.time() - t0) * 1000)
    if isinstance(data, dict) and data.get("error"):
        logger.error(f"SERPAPI error field | start={start} | error={data.get('error')}")
    return data if isinstance(data, dict) else {}

def _short_model_name(n: str) -> str:
    n = (n or "").strip()
    if n.startswith("models/"):
        n = n.split("/", 1)[1]
    return n

def _is_429(e: Exception) -> bool:
    s = str(e).lower()
    return ("429" in s) or ("toomanyrequests" in s) or ("resourceexhausted" in s) or ("rate" in s and "limit" in s) or ("quota" in s)

def _extract_retry_seconds(e: Exception) -> int:
    m = re.search(r"retry in ([0-9]+(\.[0-9]+)?)s", str(e), re.IGNORECASE)
    if m:
        try:
            return max(1, int(float(m.group(1))))
        except Exception:
            return 10
    m2 = re.search(r"seconds:\s*([0-9]+)", str(e))
    if m2:
        try:
            return max(1, int(m2.group(1)))
        except Exception:
            return 10
    return 10

_MODEL_OBJ: Optional[genai.GenerativeModel] = None
_MODEL_NAME: Optional[str] = None
_MODEL_LOCK = asyncio.Lock()

async def _list_models_generatecontent() -> List[str]:
    loop = asyncio.get_running_loop()
    models = await loop.run_in_executor(None, lambda: list(genai.list_models()))
    out = []
    for m in models:
        name = getattr(m, "name", None)
        methods = getattr(m, "supported_generation_methods", None) or []
        if name and "generateContent" in methods:
            out.append(name)
    return out

def _pick_model(available_full: List[str]) -> Optional[str]:
    available_short = [_short_model_name(x) for x in available_full]
    aset = set(available_short)
    if GEMINI_MODEL:
        want = _short_model_name(GEMINI_MODEL)
        return want if want in aset else None
    prefs = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"]
    for p in prefs:
        if p in aset:
            return p
    for n in available_short:
        if "flash" in n:
            return n
    return available_short[0] if available_short else None

async def init_model() -> None:
    global _MODEL_OBJ, _MODEL_NAME
    try:
        available = await _list_models_generatecontent()
    except Exception as e:
        logger.exception(f"GEMINI list_models failed | err={e}")
        _MODEL_OBJ = None
        _MODEL_NAME = None
        return

    chosen = _pick_model(available)
    if not chosen:
        logger.error(f"GEMINI: no suitable model. env_requested={GEMINI_MODEL or None}")
        _MODEL_OBJ = None
        _MODEL_NAME = None
        return

    _MODEL_NAME = chosen
    _MODEL_OBJ = genai.GenerativeModel(model_name=chosen, generation_config=generation_config)
    logger.info(f"GEMINI model selected | model={_MODEL_NAME}")

async def get_model() -> genai.GenerativeModel:
    global _MODEL_OBJ
    if _MODEL_OBJ is not None:
        return _MODEL_OBJ
    async with _MODEL_LOCK:
        if _MODEL_OBJ is not None:
            return _MODEL_OBJ
        await init_model()
        if _MODEL_OBJ is None:
            raise RuntimeError("GEMINI MODEL NOT INITIALIZED")
        return _MODEL_OBJ

def _fallback_pitch(name: str, city: str, category: str, status: str, url: Optional[str]) -> str:
    if status == "No Website":
        pain = "se un cliente ti cerca su Google oggi, può trovare solo i concorrenti o informazioni incomplete."
        ag = "senza un sito tuo perdi prenotazioni e credibilità, e non controlli i contatti."
        sol = "posso crearti un sito veloce con prenotazioni/contatti e SEO locale per Milano."
    else:
        pain = f"oggi la tua presenza sembra appoggiata a piattaforme terze ({url or 'directory'})."
        ag = "questo significa dipendere da algoritmi e recensioni, con poca proprietà del brand e dei dati."
        sol = "posso portarti su un sito proprietario con tracciamento e conversioni, mantenendo le pagine social."
    return (
        f"Ciao {name},\n"
        f"Ho visto la tua attività a {city}: {pain}\n"
        f"In pratica, {ag}\n"
        f"Soluzione: {sol}\n"
        f"Possiamo parlarne per 5 minuti?\n\n"
        f"Artur Onoicencu | Web Developer & Growth Partner\n"
        f"Tel: 3276577730"
    )

def _parse_json_array(text: str) -> Optional[List[Dict[str, Any]]]:
    try:
        return json.loads(text)
    except Exception:
        m = re.search(r"\[[\s\S]*\]", text)
        if not m:
            return None
        try:
            return json.loads(m.group(0))
        except Exception:
            return None

async def generate_sales_copy_batch(items: List[Dict[str, Any]], city: str, category: str, rid: str) -> List[str]:
    model = await get_model()

    payload = []
    for idx, it in enumerate(items):
        payload.append({
            "i": idx,
            "business_name": it["business_name"],
            "current_status": it["current_status"],
            "detected_url": it.get("detected_url"),
        })

    prompt = (
        "Sei un esperto Senior di Digital Marketing e Sales Psychology.\n"
        "Genera email di cold outreach in italiano per ciascun elemento.\n"
        "Regole: max 150 parole, PAS (Problem, Agitation, Solution), CTA finale: \"Possiamo parlarne per 5 minuti?\".\n"
        "Non includere oggetto. Includi firma:\n"
        "Artur Onoicencu | Web Developer & Growth Partner\n"
        "Tel: 3276577730\n\n"
        f"Città: {city}\n"
        f"Categoria: {category}\n\n"
        "Input JSON:\n"
        f"{json.dumps(payload, ensure_ascii=False)}\n\n"
        "Output: restituisci SOLO un JSON array, stesso ordine e stessa lunghezza, con oggetti:\n"
        "{\"i\": <int>, \"sales_pitch\": <string>}\n"
        "Nessun testo extra."
    )

    t0 = time.time()
    try:
        resp = await model.generate_content_async(prompt)
        text = (resp.text or "").strip()
        dt = int((time.time() - t0) * 1000)

        arr = _parse_json_array(text)
        if not isinstance(arr, list):
            logger.error(f"GEMINI batch parse failed | rid={rid} | raw={text[:500]}")
            return [
                _fallback_pitch(it["business_name"], city, category, it["current_status"], it.get("detected_url"))
                for it in items
            ]

        pitches = [""] * len(items)
        for obj in arr:
            try:
                i = int(obj.get("i"))
                sp = str(obj.get("sales_pitch") or "").strip()
                if 0 <= i < len(pitches) and sp:
                    pitches[i] = sp
            except Exception:
                continue

        for i, it in enumerate(items):
            if not pitches[i]:
                pitches[i] = _fallback_pitch(it["business_name"], city, category, it["current_status"], it.get("detected_url"))

        return pitches

    except Exception as e:
        dt = int((time.time() - t0) * 1000)
        if _is_429(e):
            retry_s = _extract_retry_seconds(e)
            logger.error(f"GEMINI batch 429 | rid={rid} | ms={dt} | model={_MODEL_NAME} | retry_s={retry_s} | err={e}")
            return [
                _fallback_pitch(it["business_name"], city, category, it["current_status"], it.get("detected_url"))
                for it in items
            ]
        logger.exception(f"GEMINI batch fail | rid={rid} | ms={dt} | model={_MODEL_NAME} | err={e}")
        return [
            _fallback_pitch(it["business_name"], city, category, it["current_status"], it.get("detected_url"))
            for it in items
        ]

@app.on_event("startup")
async def _startup():
    try:
        await init_model()
    except Exception as e:
        logger.exception(f"Startup model init failed | err={e}")

@app.middleware("http")
async def add_request_id(request: Request, call_next):
    rid = request.headers.get("x-request-id") or str(uuid.uuid4())
    request.state.rid = rid
    t0 = time.time()
    logger.info(f"REQ start | rid={rid} | {request.method} {request.url.path} | qs={request.url.query}")
    try:
        response = await call_next(request)
        dt = int((time.time() - t0) * 1000)
        logger.info(f"REQ end | rid={rid} | status={response.status_code} | ms={dt}")
        response.headers["x-request-id"] = rid
        return response
    except Exception as e:
        dt = int((time.time() - t0) * 1000)
        logger.exception(f"REQ crash | rid={rid} | ms={dt} | err={e}")
        raise

@app.get("/api/v1/debug/gemini")
async def debug_gemini():
    rid = str(uuid.uuid4())
    try:
        model = await get_model()
    except Exception as e:
        return {"ok": False, "selected_model": _MODEL_NAME, "error": str(e)}

    try:
        r = await model.generate_content_async("Rispondi con una sola parola: OK")
        txt = (r.text or "").strip()
        return {"ok": True, "selected_model": _MODEL_NAME, "reply": txt}
    except Exception as e:
        return {
            "ok": False,
            "selected_model": _MODEL_NAME,
            "error_type": type(e).__name__,
            "error_text": str(e),
            "is_429": _is_429(e),
            "retry_seconds": _extract_retry_seconds(e) if _is_429(e) else None,
        }

def _lead_dedupe_key(business_name: str, address: Optional[str], phone: Optional[str]) -> Tuple[str, str, str]:
    return (
        (business_name or "").strip().lower(),
        (address or "").strip().lower(),
        (phone or "").strip().lower(),
    )

@app.get("/api/v1/leads", response_model=List[Lead])
async def get_leads(
    request: Request,
    city: str = Query(..., description="Target City"),
    categories: List[str] = Query(None, alias="categories"),
    category_single: Optional[str] = Query(None, alias="category"),
    limit: int = Query(5, ge=1, le=20),
    country: str = "Italia",
    include_with_website: bool = Query(False),
    ai: bool = Query(True),
):
    rid = getattr(request.state, "rid", str(uuid.uuid4()))
    results: List["Lead"] = []
    seen: Set[Tuple[str, str, str]] = set()

    raw_categories = []
    if categories:
        for item in categories:
            if "," in item:
                raw_categories.extend([x.strip() for x in item.split(",")])
            else:
                raw_categories.append(item)

    if category_single:
        if "," in category_single:
            raw_categories.extend([x.strip() for x in category_single.split(",")])
        else:
            raw_categories.append(category_single)

    norm_categories = []
    for c in raw_categories:
        if not c:
            continue
        c_clean = str(c).strip()
        if c_clean.lower() in {"undefined", "null", "none", ""}:
            continue
        norm_categories.append(c_clean)

    if not norm_categories:
        norm_categories = ["Ristorante"]
    
    if len(norm_categories) > 3:
        norm_categories = norm_categories[:3]

    logger.info(f"LEADS start | rid={rid} | city={city} | TARGET={norm_categories}")

    async def _safe_search(q: str, start: int) -> dict:
        try:
            data = await search_google_maps(q, start=start, hl="it")
            if not isinstance(data, dict):
                return {}
            return data
        except Exception as e:
            logger.error(f"LEADS serp_error | rid={rid} | q={q} | err={e}")
            return {} 

    async def _safe_generate_pitches(chosen: List[dict], city: str, category: str) -> List[str]:
        if not chosen: return []
        if not ai:
            return [_fallback_pitch(it["business_name"], city, category, it["current_status"], it.get("detected_url")) for it in chosen]

        try:
            pitches = await generate_sales_copy_batch(chosen, city=city, category=category, rid=rid)
            final_pitches = []
            for i, p in enumerate(pitches):
                if isinstance(p, str) and p.strip():
                    final_pitches.append(p)
                else:
                    it = chosen[i]
                    final_pitches.append(_fallback_pitch(it["business_name"], city, category, it["current_status"], it.get("detected_url")))
            return final_pitches
        except Exception as e:
            logger.warning(f"LEADS ai_fallback | rid={rid} | category={category} | err={e}")
            return [_fallback_pitch(it["business_name"], city, category, it["current_status"], it.get("detected_url")) for it in chosen]

    for category in norm_categories:
        if len(results) >= limit: break

        q = f"{category} {city} {country}".strip()
        start = 0
        
        while len(results) < limit and start < 60:
            data = await _safe_search(q, start=start)
            local_results = data.get("local_results", [])
            
            if not local_results: break

            candidates = []
            for item in local_results:
                title = (item.get("title") or item.get("name") or "").strip()
                if not title: continue

                address = item.get("address")
                phone = item.get("phone")
                website = item.get("website")
                dedupe_key = _lead_dedupe_key(title, address, phone)
                
                if dedupe_key in seen: continue

                lead_status = None
                if not website: lead_status = "No Website"
                elif not is_valid_website(website): lead_status = "Directory Only"
                elif include_with_website: lead_status = "Has Website"

                if lead_status:
                    candidates.append({
                        "business_name": title, "address": address, "phone": phone,
                        "rating": item.get("rating"), "reviews": item.get("reviews"),
                        "current_status": lead_status, "detected_url": website,
                        "dedupe_key": dedupe_key
                    })

            if candidates:
                remaining = limit - len(results)
                chosen = candidates[:remaining]
                pitches = await _safe_generate_pitches(chosen, city=city, category=category)

                for it, pitch in zip(chosen, pitches):
                    seen.add(it["dedupe_key"])
                    results.append(Lead(
                        business_name=it["business_name"], address=it["address"], phone=it["phone"],
                        rating=it["rating"], reviews=it["reviews"], current_status=it["current_status"],
                        detected_url=it["detected_url"], sales_pitch=pitch,
                    ))

            start += 20
            if len(local_results) < 20: break

    logger.info(f"LEADS done | rid={rid} | returned={len(results)}")
    return results

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level=LOG_LEVEL.lower())
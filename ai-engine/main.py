from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import SuggestionRequest, SuggestionResponse
from scoring import score_and_rank_candidates

app = FastAPI(
    title="Smart Campus AI Allocation Suggestion Engine",
    version="1.0.0",
    description="Deterministic multi-factor scoring engine for campus facility allocation"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "smart-campus-ai-engine",
        "version": "1.0.0"
    }

@app.post("/suggest", response_model=SuggestionResponse)
def suggest_facilities(payload: SuggestionRequest):
    try:
        primary, alternatives = score_and_rank_candidates(
            request=payload.request,
            candidates=payload.candidates
        )
        return SuggestionResponse(
            primary=primary,
            alternatives=alternatives,
            fallback=False
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scoring error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

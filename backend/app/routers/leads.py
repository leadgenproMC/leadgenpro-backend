from fastapi import APIRouter, Depends, HTTPException, Header
from ..deps.auth import get_current_user
from ..schemas.leads import GenerateLeadsRequest, GenerateLeadsResponse
from ..services.google_places import search_places

router = APIRouter()


@router.post("/generate", response_model=GenerateLeadsResponse)
def generate_leads(
	payload: GenerateLeadsRequest,
	user: str = Depends(get_current_user),
	accept_language: str | None = Header(default=None),
):
	if payload.count <= 0:
		raise HTTPException(status_code=400, detail="count must be > 0")
	# TODO: 1) Check credits in Supabase, 3) Persist and decrement credits
	lang = (accept_language or "es").split(",")[0].split("-")[0]
	leads = search_places(payload.niche, payload.location, payload.count, language=lang)
	return GenerateLeadsResponse(
		niche=payload.niche,
		location=payload.location,
		requested=payload.count,
		leads=leads,
	)

from fastapi import APIRouter, Depends
from ..deps.auth import get_current_user
from ..schemas.credits import CreditsResponse

router = APIRouter()


@router.get("/me", response_model=CreditsResponse)
def get_credits_me(user: str = Depends(get_current_user)):
	# TODO: Query Supabase for user's credits
	return CreditsResponse(credits=50)

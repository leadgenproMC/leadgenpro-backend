from fastapi import Header, HTTPException, status
from typing import Optional


def get_current_user(authorization: Optional[str] = Header(default=None)) -> str:
	"""
	Placeholder: expects 'Authorization: Bearer <jwt>'.
	Replace with Supabase JWT verification.
	"""
	if not authorization:
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing Authorization header"
		)
	return authorization

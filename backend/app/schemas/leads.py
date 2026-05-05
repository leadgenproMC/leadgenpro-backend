from pydantic import BaseModel, Field, conint
from typing import List, Optional


class Lead(BaseModel):
	name: str
	phone: Optional[str] = None
	website: Optional[str] = None
	address: Optional[str] = None
	source: str = Field(default="google_places")


class GenerateLeadsRequest(BaseModel):
	niche: str
	location: str
	count: conint(gt=0) = 10


class GenerateLeadsResponse(BaseModel):
	niche: str
	location: str
	requested: int
	leads: List[Lead]

from pydantic import BaseModel, conint


class CreditsResponse(BaseModel):
	credits: conint(ge=0)

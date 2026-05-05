import os
from typing import List


def get_cors_origins() -> List[str]:
	origins = os.getenv("CORS_ALLOW_ORIGINS", "*")
	return [o.strip() for o in origins.split(",")] if origins else ["*"]


def get_env_required(name: str) -> str:
	value = os.getenv(name)
	if not value:
		raise RuntimeError(f"Missing required environment variable: {name}")
	return value

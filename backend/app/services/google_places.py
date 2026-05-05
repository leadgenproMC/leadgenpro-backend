import googlemaps
from typing import List, Dict
from ..config import get_env_required


def search_places(niche: str, location: str, limit: int, language: str = "es") -> List[Dict]:
	api_key = get_env_required("GOOGLE_MAPS_API_KEY")
	client = googlemaps.Client(key=api_key)
	query = f"{niche} in {location}"
	results = client.places(query=query, language=language)
	places = results.get("results", [])[:limit]
	leads = []
	for p in places:
		lead = {
			"name": p.get("name"),
			"website": p.get("website"),
			"address": p.get("formatted_address"),
			"phone": None,  # can be fetched with place details if needed
			"source": "google_places",
		}
		leads.append(lead)
	return leads

import json
from src.ai.nim_client import chat_completion
from src.models.user import User
from src.models.listing import Listing


async def generate_proposal(user: User, listing: Listing) -> dict:
    """
    Generate a personalized proposal with 5 sections.
    Returns a dict with keys: intro, understanding, plan, timeline, pricing.
    """
    skills = ", ".join(s.name for s in (user.skills or [])) or "not specified"
    listing_skills = ", ".join(s.name for s in (listing.skills or [])) or "not specified"

    price_hint = ""
    if listing.price:
        price_hint = f"Budget: ${listing.price}"
    elif listing.price_min and listing.price_max:
        price_hint = f"Budget range: ${listing.price_min} - ${listing.price_max}"

    delivery_hint = f"Delivery: {listing.delivery_days} days" if listing.delivery_days else ""

    prompt = f"""You are writing a professional freelance proposal on behalf of a student.

Student profile:
  Name: {user.first_name} {user.last_name}
  University: {user.university or "N/A"}
  Headline: {user.headline or "N/A"}
  Bio: {user.bio or "N/A"}
  Skills: {skills}

Listing they are applying to:
  Title: {listing.title}
  Description: {listing.description}
  Category: {listing.category}
  Required skills: {listing_skills}
  {price_hint}
  {delivery_hint}

Write a compelling, personalized proposal with exactly these 5 sections.
Return ONLY a JSON object with these keys:
{{
  "intro": "2-3 sentences introducing the student and why they are a great fit",
  "understanding": "2-3 sentences showing they understand the client's need",
  "plan": "3-4 sentences describing their approach and methodology",
  "timeline": "1-2 sentences on delivery timeline and milestones",
  "pricing": "1-2 sentences on pricing and what is included"
}}

Be specific — reference actual skills and the listing details. Professional but not stiff."""

    raw = await chat_completion(
        [{"role": "user", "content": prompt}],
        temperature=0.65,
        max_tokens=1000,
    )

    try:
        # Strip markdown code fences if present
        cleaned = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        sections = json.loads(cleaned)
        return {
            "intro":         sections.get("intro", ""),
            "understanding": sections.get("understanding", ""),
            "plan":          sections.get("plan", ""),
            "timeline":      sections.get("timeline", ""),
            "pricing":       sections.get("pricing", ""),
        }
    except (ValueError, json.JSONDecodeError):
        # Fallback — return raw text in intro, empty other sections
        return {
            "intro":         raw[:500],
            "understanding": "",
            "plan":          "",
            "timeline":      "",
            "pricing":       "",
        }

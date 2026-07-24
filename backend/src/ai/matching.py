import json
from src.ai.nim_client import chat_completion


async def explain_match(
    student_profile: dict,
    listing_title: str,
    listing_description: str,
    listing_skills: list[str],
    score: float,
) -> str:
    """Generate a 1-2 sentence explanation of why this listing matches the student."""
    prompt = (
        f"Student skills: {', '.join(student_profile.get('skills', [])) or 'none'}\n"
        f"Student headline: {student_profile.get('headline', 'N/A')}\n"
        f"Student role: {student_profile.get('role', 'N/A')}\n\n"
        f"Listing: {listing_title}\n"
        f"Description: {listing_description[:300]}\n"
        f"Required skills: {', '.join(listing_skills) or 'none'}\n"
        f"Similarity score: {score:.0%}\n\n"
        "In 1-2 sentences, explain specifically why this listing is a good match for this student. "
        "Be concrete — mention actual skills or experience. Plain text only."
    )
    return await chat_completion(
        [{"role": "user", "content": prompt}],
        temperature=0.4,
        max_tokens=120,
    )


async def explain_matches_batch(
    student_profile: dict,
    matches: list[dict],
) -> list[str]:
    """
    Generate explanations for multiple matches in a single NIM call
    to minimize API round-trips.
    """
    if not matches:
        return []

    items_text = "\n".join(
        f"{i+1}. {m['title']} | skills: {', '.join(m['skills']) or 'none'} | score: {m['score']:.0%}"
        for i, m in enumerate(matches)
    )

    prompt = (
        f"Student skills: {', '.join(student_profile.get('skills', [])) or 'none'}\n"
        f"Student headline: {student_profile.get('headline', 'N/A')}\n\n"
        f"Listings:\n{items_text}\n\n"
        "For each listing, write exactly one sentence explaining why it matches this student. "
        f"Return a JSON array of {len(matches)} strings in the same order. No explanation outside the JSON."
    )

    raw = await chat_completion(
        [{"role": "user", "content": prompt}],
        temperature=0.4,
        max_tokens=600,
    )
    try:
        explanations = json.loads(raw)
        if isinstance(explanations, list) and len(explanations) == len(matches):
            return explanations
    except (ValueError, json.JSONDecodeError):
        pass

    # Fallback — empty explanations rather than crashing
    return ["" for _ in matches]

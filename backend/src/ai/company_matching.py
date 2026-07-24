import json
from src.ai.nim_client import chat_completion, embed_text


async def embed_requirement(
    role_title: str,
    description: str,
    required_skills: list[str],
) -> list[float]:
    text = f"{role_title}. {description}. Skills: {', '.join(required_skills)}"
    return await embed_text(text)


async def generate_candidate_summaries(
    requirement: dict,
    candidates: list[dict],
) -> list[str]:
    """Generate one-sentence candidate summaries in a single NIM call."""
    if not candidates:
        return []

    items = "\n".join(
        f"{i+1}. {c['name']} | skills: {', '.join(c['skills'])} | "
        f"score: {c['final_score']:.0%} | reviews: {c['total_reviews']}"
        for i, c in enumerate(candidates)
    )

    prompt = (
        f"Company: {requirement['company_name']}\n"
        f"Role: {requirement['role_title']}\n"
        f"Required skills: {', '.join(requirement['required_skills'])}\n\n"
        f"Candidates:\n{items}\n\n"
        f"For each candidate, write exactly one sentence explaining why they are a good fit. "
        f"Return a JSON array of {len(candidates)} strings in the same order. No explanation outside the JSON."
    )

    raw = await chat_completion(
        [{"role": "user", "content": prompt}],
        temperature=0.4,
        max_tokens=600,
    )
    try:
        result = json.loads(raw)
        if isinstance(result, list) and len(result) == len(candidates):
            return result
    except (ValueError, json.JSONDecodeError):
        pass
    return ["" for _ in candidates]

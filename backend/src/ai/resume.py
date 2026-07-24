import json
from src.ai.nim_client import chat_completion


async def generate_resume_content(context: dict) -> dict:
    """
    Generate polished biography and project summaries via NIM.
    Returns dict with: biography, skills_summary, project_summaries (list)
    """
    skills = ", ".join(context.get("skills", [])) or "not listed"
    portfolio_titles = ", ".join(p["title"] for p in context.get("portfolio", [])) or "none"
    reviews = context.get("aggregate_scores", {})
    overall = reviews.get("overall_avg", 0)
    total = reviews.get("total_reviews", 0)

    prompt = f"""Generate professional resume content for a student.

Profile:
  Name: {context['first_name']} {context['last_name']}
  University: {context.get('university', 'N/A')}
  Role/Focus: {context.get('role', 'N/A')}
  Headline: {context.get('headline', 'N/A')}
  Bio: {context.get('bio', 'N/A')}
  Skills: {skills}
  Projects: {portfolio_titles}
  Reputation: {overall}/5 from {total} reviews

Return ONLY a JSON object:
{{
  "biography": "3-4 sentence professional biography in third person",
  "skills_summary": "1-2 sentence summary of technical strengths",
  "tagline": "one punchy sentence under the name on the resume"
}}"""

    raw = await chat_completion(
        [{"role": "user", "content": prompt}],
        temperature=0.6,
        max_tokens=500,
    )
    try:
        cleaned = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        return json.loads(cleaned)
    except (ValueError, json.JSONDecodeError):
        return {"biography": context.get("bio", ""), "skills_summary": skills, "tagline": context.get("headline", "")}


RESUME_HTML_TEMPLATE = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 40px; color: #1a1a1a; font-size: 13px; line-height: 1.5; }
  h1 { font-size: 26px; margin: 0; font-weight: 700; }
  .tagline { color: #555; font-size: 13px; margin: 4px 0 2px; }
  .meta { color: #777; font-size: 12px; margin-bottom: 20px; }
  h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-top: 24px; margin-bottom: 10px; color: #333; }
  .bio { margin-bottom: 16px; }
  .skills { display: flex; flex-wrap: wrap; gap: 6px; }
  .skill-tag { background: #f0f0f0; padding: 2px 10px; border-radius: 12px; font-size: 12px; }
  .project { margin-bottom: 14px; }
  .project-title { font-weight: 600; font-size: 13px; }
  .project-tech { color: #777; font-size: 11px; margin: 2px 0; }
  .project-summary { font-size: 12px; }
  .scores { display: flex; gap: 20px; }
  .score-item { text-align: center; }
  .score-val { font-size: 20px; font-weight: 700; color: #2563eb; }
  .score-label { font-size: 10px; color: #777; text-transform: uppercase; }
  a { color: #2563eb; text-decoration: none; }
</style>
</head>
<body>
  <h1>{{ first_name }} {{ last_name }}</h1>
  <div class="tagline">{{ tagline }}</div>
  <div class="meta">
    {{ university }}{% if university and role %} &middot; {% endif %}{{ role }}
    {% if portfolio_url %} &middot; <a href="{{ portfolio_url }}">{{ portfolio_url }}</a>{% endif %}
  </div>

  <h2>About</h2>
  <div class="bio">{{ biography }}</div>

  {% if skills %}
  <h2>Skills</h2>
  <div class="skills">
    {% for skill in skills %}<span class="skill-tag">{{ skill }}</span>{% endfor %}
  </div>
  {% endif %}

  {% if portfolio %}
  <h2>Projects</h2>
  {% for project in portfolio %}
  <div class="project">
    <div class="project-title">{{ project.title }}{% if project.project_url %} &mdash; <a href="{{ project.project_url }}">{{ project.project_url }}</a>{% endif %}</div>
    {% if project.technologies %}<div class="project-tech">{{ project.technologies | join(', ') }}</div>{% endif %}
    {% if project.summary %}<div class="project-summary">{{ project.summary }}</div>{% endif %}
    {% if project.impact_statement %}<div class="project-summary"><em>{{ project.impact_statement }}</em></div>{% endif %}
  </div>
  {% endfor %}
  {% endif %}

  {% if aggregate_scores and aggregate_scores.total_reviews > 0 %}
  <h2>Reputation</h2>
  <div class="scores">
    <div class="score-item"><div class="score-val">{{ aggregate_scores.overall_avg }}</div><div class="score-label">Overall</div></div>
    <div class="score-item"><div class="score-val">{{ aggregate_scores.avg_reliability }}</div><div class="score-label">Reliability</div></div>
    <div class="score-item"><div class="score-val">{{ aggregate_scores.avg_professionalism }}</div><div class="score-label">Professionalism</div></div>
    <div class="score-item"><div class="score-val">{{ aggregate_scores.avg_growth }}</div><div class="score-label">Growth</div></div>
    <div class="score-item"><div class="score-val">{{ aggregate_scores.total_reviews }}</div><div class="score-label">Reviews</div></div>
  </div>
  {% endif %}
</body>
</html>"""

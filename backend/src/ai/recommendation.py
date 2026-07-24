from datetime import datetime, timezone


# Weights — tunable without code changes
WEIGHTS = {
    "vector":     0.55,
    "reputation": 0.30,
    "activity":   0.15,
}


def compute_final_score(vector: float, reputation: float, activity: float) -> float:
    score = (
        WEIGHTS["vector"]     * vector +
        WEIGHTS["reputation"] * reputation +
        WEIGHTS["activity"]   * activity
    )
    return round(min(score, 1.0), 4)


def reputation_signal(overall_avg: float, total_reviews: int) -> float:
    """
    Normalise reputation to 0-1.
    New users (0 reviews) get a neutral 0.5 so they still appear in results.
    """
    if total_reviews == 0:
        return 0.5
    # Scale 0-5 avg to 0-1, dampened by review count confidence
    confidence = min(total_reviews / 10, 1.0)   # full confidence at 10+ reviews
    raw = overall_avg / 5.0
    return round(0.5 * (1 - confidence) + raw * confidence, 4)


def activity_signal(created_at: datetime, review_count: int) -> float:
    """
    Recency decay + review volume signal.
    - Listings/profiles created recently score higher
    - More reviews = more active on platform
    """
    now = datetime.now(timezone.utc)
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)

    days_old = max((now - created_at).days, 0)
    recency = max(0.0, 1.0 - days_old / 180)       # decays to 0 over 6 months
    volume = min(review_count / 20, 1.0)            # full volume signal at 20 reviews
    return round(recency * 0.6 + volume * 0.4, 4)

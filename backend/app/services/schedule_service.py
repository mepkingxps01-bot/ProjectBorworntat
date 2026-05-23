from datetime import date, timedelta
from app.services.ai_service import generate_study_plan


def build_schedule(exam_date_str: str, topics: list[str]) -> list[dict]:
    """Build a study schedule from today until the exam date."""
    today = date.today()
    try:
        exam_date = date.fromisoformat(exam_date_str)
    except ValueError:
        return []

    days_available = (exam_date - today).days
    if days_available <= 0:
        return []

    # Use Claude to generate the plan
    plan = generate_study_plan(exam_date_str, topics, days_available)

    # If Claude generation failed, build a simple fallback plan
    if not plan:
        plan = _fallback_plan(today, exam_date, topics)

    return plan


def _fallback_plan(start: date, exam_date: date, topics: list[str]) -> list[dict]:
    """Simple round-robin fallback if AI generation fails."""
    plan = []
    current = start
    day_num = 1
    topic_idx = 0

    while current < exam_date:
        days_left = (exam_date - current).days
        if days_left == 1:
            session_type = "boss"
            desc = "Final Boss — Full exam simulation"
        elif days_left <= 3:
            session_type = "review"
            desc = "Intensive review of all topics"
        elif day_num % 4 == 0:
            session_type = "retrieval"
            desc = "Recall quiz — no peeking!"
        else:
            session_type = "new"
            desc = f"Study session: {topics[topic_idx % len(topics)]}"

        plan.append({
            "date": current.isoformat(),
            "day_number": day_num,
            "sessions": [
                {
                    "topic": topics[topic_idx % len(topics)],
                    "subtopics": [],
                    "type": session_type,
                    "estimated_minutes": 90,
                    "description": desc,
                }
            ],
        })

        current += timedelta(days=1)
        day_num += 1
        topic_idx += 1

    return plan

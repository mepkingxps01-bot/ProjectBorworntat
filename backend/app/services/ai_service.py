import json
import anthropic
from app.core.config import ANTHROPIC_API_KEY

client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)


def extract_content_from_text(text: str, filename: str) -> dict:
    """Extract structured knowledge tree from textbook text using Claude."""
    truncated = text[:12000]

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=8192,
        messages=[
            {
                "role": "user",
                "content": f"""You are a medical education AI extracting content from a textbook chapter: {filename}

Return ONLY valid JSON with this exact structure (no extra text before or after):
{{
  "topics": [
    {{
      "name": "Topic Name",
      "subtopics": [
        {{
          "name": "Subtopic Name",
          "key_facts": ["fact 1", "fact 2", "fact 3"],
          "mcq_questions": [
            {{
              "question": "Question text?",
              "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
              "correct_index": 0,
              "difficulty": 3,
              "explanation": "Why this answer is correct"
            }}
          ],
          "crq_questions": [
            {{
              "question": "Explain the mechanism of...",
              "model_answer": "Detailed model answer here",
              "difficulty": 4
            }}
          ]
        }}
      ]
    }}
  ]
}}

Rules:
- Only use facts from the provided text, never fabricate
- difficulty is 1 (easy) to 5 (expert)
- Generate at least 3 MCQ questions per subtopic
- Generate at least 1 CRQ question per subtopic

Text to extract from:
{truncated}""",
            }
        ],
    )

    response_text = message.content[0].text
    start = response_text.find("{")
    end = response_text.rfind("}") + 1
    if start != -1 and end > start:
        try:
            return json.loads(response_text[start:end])
        except json.JSONDecodeError:
            pass
    return {"topics": []}


def generate_study_plan(exam_date: str, topics: list[str], days_available: int) -> list:
    """Generate a spaced-repetition study plan using Make It Stick principles."""
    topics_str = "\n".join([f"- {t}" for t in topics])

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=8192,
        messages=[
            {
                "role": "user",
                "content": f"""Create a study schedule for a medical resident preparing for an exam.

Exam date: {exam_date}
Days available: {days_available}
Topics to master:
{topics_str}

Apply Make It Stick principles:
1. Spaced repetition: revisit topics at 1-day, 3-day, 7-day, 14-day intervals
2. Interleaving: mix different topics in each study session (do NOT block-study)
3. Retrieval practice: every session starts with a recall quiz on previous material
4. Elaborative interrogation: include "why/how does this work?" questions
5. Rest and consolidation: last day before exam = final boss review only

Session types:
- "new": learning new content for the first time
- "review": spaced repetition review of older content
- "retrieval": pure recall quiz, no teaching
- "boss": boss fight exam simulation (last 2 days only)

Return ONLY valid JSON array (no extra text):
[
  {{
    "date": "YYYY-MM-DD",
    "day_number": 1,
    "sessions": [
      {{
        "topic": "Glaucoma",
        "subtopics": ["Angle-closure glaucoma", "IOP measurement"],
        "type": "new",
        "estimated_minutes": 60,
        "description": "Introduction to glaucoma types and pathophysiology"
      }}
    ]
  }}
]""",
            }
        ],
    )

    response_text = message.content[0].text
    start = response_text.find("[")
    end = response_text.rfind("]") + 1
    if start != -1 and end > start:
        try:
            return json.loads(response_text[start:end])
        except json.JSONDecodeError:
            pass
    return []


def generate_battle_questions(topic: str, subtopic: str, count: int = 5) -> list[dict]:
    """Generate battle questions for a specific topic."""
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        messages=[
            {
                "role": "user",
                "content": f"""Generate {count} battle questions for an ophthalmology learning game.

Topic: {topic}
Subtopic: {subtopic}

Mix of difficulty levels (1=easy to 5=expert).
Include both MCQ and short-answer types.

Return ONLY valid JSON array:
[
  {{
    "question": "Question text?",
    "type": "mcq",
    "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
    "correct_index": 0,
    "difficulty": 2,
    "explanation": "Brief explanation",
    "damage": 20
  }},
  {{
    "question": "Short answer question?",
    "type": "crq",
    "model_answer": "Model answer here",
    "difficulty": 4,
    "damage": 45
  }}
]""",
            }
        ],
    )

    response_text = message.content[0].text
    start = response_text.find("[")
    end = response_text.rfind("]") + 1
    if start != -1 and end > start:
        try:
            return json.loads(response_text[start:end])
        except json.JSONDecodeError:
            pass
    return []

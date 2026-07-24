import io
import json
import logging
from pathlib import Path
from PIL import Image
import pytesseract
from src.ai.nim_client import chat_completion

logger = logging.getLogger(__name__)

SUPPORTED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
SUPPORTED_DOC_TYPES = {"application/pdf"}
MAX_OCR_CHARS = 4000   # truncate before sending to NIM


def _ocr_image(data: bytes, content_type: str) -> str:
    """Extract text from an image using pytesseract."""
    try:
        img = Image.open(io.BytesIO(data))
        text = pytesseract.image_to_string(img)
        return text.strip()
    except Exception as e:
        logger.warning("OCR failed: %s", e)
        return ""


def _ocr_pdf(data: bytes) -> str:
    """Convert PDF pages to images then OCR each page."""
    try:
        from pdf2image import convert_from_bytes
        pages = convert_from_bytes(data, dpi=150)
        texts = []
        for page in pages[:5]:   # cap at 5 pages
            texts.append(pytesseract.image_to_string(page))
        return "\n\n".join(t.strip() for t in texts if t.strip())
    except Exception as e:
        logger.warning("PDF OCR failed: %s", e)
        return ""


def extract_text(data: bytes, content_type: str) -> str:
    if content_type in SUPPORTED_IMAGE_TYPES:
        return _ocr_image(data, content_type)
    if content_type in SUPPORTED_DOC_TYPES:
        return _ocr_pdf(data)
    return ""


async def analyze_project(raw_text: str, filename: str) -> dict:
    """
    Send extracted text to NIM and get back structured portfolio fields.
    Returns dict with: title, summary, impact_statement, technologies, project_url
    """
    truncated = raw_text[:MAX_OCR_CHARS]
    if not truncated.strip():
        return _empty_analysis(filename)

    prompt = f"""You are analyzing a student's project file to extract portfolio information.

Filename: {filename}
Extracted content:
---
{truncated}
---

Based on this content, extract the following and return ONLY a JSON object:
{{
  "title": "concise project title (max 10 words)",
  "summary": "2-3 sentence description of what the project does",
  "impact_statement": "1-2 sentences on the impact or outcome of the project",
  "technologies": ["list", "of", "technologies", "used"],
  "project_url": null
}}

If a field cannot be determined from the content, use null for strings or [] for arrays.
Return only the JSON object, no explanation."""

    raw = await chat_completion(
        [{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=600,
    )

    try:
        cleaned = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        result = json.loads(cleaned)
        return {
            "title":            result.get("title") or Path(filename).stem,
            "summary":          result.get("summary") or "",
            "impact_statement": result.get("impact_statement") or "",
            "technologies":     result.get("technologies") or [],
            "project_url":      result.get("project_url"),
        }
    except (ValueError, json.JSONDecodeError):
        return _empty_analysis(filename)


def _empty_analysis(filename: str) -> dict:
    return {
        "title":            Path(filename).stem,
        "summary":          "",
        "impact_statement": "",
        "technologies":     [],
        "project_url":      None,
    }

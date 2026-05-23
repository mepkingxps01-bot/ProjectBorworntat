import fitz  # PyMuPDF
import io


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract all text from a PDF file."""
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    full_text = []

    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        text = page.get_text("text")
        if text.strip():
            full_text.append(f"[Page {page_num + 1}]\n{text}")

    doc.close()
    return "\n\n".join(full_text)


def extract_chapters(file_bytes: bytes) -> list[dict]:
    """Try to extract chapters/sections from PDF based on headings."""
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    chapters = []
    current_chapter = {"title": "Introduction", "text": "", "pages": []}

    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        blocks = page.get_text("dict")["blocks"]

        page_text = []
        for block in blocks:
            if block.get("type") == 0:
                for line in block.get("lines", []):
                    for span in line.get("spans", []):
                        size = span.get("size", 12)
                        text = span.get("text", "").strip()
                        if not text:
                            continue
                        if size >= 14 and len(text) > 3 and len(text) < 100:
                            if current_chapter["text"].strip():
                                chapters.append(current_chapter)
                            current_chapter = {"title": text, "text": "", "pages": [page_num + 1]}
                        else:
                            page_text.append(text)

        current_chapter["text"] += " ".join(page_text) + "\n"
        if page_num + 1 not in current_chapter["pages"]:
            current_chapter["pages"].append(page_num + 1)

    if current_chapter["text"].strip():
        chapters.append(current_chapter)

    doc.close()
    return chapters if chapters else [{"title": "Full Content", "text": extract_text_from_pdf(file_bytes), "pages": []}]

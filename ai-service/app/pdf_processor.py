from pathlib import Path

from fastapi import HTTPException
from pypdf import PdfReader
from pypdf.errors import EmptyFileError, PdfReadError


def extract_text_from_pdf(file_path):
    path = Path(file_path)

    if not path.is_file():
        raise HTTPException(
            status_code=404,
            detail=f"PDF file not found: {path}",
        )

    if path.stat().st_size == 0:
        raise HTTPException(
            status_code=400,
            detail=f"PDF file is empty: {path}",
        )

    try:
        reader = PdfReader(str(path))
    except EmptyFileError as exc:
        raise HTTPException(
            status_code=400,
            detail=f"PDF file is empty: {path}",
        ) from exc
    except PdfReadError as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid or corrupted PDF: {path}",
        ) from exc

    text = ""

    for page in reader.pages:
        page_text = page.extract_text()

        if page_text:
            text += page_text + "\n"

    return text
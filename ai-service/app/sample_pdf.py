from pathlib import Path
import shutil

from pypdf import PdfWriter

BASE_DIR = Path(__file__).resolve().parent.parent
SAMPLE_PDF = BASE_DIR / "test_files" / "sample.pdf"
BACKEND_SAMPLE = (
    BASE_DIR.parent / "backend" / "uploads" / "1787211712835-Eyasu_Kerie_Cover_Letter_FINETO (1).pdf"
)


def ensure_sample_pdf() -> Path:
    if SAMPLE_PDF.is_file() and SAMPLE_PDF.stat().st_size > 0:
        return SAMPLE_PDF

    SAMPLE_PDF.parent.mkdir(parents=True, exist_ok=True)

    if BACKEND_SAMPLE.is_file() and BACKEND_SAMPLE.stat().st_size > 0:
        shutil.copy2(BACKEND_SAMPLE, SAMPLE_PDF)
        return SAMPLE_PDF

    writer = PdfWriter()
    writer.add_blank_page(width=612, height=792)

    with SAMPLE_PDF.open("wb") as pdf_file:
        writer.write(pdf_file)

    return SAMPLE_PDF

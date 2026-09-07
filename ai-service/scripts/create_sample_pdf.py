import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from app.sample_pdf import ensure_sample_pdf

if __name__ == "__main__":
    pdf_path = ensure_sample_pdf()
    print(f"Sample PDF ready at {pdf_path} ({pdf_path.stat().st_size} bytes)")

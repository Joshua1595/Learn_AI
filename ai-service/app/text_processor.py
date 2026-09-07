
import re


def clean_text(text):
    if not text:
        return ""

    # Normalize line breaks
    text = text.replace("\r\n", "\n")
    text = text.replace("\r", "\n")

    # Normalize spaces and tabs
    text = re.sub(r"[ \t]+", " ", text)

    # Join words that were split by PDF line extraction
    text = re.sub(r"(?<=\w)\n(?=\w)", " ", text)

    # Keep paragraph/section breaks
    text = re.sub(r"\n{3,}", "\n\n", text)

    # Remove spaces around remaining newlines
    text = re.sub(r" *\n *", "\n", text)

    return text.strip()


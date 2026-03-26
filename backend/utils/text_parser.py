# utils/text_parser.py

import re
import logging

logger = logging.getLogger(__name__)


class TextParser:
    """
    Parses raw LLM output into structured blog fields.
    Handles messy or incomplete model output gracefully.
    """

    def parse(self, raw_text: str, keyword: str) -> dict:
        if not raw_text or not raw_text.strip():
            raise ValueError("Raw text cannot be empty.")

        # Clean up raw text first
        cleaned = self._clean_text(raw_text)

        # Extract fields
        title   = self._extract_title(cleaned, keyword)
        content = self._extract_content(cleaned)

        result = {
            "title":   title,
            "content": content
        }

        logger.info(f"✅ Parsed blog — title: '{title[:50]}...'")
        return result

    def _clean_text(self, text: str) -> str:

        text = text.replace("<s>", "").replace("</s>", "")
        text = text.replace("[INST]", "").replace("[/INST]", "")

        # Remove excessive blank lines (3+ → 2)
        text = re.sub(r'\n{3,}', '\n\n', text)

        # Strip leading/trailing whitespace
        text = text.strip()

        return text

    def _extract_title(self, text: str, keyword: str) -> str:
        match = re.search(r'^#\s+(.+)$', text, re.MULTILINE)

        if match:
            title = match.group(1).strip()
            title = re.sub(r'[*_]', '', title)
            return title

        logger.warning("No H1 title found in output — using fallback")
        return f"The Complete Guide to {keyword.title()}"

    def _extract_content(self, text: str) -> str:
        
        match = re.search(r'^#\s+.+', text, re.MULTILINE)

        if match:
            content = text[match.start():].strip()
            return content

        logger.warning("No heading structure found — returning full text")
        return text.strip()

    def validate_structure(self, content: str) -> dict:

        checks = {
            "has_title":       bool(re.search(r'^#\s+.+',   content, re.MULTILINE)),
            "has_h2":          bool(re.search(r'^##\s+.+',  content, re.MULTILINE)),
            "has_h3":          bool(re.search(r'^###\s+.+', content, re.MULTILINE)),
            "has_faq":         "FAQ" in content or "faq" in content.lower(),
            "has_conclusion":  "Conclusion" in content or "conclusion" in content.lower(),
            "has_cta":         "Call to Action" in content or "action" in content.lower(),
            "min_length":      len(content.split()) >= 300
        }

        checks["is_valid"] = all(checks.values())
        return checks

text_parser = TextParser()
# services/seo_service.py

import re
import logging
import textstat

logger = logging.getLogger(__name__)


class SEOService:
    """
    Analyzes generated blog content and returns SEO metrics.
    Completely stateless — no model, no DB, pure text analysis.
    """

    # ------------------------------------------------------------------
    # Main Analysis Entry Point
    # ------------------------------------------------------------------

    def analyze(self, content: str, keyword: str) -> dict:
        """
        Run full SEO analysis on generated blog content.

        Args:
            content: Full blog text (raw string from model)
            keyword: Target keyword entered by user

        Returns:
            Dictionary of all SEO metrics
        """
        if not content or not content.strip():
            raise ValueError("Content cannot be empty for SEO analysis.")

        if not keyword or not keyword.strip():
            raise ValueError("Keyword cannot be empty for SEO analysis.")

        keyword = keyword.strip().lower()

        try:
            word_count         = self._get_word_count(content)
            keyword_density    = self._get_keyword_density(content, keyword)
            readability        = self._get_readability(content)
            heading_structure  = self._get_heading_structure(content)
            seo_score          = self._calculate_seo_score(
                                     word_count,
                                     keyword_density,
                                     readability,
                                     heading_structure
                                 )

            result = {
                "word_count":        word_count,
                "keyword_density":   keyword_density,
                "readability_score": readability,
                "heading_structure": heading_structure,
                "seo_score":         seo_score,
            }

            logger.info(f"SEO analysis complete — score: {seo_score}")
            return result

        except Exception as e:
            logger.error(f"SEO analysis failed: {str(e)}")
            raise RuntimeError(f"SEO analysis failed: {str(e)}")

    # ------------------------------------------------------------------
    # Word Count
    # ------------------------------------------------------------------

    def _get_word_count(self, content: str) -> int:
        """Count total words in content."""
        words = content.split()
        return len(words)

    # ------------------------------------------------------------------
    # Keyword Density
    # ------------------------------------------------------------------

    def _get_keyword_density(self, content: str, keyword: str) -> float:
        """
        Calculate keyword density as a percentage.
        Formula: (keyword occurrences / total words) * 100

        Ideal range: 1.0% - 2.5%
        """
        content_lower = content.lower()
        word_count    = len(content.split())

        if word_count == 0:
            return 0.0

        # Count exact keyword phrase occurrences
        keyword_count = content_lower.count(keyword)

        density = round((keyword_count / word_count) * 100, 2)
        return density

    # ------------------------------------------------------------------
    # Readability
    # ------------------------------------------------------------------

    def _get_readability(self, content: str) -> float:
        """
        Calculate Flesch Reading Ease score using textstat.

        Score interpretation:
        90-100 → Very easy (5th grade)
        60-70  → Standard (8th-9th grade)  ← ideal for blogs
        30-50  → Difficult (college level)
        0-30   → Very difficult (professional)
        """
        try:
            score = textstat.flesch_reading_ease(content)
            # Clamp between 0 and 100
            return round(max(0.0, min(100.0, score)), 2)
        except Exception:
            return 50.0  # Return neutral score on failure

    # ------------------------------------------------------------------
    # Heading Structure
    # ------------------------------------------------------------------

    def _get_heading_structure(self, content: str) -> dict:
        """
        Detect heading counts in markdown format.
        Checks for # H1, ## H2, ### H3 headings.
        """
        h1_count = len(re.findall(r'^#{1}\s+.+',  content, re.MULTILINE))
        h2_count = len(re.findall(r'^#{2}\s+.+',  content, re.MULTILINE))
        h3_count = len(re.findall(r'^#{3}\s+.+',  content, re.MULTILINE))

        return {
            "h1": h1_count,
            "h2": h2_count,
            "h3": h3_count,
            "has_proper_structure": (
                h1_count >= 1 and   # Must have at least one H1
                h2_count >= 2 and   # Must have at least two H2s
                h3_count >= 1       # Must have at least one H3
            )
        }

    # ------------------------------------------------------------------
    # SEO Score Calculator
    # ------------------------------------------------------------------

    def _calculate_seo_score(
        self,
        word_count:        int,
        keyword_density:   float,
        readability:       float,
        heading_structure: dict
    ) -> int:
        """
        Calculate an overall SEO score out of 100.

        Breakdown:
        - Word count:        25 points
        - Keyword density:   25 points
        - Readability:       25 points
        - Heading structure: 25 points
        """
        score = 0

        # ── Word Count (25 pts) ──────────────────────────────────────
        # Ideal blog length: 1200-2000 words
        if word_count >= 1500:
            score += 25
        elif word_count >= 1000:
            score += 18
        elif word_count >= 700:
            score += 12
        elif word_count >= 300:
            score += 6
        else:
            score += 0

        # ── Keyword Density (25 pts) ─────────────────────────────────
        # Ideal: 1.0% - 2.5%
        if 1.0 <= keyword_density <= 2.5:
            score += 25
        elif 0.5 <= keyword_density < 1.0:
            score += 15
        elif 2.5 < keyword_density <= 4.0:
            score += 10
        else:
            score += 0

        # ── Readability (25 pts) ─────────────────────────────────────
        # Ideal Flesch score for blogs: 60-80
        if 60 <= readability <= 80:
            score += 25
        elif 50 <= readability < 60:
            score += 18
        elif 80 < readability <= 90:
            score += 18
        elif 40 <= readability < 50:
            score += 10
        else:
            score += 5

        # ── Heading Structure (25 pts) ───────────────────────────────
        if heading_structure.get("has_proper_structure"):
            score += 25
        else:
            # Partial credit
            h1 = heading_structure.get("h1", 0)
            h2 = heading_structure.get("h2", 0)
            h3 = heading_structure.get("h3", 0)
            if h1 >= 1: score += 10
            if h2 >= 1: score += 8
            if h3 >= 1: score += 7

        return min(score, 100)  # Cap at 100


# ── Singleton instance ───────────────────────────────────────────────────────
seo_service = SEOService()
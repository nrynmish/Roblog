from datetime import datetime, timezone


def create_blog_document(
    keyword:           str,
    title:             str,
    content:           str,
    seo_score:         int,
    readability_score: float,
    keyword_density:   float,
    word_count:        int,
    heading_structure: dict,
) -> dict:
    """
    Returns a clean MongoDB document dict.
    """
    return {
        "keyword":           keyword.strip().lower(),
        "title":             title,
        "content":           content,
        "seo_score":         seo_score,
        "readability_score": readability_score,
        "keyword_density":   keyword_density,
        "word_count":        word_count,
        "heading_structure": heading_structure,
        "status":            "generated",
        "created_at":        datetime.now(timezone.utc),
        "updated_at":        datetime.now(timezone.utc),
    }
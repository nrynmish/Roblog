import logging
from datetime import datetime, timezone

from services.model_service import model_service
from services.seo_service    import seo_service
from database.mongo          import mongo
from utils.prompt_builder    import prompt_builder
from utils.text_parser       import text_parser

logger = logging.getLogger(__name__)


class BlogService:
    """
    Main pipeline orchestrator.
    Connects every service into a single generate() call:

    keyword → prompt → model → parse → seo → store → return
    """

    def generate_blog(self, keyword: str) -> dict:
        if not keyword or not keyword.strip():
            raise ValueError("Keyword cannot be empty.")

        keyword = keyword.strip().lower()
        logger.info(f"Starting blog generation for keyword: '{keyword}'")

        logger.info("Step 1/5 — Building prompt...")
        try:
            prompt = prompt_builder.build_blog_prompt(keyword)
        except Exception as e:
            logger.error(f"Prompt building failed: {e}")
            raise RuntimeError(f"Prompt building failed: {str(e)}")

        logger.info("Step 2/5 — Running Mistral inference...")
        try:
            raw_output = model_service.generate(prompt)
        except Exception as e:
            logger.error(f"Model generation failed: {e}")
            raise RuntimeError(f"Model generation failed: {str(e)}")

        logger.info("Step 3/5 — Parsing model output...")
        try:
            parsed = text_parser.parse(raw_output, keyword)
            title   = parsed["title"]
            content = parsed["content"]
        except Exception as e:
            logger.error(f"Parsing failed: {e}")
            raise RuntimeError(f"Text parsing failed: {str(e)}")

        logger.info("Step 4/5 — Running SEO analysis...")
        try:
            seo_metrics = seo_service.analyze(content, keyword)
        except Exception as e:
            logger.error(f"SEO analysis failed: {e}")
            raise RuntimeError(f"SEO analysis failed: {str(e)}")

        logger.info("Step 5/5 — Storing blog in MongoDB...")
        try:
            blog_document = {
                "keyword":           keyword,
                "title":             title,
                "content":           content,
                "seo_score":         seo_metrics["seo_score"],
                "readability_score": seo_metrics["readability_score"],
                "keyword_density":   seo_metrics["keyword_density"],
                "word_count":        seo_metrics["word_count"],
                "heading_structure": seo_metrics["heading_structure"],
                "status":            "generated",
                "created_at":        datetime.now(timezone.utc)
            }

            blog_id = mongo.insert_blog(blog_document)

        except Exception as e:
            logger.error(f"DB storage failed: {e}")
            raise RuntimeError(f"Database storage failed: {str(e)}")

        response = {
            "id":                blog_id,
            "keyword":           keyword,
            "title":             title,
            "content":           content,
            "seo_score":         seo_metrics["seo_score"],
            "readability_score": seo_metrics["readability_score"],
            "keyword_density":   seo_metrics["keyword_density"],
            "word_count":        seo_metrics["word_count"],
            "heading_structure": seo_metrics["heading_structure"],
            "status":            "generated",
            "created_at":        blog_document["created_at"].isoformat()
        }

        logger.info(f"Blog generation complete — ID: {blog_id} | SEO Score: {seo_metrics['seo_score']}")
        return response

    def get_blog(self, blog_id: str) -> dict:
        """
        Retrieve a stored blog by its MongoDB ID.

        Args:
            blog_id: MongoDB ObjectId string

        Returns:
            Blog document dict

        Raises:
            ValueError: If blog not found
        """
        logger.info(f"Fetching blog ID: {blog_id}")

        blog = mongo.get_blog_by_id(blog_id)

        if not blog:
            raise ValueError(f"Blog not found: {blog_id}")

        return blog

    def get_all_blogs(self, limit: int = 20) -> list:
        logger.info(f"Fetching all blogs (limit: {limit})")
        return mongo.get_all_blogs(limit=limit)

    def delete_blog(self, blog_id: str) -> dict:
        logger.info(f"Deleting blog ID: {blog_id}")

        deleted = mongo.delete_blog(blog_id)

        if not deleted:
            raise ValueError(f"Blog not found: {blog_id}")

        return {"message": f"Blog {blog_id} deleted successfully"}

blog_service = BlogService()
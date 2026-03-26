import logging
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse

from services.blog_service import blog_service
from schemas.blog_schema   import (
    GenerateBlogRequest,
    GenerateBlogResponse,
    DeleteResponse,
    ErrorResponse
)

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post(
    "/generate-blog",
    response_model=GenerateBlogResponse,
    summary="Generate an SEO-optimized blog",
    description="Takes a keyword and returns a fully generated SEO blog with metrics"
)
async def generate_blog(request: GenerateBlogRequest):
    try:
        logger.info(f"POST /generate-blog — keyword: '{request.keyword}'")
        result = blog_service.generate_blog(request.keyword)
        return JSONResponse(status_code=200, content=result)

    except ValueError as e:
        # Bad input from user
        logger.warning(f"Validation error: {e}")
        raise HTTPException(status_code=422, detail=str(e))

    except RuntimeError as e:
        # Internal pipeline failure
        logger.error(f"Pipeline error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get(
    "/blogs",
    summary="Get all blogs",
    description="Returns a list of all generated blogs, newest first"
)
async def get_all_blogs(
    limit: int = Query(default=20, ge=1, le=100, description="Max blogs to return")
):
    try:
        logger.info(f"GET /blogs — limit: {limit}")
        blogs = blog_service.get_all_blogs(limit=limit)
        return JSONResponse(status_code=200, content={
            "count": len(blogs),
            "blogs": blogs
        })

    except Exception as e:
        logger.error(f"Failed to fetch blogs: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get(
    "/blogs/{blog_id}",
    summary="Get blog by ID",
    description="Returns a single blog with full content by its MongoDB ID"
)
async def get_blog(blog_id: str):
    try:
        logger.info(f"GET /blogs/{blog_id}")
        blog = blog_service.get_blog(blog_id)
        return JSONResponse(status_code=200, content=blog)

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    except Exception as e:
        logger.error(f"Failed to fetch blog: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete(
    "/blogs/{blog_id}",
    response_model=DeleteResponse,
    summary="Delete a blog",
    description="Permanently deletes a blog from MongoDB by ID"
)
async def delete_blog(blog_id: str):
    try:
        logger.info(f"DELETE /blogs/{blog_id}")
        result = blog_service.delete_blog(blog_id)
        return JSONResponse(status_code=200, content=result)

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    except Exception as e:
        logger.error(f"Failed to delete blog: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get(
    "/health/model",
    summary="Check model and DB status",
    description="Returns model load status and DB connection status"
)
async def health_check():
    from services.model_service import model_service
    from database.mongo         import mongo

    return JSONResponse(status_code=200, content={
        "model": model_service.health(),
        "database": mongo.health()
    })
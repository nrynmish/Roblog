from pydantic import BaseModel, Field
from typing   import Optional
from datetime import datetime

class GenerateBlogRequest(BaseModel):
    keyword: str = Field(
        ...,                            # Required field
        min_length=2,
        max_length=100,
        description="SEO target keyword",
        examples=["AI marketing"]
    )

class HeadingStructure(BaseModel):
    h1:                  int
    h2:                  int
    h3:                  int
    has_proper_structure: bool


class GenerateBlogResponse(BaseModel):
    id:                str
    keyword:           str
    title:             str
    content:           str
    seo_score:         int
    readability_score: float
    keyword_density:   float
    word_count:        int
    heading_structure: HeadingStructure
    status:            str
    created_at:        str


class BlogSummary(BaseModel):
    id:        str
    keyword:   str
    title:     str
    seo_score: int
    status:    str


class DeleteResponse(BaseModel):
    message: str


class ErrorResponse(BaseModel):
    error:   str
    detail:  Optional[str] = None
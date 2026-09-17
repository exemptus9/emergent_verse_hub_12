from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone
import uuid


class Poem(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    slug: str
    content: str
    categories: List[str] = []
    tags: List[str] = []
    date: str
    author: str = "rhymemosaic"
    comments: int = 0
    rating: float = 0.0
    ratingCount: int = 0
    totalRatingSum: float = 0.0
    isAnnouncement: bool = False
    amazonLink: Optional[str] = None
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PoemCreate(BaseModel):
    title: str
    slug: str
    content: str
    categories: List[str] = []
    tags: List[str] = []
    date: str
    author: str = "rhymemosaic"
    isAnnouncement: bool = False
    amazonLink: Optional[str] = None


class PoemUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    content: Optional[str] = None
    categories: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    date: Optional[str] = None
    author: Optional[str] = None
    isAnnouncement: Optional[bool] = None
    amazonLink: Optional[str] = None


class Rating(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    poemId: str
    visitorId: str
    rating: int
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class RatingCreate(BaseModel):
    rating: int = Field(ge=1, le=5)


class Comment(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    poemId: str
    author: str
    content: str
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CommentCreate(BaseModel):
    author: str = "Guest"
    content: str


class AdminLogin(BaseModel):
    password: str


class AdminChangePassword(BaseModel):
    current_password: str
    new_password: str


class NewsletterSubscribe(BaseModel):
    email: str


class BulkEmailRequest(BaseModel):
    subject: str
    content: str
    test_mode: bool = False


class ContactMessageRequest(BaseModel):
    name: str
    email: str
    subject: str = ""
    message: str

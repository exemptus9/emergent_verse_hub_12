from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
import logging

from database import client
from routes import poems, taxonomy, newsletter, contact, admin, seed, seo, analytics

app = FastAPI(title="RhymeMosaic API")

# Create a router with the /api prefix
from fastapi import APIRouter
api_router = APIRouter(prefix="/api")

# Include all route modules
api_router.include_router(poems.router)
api_router.include_router(taxonomy.router)
api_router.include_router(newsletter.router)
api_router.include_router(contact.router)
api_router.include_router(admin.router)
api_router.include_router(seed.router)
api_router.include_router(seo.router)
api_router.include_router(analytics.router)

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

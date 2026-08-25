from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from core.limiter import limiter
from core.database import Base, engine, SessionLocal
from core.seed import seed_admin
from routers import feedback, auth
from audit import router as audit_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Create database tables on remote serverless DB
    Base.metadata.create_all(bind=engine)

    # 2. Seed initial admin account
    db = SessionLocal()
    try:
        seed_admin(db)
    finally:
        db.close()
        
    yield


app = FastAPI(title="Customer Feedback Intelligence Dashboard", lifespan=lifespan)

# --- rate limiting setup ---
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)
# ---------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://*.vercel.app"],  # Updated for production frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(feedback.router, prefix="/api")
app.include_router(audit_router.router, prefix="/api")

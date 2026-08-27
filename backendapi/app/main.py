from fastapi import FastAPI,status,Request
from fastapi.responses import JSONResponse
import logging
import traceback
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from slowapi.middleware import SlowAPIMiddleware
from app.core.limiter import limiter
from app.core.database import Base, engine, SessionLocal
from app.core.seed import seed_admin
from app.routers import feedback, auth
from app.audit import router as audit_router


Base.metadata.create_all(bind=engine)

app = FastAPI(title="Customer Feedback Intelligence Dashboard")

# configure logging  to write error detail on the terminal
logging.basicConfig(level=logging.INFO,filename="app.log")

logger = logging.getLogger("api_logger")
logger=logging.getLogger(__name__)

# --- rate limiting setup ---
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)
# ---------------------------

# Allowed origin URLs for CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://feedback-intelligence-opal.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    db = SessionLocal()
    try:
        seed_admin(db)
    finally:
        db.close()


app.include_router(auth.router, prefix="/api")
app.include_router(feedback.router, prefix="/api")
app.include_router(audit_router.router, prefix="/api")

# add middleware
@app.middleware("http")
async def catch_exception_middleware(request:Request,call_next):
    try:
        return await call_next(request)
    except Exception as e:
        error_trace=traceback.format_exc()
        logger.error(
            f"Unhandled Exception on {request.method} {request.url.path}\n"
            f"Error details: {str(e)}\n"
            f"Traceback:\n{error_trace}"
        )
        return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "error": "InternalServerError",
                    "message": str(e),
                    "path": str(request.url.path),
                },
            )
        



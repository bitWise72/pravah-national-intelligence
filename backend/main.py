"""
PRAVAH Backend - FastAPI Application
National Demographic Intelligence Platform API
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging

from config import get_settings
from database import init_db
from routers import census, migration, biometric_risk, risk_zones, anomalies, search
from middleware.rate_limiter import limiter
from middleware.audit_logger import AuditLoggerMiddleware

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events."""
    # Startup
    logger.info("Starting PRAVAH Backend API...")
    init_db()
    logger.info("Database initialized")
    yield
    # Shutdown
    logger.info("Shutting down PRAVAH Backend API...")


# Create FastAPI application
app = FastAPI(
    title="PRAVAH API",
    description="Census-as-a-Service: Privacy-Preserving Demographic Intelligence",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add CORS middleware
origins = settings.allowed_origins.split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add audit logging middleware
if settings.enable_audit_log:
    app.add_middleware(AuditLoggerMiddleware)

# Add rate limiting
app.state.limiter = limiter


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "PRAVAH API",
        "version": "1.0.0"
    }


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "PRAVAH National Demographic Intelligence Platform API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }


# Include routers
app.include_router(census.router, prefix="/api", tags=["Census"])
app.include_router(migration.router, prefix="/api", tags=["Migration"])
app.include_router(biometric_risk.router, prefix="/api", tags=["Biometric Risk"])
app.include_router(risk_zones.router, prefix="/api", tags=["Risk Zones"])
app.include_router(anomalies.router, prefix="/api", tags=["Anomalies"])
app.include_router(search.router, prefix="/api", tags=["Search"])


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler for unhandled errors."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": str(exc) if settings.debug else "An error occurred"
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.reload,
        log_level=settings.log_level.lower()
    )

"""
Audit Logger Middleware
Logs all API requests and responses for compliance and security.
"""
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import logging
import time
import json
from pathlib import Path

logger = logging.getLogger("audit")

# Create logs directory if it doesn't exist
log_dir = Path("logs")
log_dir.mkdir(exist_ok=True)

# Configure audit logger
audit_handler = logging.FileHandler(log_dir / "audit.log")
audit_handler.setFormatter(
    logging.Formatter('%(asctime)s - %(message)s')
)
logger.addHandler(audit_handler)
logger.setLevel(logging.INFO)


class AuditLoggerMiddleware(BaseHTTPMiddleware):
    """Middleware to log all API requests for audit purposes."""
    
    async def dispatch(self, request: Request, call_next):
        """Process request and log audit information."""
        start_time = time.time()
        
        # Extract request information
        client_ip = request.client.host if request.client else "unknown"
        method = request.method
        path = request.url.path
        query_params = dict(request.query_params)
        
        # Process request
        response = await call_next(request)
        
        # Calculate duration
        duration = time.time() - start_time
        
        # Log audit entry
        audit_entry = {
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "client_ip": client_ip,
            "method": method,
            "path": path,
            "query_params": query_params,
            "status_code": response.status_code,
            "duration_ms": round(duration * 1000, 2)
        }
        
        logger.info(json.dumps(audit_entry))
        
        return response

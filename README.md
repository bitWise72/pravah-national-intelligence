# PRAVAH Policy Insights - Backend Setup Guide

## Quick Start

### Prerequisites
- Python 3.9+ installed
- PostgreSQL 14+ (or Docker)
- Node.js 18+ and npm

### Option 1: Using Docker (Recommended)

1. **Start all services with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

   This will start:
   - PostgreSQL database on port 5432
   - FastAPI backend on port 8000

2. **Run data ingestion (inside container):**
   ```bash
   docker-compose exec backend python scripts/ingest_data.py
   ```

3. **Compute risk zones:**
   ```bash
   docker-compose exec backend python scripts/compute_risk_zones.py
   ```

### Option 2: Local Development

1. **Set up PostgreSQL database:**
   ```bash
   # Create database
   createdb pravah_db
   
   # Or using psql
   psql -U postgres -c "CREATE DATABASE pravah_db;"
   ```

2. **Configure backend environment:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Install Python dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. **Run data ingestion:**
   ```bash
   cd backend
   python scripts/ingest_data.py
   ```
   
   This will process ~4.9M records. Expected time: 15-30 minutes.

5. **Compute risk zones:**
   ```bash
   python scripts/compute_risk_zones.py
   ```

6. **Start the backend server:**
   ```bash
   python main.py
   # Or with uvicorn directly:
   uvicorn main:app --reload
   ```

   Backend will be available at: http://localhost:8000
   API docs at: http://localhost:8000/docs

### Frontend Setup

1. **Configure frontend environment:**
   ```bash
   cp .env.example .env
   # Edit .env if needed (defaults should work)
   ```

2. **Install dependencies (if not already done):**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

   Frontend will be available at: http://localhost:8080

## API Endpoints

Once the backend is running, you can access:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

### Example API Calls

```bash
# Get calibrated census data
curl "http://localhost:8000/api/census/calibrated?pincode=110001"

# Get risk zones
curl "http://localhost:8000/api/risk-zones?risk_level=critical&limit=10"

# Search for locations
curl "http://localhost:8000/api/search?query=Delhi"

# Get anomalies
curl "http://localhost:8000/api/anomalies?limit=20"
```

## Troubleshooting

### Database Connection Issues

If you see database connection errors:

1. Check PostgreSQL is running:
   ```bash
   # Linux/Mac
   sudo systemctl status postgresql
   
   # Windows
   pg_ctl status
   ```

2. Verify database exists:
   ```bash
   psql -U postgres -l | grep pravah_db
   ```

3. Check DATABASE_URL in backend/.env matches your setup

### Data Ingestion Errors

If ingestion fails:

1. Verify CSV files are extracted:
   ```bash
   ls -la public/extracted_data/
   ```

2. Check DATA_PATH in backend/.env points to correct location

3. Run with verbose logging:
   ```bash
   cd backend
   LOG_LEVEL=DEBUG python scripts/ingest_data.py
   ```

### Frontend API Connection

If frontend can't connect to backend:

1. Check backend is running on port 8000
2. Verify VITE_API_BASE_URL in .env
3. Check browser console for CORS errors
4. Ensure ALLOWED_ORIGINS in backend/.env includes frontend URL

## Development Workflow

1. **Backend changes**: FastAPI auto-reloads with `--reload` flag
2. **Frontend changes**: Vite HMR updates automatically
3. **Database schema changes**: 
   - Modify models in `backend/models/`
   - Restart backend to recreate tables
   - Re-run ingestion if needed

## Next Steps

- Review API documentation at http://localhost:8000/docs
- Explore frontend at http://localhost:8080
- Check `ETHICS.md` for privacy compliance guidelines
- See `implementation_plan.md` for full architecture details

## Production Deployment

For production deployment:

1. Use Docker Compose with production settings
2. Set strong API_SECRET_KEY in .env
3. Configure proper DATABASE_URL with credentials
4. Set DEBUG=false
5. Use environment-specific ALLOWED_ORIGINS
6. Enable HTTPS and set up reverse proxy (Nginx/Caddy)
7. Implement proper backup strategy for PostgreSQL

For detailed deployment instructions, see the implementation plan.

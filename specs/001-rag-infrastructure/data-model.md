# Data Model: RAG Infrastructure

## Entities

### HealthStatus
- **status**: string (required) - System status (e.g., "healthy", "degraded", "unhealthy")
- **timestamp**: datetime (required) - Time of status check
- **services**: object (optional) - Status of dependent services
  - qdrant: boolean - Qdrant connection status
  - postgres: boolean - PostgreSQL connection status
  - external_apis: object - Status of external API connections

### EnvironmentConfig
- **GEMINI_API_KEY**: string (required) - API key for Gemini model access
- **QDRANT_URL**: string (required) - URL for Qdrant Cloud instance
- **QDRANT_API_KEY**: string (required) - API key for Qdrant Cloud
- **NEON_DB_URL**: string (required) - Connection string for Neon Serverless PostgreSQL

## Relationships
- HealthStatus provides system monitoring for the overall RAG infrastructure
- EnvironmentConfig contains the configuration needed by all RAG components

## Validation Rules
- All environment configuration values must be present for system to start
- Health status must be updated regularly and reflect actual service connectivity
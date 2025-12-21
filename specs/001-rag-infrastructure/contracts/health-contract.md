# Health API Contract

## Endpoint: GET /health

### Description
Returns the current health status of the RAG infrastructure system including connectivity to dependent services.

### Request
- **Method**: GET
- **Path**: `/health`
- **Headers**: None required
- **Parameters**: None
- **Body**: None

### Response

#### Success Response (200 OK)
```json
{
  "status": "healthy",
  "timestamp": "2025-12-13T11:30:00Z",
  "services": {
    "qdrant": true,
    "neon_db": true,
    "gemini_api": true
  },
  "version": "1.0.0"
}
```

#### Error Response (503 Service Unavailable)
```json
{
  "status": "unhealthy",
  "timestamp": "2025-12-13T11:30:00Z",
  "services": {
    "qdrant": false,
    "neon_db": true,
    "gemini_api": false
  },
  "error": "Some services are unavailable"
}
```

### Response Fields
- **status** (string, required): Overall system status ("healthy", "degraded", "unhealthy")
- **timestamp** (string, required): ISO 8601 formatted timestamp of the check
- **services** (object, required): Status of individual dependent services
  - **qdrant** (boolean): Connection status to Qdrant vector database
  - **neon_db** (boolean): Connection status to Neon PostgreSQL database
  - **gemini_api** (boolean): Connection status to Gemini API
- **version** (string, optional): API version
- **error** (string, optional): Error message if status is unhealthy

### Performance Requirements
- Response time: Must return within 1 second
- Availability: Should be available 99.9% of the time
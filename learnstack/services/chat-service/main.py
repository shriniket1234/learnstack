from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.db import engine, Base
from routes.rest import router as rest_router
from routes.websocket import websocket_endpoint

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Learnstack Chat Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include REST routes
app.include_router(rest_router, prefix="/api/v1")

# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint_handler(websocket):
    await websocket_endpoint(websocket)

@app.get("/")
def read_root():
    return {"message": "Chat Service is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
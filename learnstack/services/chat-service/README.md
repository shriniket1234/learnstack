# Learnstack Chat Service

A real-time chat API built with FastAPI, WebSockets, and MySQL.

## Setup

1. Ensure MySQL is running and create database:

   ```sql
   CREATE DATABASE learnstack_chat;
   ```

2. Create `.env` file:

   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=learnstack_chat
   ```

3. Activate virtual environment and install dependencies:

   ```bash
   source venv/bin/activate
   pip install -r requirements.txt
   ```

4. Run the service:

   ```bash
   python main.py
   ```

## API Endpoints

### REST

- `GET /api/v1/messages` - Get message history
- `POST /api/v1/messages` - Send a message

### WebSocket

- `WS /ws` - Real-time chat connection

## Example Usage

### REST POST

```json
POST /api/v1/messages
{
  "sender": "User1",
  "content": "Hello World!"
}
```

### WebSocket

Connect to `ws://localhost:8001/ws` and send JSON messages.

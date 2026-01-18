# Learnstack Todo Service

A REST API for managing todos built with Go, Gin, and PostgreSQL.

## Setup

1. Ensure PostgreSQL is running and create database:

   ```sql
   CREATE DATABASE learnstack_todo;
   ```

2. Create `.env` file:

   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_NAME=learnstack_todo
   ```

3. Run the service:
   ```bash
   go run main.go
   ```

## API Endpoints

- `GET /todos` - Get all todos
- `POST /todos` - Create a new todo
- `PUT /todos/:id` - Update a todo
- `DELETE /todos/:id` - Delete a todo

## Example Request

```json
POST /todos
{
  "text": "Learn Go",
  "completed": false
}
```

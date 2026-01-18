from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.db import get_db
from models.message import Message
from pydantic import BaseModel
from typing import List

router = APIRouter()

class MessageCreate(BaseModel):
    sender: str
    content: str

class MessageResponse(BaseModel):
    id: int
    sender: str
    content: str
    timestamp: str

@router.get("/messages", response_model=List[MessageResponse])
def get_messages(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    messages = db.query(Message).offset(skip).limit(limit).all()
    return messages

@router.post("/messages", response_model=MessageResponse)
def create_message(message: MessageCreate, db: Session = Depends(get_db)):
    db_message = Message(sender=message.sender, content=message.content)
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message
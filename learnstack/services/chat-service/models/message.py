from sqlalchemy import Column, Integer, String, DateTime
from database.db import Base
import datetime

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    sender = Column(String, index=True)
    content = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
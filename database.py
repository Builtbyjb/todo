from typing import Optional
from sqlmodel import Field, Session, SQLModel, create_engine


class Tasks(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    task: str = Field(index=True)
    is_completed: bool = Field(default=False)

# Create a db.sqlite3 file in the root directory
sqlite_url = f"sqlite:///{'db.sqlite3'}"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session

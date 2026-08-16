from typing import Generic, TypeVar, Type, Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import select
from database.bases import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType], db: Session):
        self.model = model
        self.db = db

    def get(self, id) -> Optional[ModelType]:
        return self.db.get(self.model, id)

    def get_all(self, skip: int = 0, limit: int = 100) -> List[ModelType]:
        return self.db.execute(select(self.model).offset(skip).limit(limit)).scalars().all()

    def create(self, obj_in: dict) -> ModelType:
        obj = self.model(**obj_in)
        self.db.add(obj)
        self.db.flush()
        return obj

    def update(self, db_obj: ModelType, obj_in: dict) -> ModelType:
        for field, value in obj_in.items():
            if hasattr(db_obj, field) and value is not None:
                setattr(db_obj, field, value)
        self.db.flush()
        return db_obj

    def delete(self, id) -> bool:
        obj = self.get(id)
        if obj:
            self.db.delete(obj)
            self.db.flush()
            return True
        return False

    def exists(self, **filters) -> bool:
        stmt = select(self.model).filter_by(**filters)
        return self.db.execute(stmt).first() is not None
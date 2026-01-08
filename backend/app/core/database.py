from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Create async engine for PostgreSQL
engine = create_async_engine(settings.DATABASE_URL, echo=True)

# Create async session factory
AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

# For synchronous operations (if needed)
def init_db():
    import asyncio
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker as sync_sessionmaker
    
    # Use synchronous engine for table creation
    sync_url = settings.DATABASE_URL.replace('+asyncpg', '')
    sync_engine = create_engine(sync_url)
    Base.metadata.create_all(bind=sync_engine)
    sync_engine.dispose()

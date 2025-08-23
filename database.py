from sqlalchemy import create_engine
from sqlalchemy.engine import URL

url = URL.create(
    drivername="postgresql",
    username="postgres",
    host="localhost",
    database="postgres",
    password='example'
)

engine = create_engine(url)

connection = engine.connect()
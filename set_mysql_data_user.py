import sqlalchemy as sa
import json

engine = sa.create_engine('mysql+pymysql://root:haoyuliao@localhost/web_tdtw')
# engine = sa.create_engine('mysql+pymysql://root:haoyuliao@localhost/trial')

with engine.connect() as connection:
    execute = connection.execute

    metasrcdata = sa.MetaData()
    user = sa.Table('user', metasrcdata,
        # sa.String(length=255)
        sa.Column('id', sa.Integer, primary_key=True, autoincrement=True),
        sa.Column('name', sa.String(length=32), nullable=False),
        sa.Column('email', sa.String(length=256), nullable=False),
        sa.Column('password', sa.String(length=32), nullable=False),
    )
    metasrcdata.create_all(engine)
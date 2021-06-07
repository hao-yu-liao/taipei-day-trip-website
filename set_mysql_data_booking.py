import sqlalchemy as sa
import json

engine = sa.create_engine('mysql+pymysql://root:haoyuliao@localhost/web_tdtw')

with engine.connect() as connection:
    execute = connection.execute

    currentMetaData = sa.MetaData(engine)
    print(currentMetaData.tables)
    tb_user = sa.Table('user', currentMetaData)
    for i in tb_user:
        print(i)
    tb_attractions = sa.Table('attractions', currentMetaData)

    virtualMetaData = sa.MetaData()
    tb_booking = sa.Table('booking', virtualMetaData,
        sa.Column('id', sa.Integer, primary_key=True, autoincrement=True),
        sa.Column('date', sa.Date, nullable=False),
        sa.Column('time', sa.String(length=32), nullable=False),
        sa.Column('price', sa.Integer, nullable=False),
        sa.Column('userId', sa.Integer, sa.ForeignKey('tb_user.id'), nullable=False),
        sa.Column('attractionId', sa.Integer, sa.ForeignKey('tb_attractions.id'), nullable=False),
    )
    virtualMetaData.create_all(engine)
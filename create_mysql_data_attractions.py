import sqlalchemy as sa
import json

engine = sa.create_engine('mysql+pymysql://root:haoyuliao@localhost/web_tdtw')
# engine = sa.create_engine('mysql+pymysql://root:haoyuliao@localhost/trial')

with engine.connect() as connection:
    execute = connection.execute

    metasrcdata = sa.MetaData()
    attractions = sa.Table('attractions', metasrcdata,
        # sqlalchemy中，設置為primary_key者，預設autoincrement=True
        sa.Column('id', sa.Integer, primary_key=True, autoincrement=False),
        sa.Column('name', sa.Text, nullable=False),
        sa.Column('category', sa.Text, nullable=False),
        sa.Column('description', sa.Text, nullable=False),
        sa.Column('address', sa.Text, nullable=False),
        sa.Column('transport', sa.Text),
        sa.Column('mrt', sa.Text), # 有item的mrt是空值，RR：((j8wqrFBc7))
        sa.Column('latitude', sa.Float, nullable=False),
        sa.Column('longitude', sa.Float, nullable=False),
        sa.Column('images', sa.Text, nullable=False)
    )
    metasrcdata.create_all(engine)
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
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('category', sa.String(length=255), nullable=False),
        sa.Column('description', sa.String(length=4095), nullable=False),
        sa.Column('address', sa.String(length=255), nullable=False),
        sa.Column('transport', sa.String(length=4095)),
        sa.Column('mrt', sa.String(length=255)), # 有item的mrt是空值，RR：((j8wqrFBc7))
        sa.Column('latitude', sa.Float, nullable=False),
        sa.Column('longitude', sa.Float, nullable=False),
        sa.Column('images', sa.String(length=4095), nullable=False)
    )
    metasrcdata.create_all(engine)

    t_insertTbAtrs = sa.text('insert into attractions(id, name, category, description, address, transport, mrt, latitude, longitude, images) VALUES(:id, :name, :category, :description, :address, :transport, :mrt, :latitude, :longitude, :images)')


    with open('data/taipei-attractions.json', mode='r') as file:
        srcdatas = json.load(file)['result']['results']

        for srcdata in srcdatas:
            data = {}
            data['id'] = srcdata['_id']
            data['name'] = srcdata['stitle']
            data['category'] = srcdata['CAT2']
            data['description'] = srcdata['xbody']
            data['address'] = srcdata['address']
            data['transport'] = srcdata['info']
            data['mrt'] = srcdata['MRT']
            data['latitude'] = srcdata['latitude']
            data['longitude'] = srcdata['longitude']
            data['images'] = srcdata['file']

            execute(t_insertTbAtrs, data)
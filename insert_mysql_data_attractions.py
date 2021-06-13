import sqlalchemy as sa
import json

engine = sa.create_engine('mysql+pymysql://root:haoyuliao@localhost/web_tdtw')
# engine = sa.create_engine('mysql+pymysql://root:haoyuliao@localhost/trial')

with engine.connect() as connection:
    execute = connection.execute

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
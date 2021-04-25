import os, re, json

from flask import *
from sqlalchemy import create_engine, text


app=Flask(__name__)
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True

engine = create_engine('mysql+pymysql://root:haoyuliao@localhost/web_tdtw')
connection = engine.connect()
execute = connection.execute

t_api_attrs_keyword = text(
    "select * from attractions like '%':keyword'%' limit :idStart, 12"
)
t_api_attrs_noKeyword = text(
    'select * from attractions limit :idStart, 12'
)
t_api_attr_id = text(
    'select * from attractions where id = :id'
)

# Function Library
def cleanseImagesData(originStr):
	originStr = originStr.replace("\\", ",")
	originStr = originStr.replace("http", ",http")
	originStr = originStr.replace(",http", "http", 1)
	listStr = originStr.split(",")
	
	for str in listStr:
		if not (re.match(r".*jpg", str, flags=re.IGNORECASE)):
			if not (re.match(r".*png", str, flags=re.IGNORECASE)):
				# print('delete: ', str)
				listStr.remove(str)

	# print('listStr: ', listStr)
	return listStr

# Pages
@app.route("/")
def index():
	return render_template("index.html")
@app.route("/attraction/<id>")
def attraction(id):
	return render_template("attraction.html")
@app.route("/booking")
def booking():
	return render_template("booking.html")
@app.route("/thankyou")
def thankyou():
	return render_template("thankyou.html")

@app.route("/api/attractions", methods=["GET"])
def api_attractions():
	# try:
		page = int(request.args.get('page'))
		keyword = request.args.get('keyword')
		print(page)
		print(keyword)

		if page >= 0:
			idStart = (page * 12 ) + 1
			dataReturn = {
				'nextPage': page + 1,
				'data': []
			}
			# print('dataReturn: ', dataReturn)

			def fetchSrcdatas():
				if bool(keyword):
					# 如果有keyword
					srcdatas = execute(t_api_attrs_keyword, keyword=keyword, idStart=idStart)
					# srcdatas = where(attractions.c.name.like(’梅%’))

				else:
					# 如果沒有keyword
					srcdatas = execute(t_api_attrs_noKeyword, idStart=idStart)
					
				return srcdatas

			srcdatas = fetchSrcdatas()
			# print('srcdatas: ', srcdatas)

			id = idStart - 1
			# print('id: ', id)
			
			for srcdata in srcdatas:

				srcdata = dict(srcdata)
				# print('srcdata: ', srcdata)
				dataToAppend = {}

				for key in srcdata:
					if key != 'images':
						dataToAppend[key] = srcdata[key]
					else:
						dataToAppend[key] = cleanseImagesData(srcdata[key])

				else:
					dataReturn['data'].append(dataToAppend)
					id += 1

			# print('dataReturn: ', dataReturn)

		
		return json.dumps(dataReturn, ensure_ascii=False), 200

'''	
except:
	errorReturn = {
		"error": True,
		"message": "自訂的錯誤訊息"
	}

	return json.dumps(errorReturn, ensure_ascii=False), 500
'''

@app.route("/api/attraction/<attractionId>", methods=["GET"])
def api_attraction(attractionId):
	try:
		srcdata = execute(t_api_attr_id, id = attractionId).first()
		
		if srcdata == None:
			errorReturn = {
				"error": True,
				"message": "自訂的錯誤訊息"
			}

			return json.dumps(errorReturn, ensure_ascii=False), 400
		
		else:
			srcdata = dict(srcdata)
			print('srcdata: ', srcdata)
			dataToAppend = {}

			for key in srcdata:
				if key != 'images':
					dataToAppend[key] = srcdata[key]
				else:
					dataToAppend[key] = cleanseImagesData(srcdata[key])

			dataReturn = {
				'data': dataToAppend
			}

			print('dataReturn: ', dataReturn)

			return json.dumps(dataReturn, ensure_ascii=False), 200
	
	except:
		errorReturn = {
			"error": True,
			"message": "自訂的錯誤訊息"
		}

		return json.dumps(errorReturn, ensure_ascii=False), 500

app.run(host="0.0.0.0", port=3000)
import os, re, json

from flask import *
from sqlalchemy import create_engine, text


app=Flask(__name__)
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True

engine = create_engine('mysql+pymysql://root:haoyuliao@localhost/web_tdtw')
connection = engine.connect()
execute = connection.execute
t_trial = text(
    'select * from attractions limit 5'
)
t_api_attrs_keyword = text(
    "select * from attractions like '%':keyword'%' limit :idStart, 12"
)
t_api_attrs_noKeyword = text(
    'select * from attractions limit :idStart, 12'
)
t_api_attr_id = text(
    'select * from attractions where id = :id'
)

'''
# 如果有keyword
					srcdatas = select * from attractions where name like %keyword% limit idStart, 12
				else:
					# 如果沒有keyword
					srcdatas = select * from attractions limit idStart, 12
'''

# delete: originData = execute(t_trial).first()

# delete: print('trial: ', execute(t_trial).first())
# app.secret_key的目的為何？

'''
# Roam Research：((gMX8Qu-bZ))

print("os.environ.get('HOME'): ", os.environ.get('HOME'))
# print("os.environ['MYSQL_PASSWORD']: ")
# print(os.environ['MYSQL_PASSWORD'])
MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD')
print("os.environ.get('MYSQL_PASSWORD'): ")
print(MYSQL_PASSWORD)

ENGINE_URL = 'mysql+pymysql://root:' + MYSQL_PASSWORD + '@localhost/website'
print(ENGINE_URL)
engine = create_engine(ENGINE_URL)
'''

# Function Library
def cleanseImagesData(originStr):
	originStr = originStr.replace("\\", ",")
	originStr = originStr.replace("http", ",http")
	originStr = originStr.replace(",http", "http", 1)
	listStr = originStr.split(",")
	
	for str in listStr:
		if not (re.fullmatch(r".*jpg", str, flags=re.IGNORECASE)):
			if not (re.fullmatch(r".*png", str, flags=re.IGNORECASE)):
				print('delete: ', str)
				listStr.remove(str)

	# print('listStr: ', listStr)
	return listStr

# Pages
@app.route("/")
def index():
	# 測試
	print(execute(t_trial).first())
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

'''
@app.route("/api/attractions", methods=["GET"])
def api_attractions():
	cleanseImagesData(originData['images'])

	return render_template("index.html") 
'''

'''
@app.route("/api/attractions", methods=["GET"])
def api_attractions():
	try:
		page = request.args.get('page')
		keyword = request.args.get('keyword')


		if (bool(page) & (page >= 0)):
			idStart = (page * 12 ) + 1
			dataReturn = {}
			dataReturn['nextPage'] = page + 1

			# images要再處理過，可以寫成一個函式來重複使用

			def fetchSrcdatas():
				if bool(keyword):
					# 如果有keyword
					srcdatas = execute(t_api_attrs_keyword, keyword=keyword, idStart=idStart)
				else:
					# 如果沒有keyword
					srcdatas = execute(t_api_attrs_noKeyword, idStart=idStart)
					
				return srcdatas
			
			srcdatas = fetchSrcdatas()

			id = idStart
			for srcdata in srcdatas:
				for key in srcdata:
					dataReturn['data'][id][key] = srcdata[key]
				else:
					id += 1

		response = make_response(json.dumps(dataReturn, ensure_ascii=False), 200)

		return response

	except:

		errorReturn = {}
		errorReturn['error'] = True
		errorReturn['message'] = "自訂的錯誤訊息"
		response.body = json.dump(errorReturn)
		response.statuscode = 500

		return response
'''


@app.route("/api/attraction/<attractionId>", methods=["GET"])
def api_attraction(attractionId):
	# try:
		srcdata = execute(t_api_attr_id, id = attractionId).first()
		
		if srcdata == None:
			errorReturn = {
				"error": true,
				"message": "自訂的錯誤訊息"
			}

			return json.dumps(errorReturn), 400
		
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

			return json.dumps(dataReturn), 200
	
'''
catch:
	errorReturn = {}
	errorReturn['error'] = True
	errorReturn['message'] = "自訂的錯誤訊息"
	response.body = json.dump(errorReturn)
	response.statuscode = 500

	return response
'''

app.run(host="0.0.0.0", port=3000)
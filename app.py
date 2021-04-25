import os

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

print('trial: ', execute(t_trial).first())

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

'''
# Function Library
def cleanseImagesData(originStr, ):
	originStr.replace("\\", "")
	originStr.replace("http", " http")
	originStr.replace(" http", "http", 1)
	listStr = originStr.split()
	for str in listStr:
		if (str.endswith("jpg")) | (str.endswith("png")): # 用萬用字元來寫，大小寫皆可



	# 以http來分割，把str變成List
	# 若不是jpg, png，就不予加入
'''

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
					srcdatas = select * from attractions where name like %keyword% limit idStart, 12
				else:
					# 如果沒有keyword
					srcdatas = select * from attractions limit idStart, 12
					
				return srcdatas
			
			srcdatas = fetchSrcdatas()

			id = idStart
			for srcdata in srcdatas:
				for key in srcdata:
					dataReturn['data'][id][key] = srcdata[key]
				else:
					id += 1
		response.body = json.dump(dataReturn)
		response.statuscode = 200

		return response

	catch:
		errorReturn = {}
		errorReturn['error'] = True
		errorReturn['message'] = "自訂的錯誤訊息"
		response.body = json.dump(errorReturn)
		response.statuscode = 500

		return response

@app.route("/api/attraction/<attractionId>", methods=["GET"])
def api_attraction(attractionId):
	try:
		srcdata = select * from attractions where id = attractionId # 要用.first
		if (srcdata = None):
			errorReturn = {}
			errorReturn['error'] = True
			errorReturn['message'] = "自訂的錯誤訊息"
			response.body = json.dump(errorReturn)
			response.statuscode = 400
		
		else:
			dataReturn = {}
			for key in srcdata:
				dataReturn['data'][key] = srcdata[key]

			response.body = json.dump(dataReturn)
			response.statuscode = 200

		return response
	
	catch:
		errorReturn = {}
		errorReturn['error'] = True
		errorReturn['message'] = "自訂的錯誤訊息"
		response.body = json.dump(errorReturn)
		response.statuscode = 500

		return response
'''

app.run(host="0.0.0.0", port=3000)
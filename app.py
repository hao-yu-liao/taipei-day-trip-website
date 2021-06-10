import os, re, json

from flask import *
from sqlalchemy import create_engine, text


# for print error; ref: https://dotblogs.com.tw/caubekimo/2018/09/17/145733
import sys
import traceback


app=Flask(
	__name__,
	static_folder="static",
    static_url_path="/static"
)
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True
app.config["SECRET_KEY"] = os.urandom(24)

# Model

engine = create_engine('mysql+pymysql://root:haoyuliao@localhost/web_tdtw')
connection = engine.connect()
execute = connection.execute

# text()

t_api_attrs_keyword = text(
    "select * from attractions where name like :keyword limit :id, 12"
)
t_api_attrs_noKeyword = text(
    'select * from attractions limit :id, 12'
)
t_api_attr_id = text(
    'select * from attractions where id = :id'
)
t_count_api_attrs_keyword = text(
    "select count(id) from attractions where name like :keyword"
)
t_count_api_attrs_noKeyword = text(
    'select count(id) from attractions'
)

# Function Library
def cleanseImagesData(originStr):
    originStr = originStr.replace("\\", "")
    # print('\noriginStr: ', originStr)

    originStr = originStr.replace("http", ",http")
    originStr = originStr.replace(",http", "http", 1)
    listStr = originStr.split(",")
    listStrReturn = []

    # print('\nlistStr: ', listStr)

    for str in listStr:
        # print("\nstr: ", str)
        if bool((re.match(r"http.*jpg", str, flags=re.IGNORECASE))) | bool((re.match(r"http.*png", str, flags=re.IGNORECASE))):
            listStrReturn.append(str)

    return listStrReturn

def getErrorReponse(errorMessage, errorStatusCode):
	responseBody = {
		"error": True,
		"message": errorMessage		
	}	
	response = make_response(
		json.dumps(responseBody, ensure_ascii=False),
		errorStatusCode
	)
	return response

def getOkReponse():
	responseBody = {
		"ok": True	
	}	
	response = make_response(
		json.dumps(responseBody, ensure_ascii=False),
		200
	)
	return response

def checkBookingById(id):
	t_checkBookingById = text('select attractions.id, attractions.name, attractions.address, attractions.images, booking.date, booking.time, booking.price from booking inner join attractions on booking.attractionId = attractions.id where booking.id = :id')
	result = execute(
		t_checkBookingById,
		id = id
	).first()
	
	if result != None:
		return dict(result)
	else:
		return None

def printError(e):
	error_class = e.__class__.__name__ #取得錯誤類型
	detail = e.args[0] #取得詳細內容
	cl, exc, tb = sys.exc_info() #取得Call Stack
	lastCallStack = traceback.extract_tb(tb)[-1] #取得Call Stack的最後一筆資料
	fileName = lastCallStack[0] #取得發生的檔案名稱
	lineNum = lastCallStack[1] #取得發生的行號
	funcName = lastCallStack[2] #取得發生的函數名稱
	errMsg = "File \"{}\", line {}, in {}: [{}] {}".format(fileName, lineNum, funcName, error_class, detail)
	print(errMsg)

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
def handleApiAttractions():
	try:
		page = int(request.args.get('page'))
		srckeyword = request.args.get('keyword')
		# print(page, type(page))
		# print(srckeyword, type(srckeyword))

		if page >= 0:
			id = page * 12
			# print(id, type(id))

			dataReturn = {
				'nextPage': page + 1,
				'data': []
			}
			# print('dataReturn: ', dataReturn)

			def fetchSrcdatas():
				if bool(srckeyword):
					keyword = "%" + srckeyword + "%"
					# print(keyword, type(keyword))
					# 如果有keyword
					srcdatas = execute(t_api_attrs_keyword, keyword=keyword, id=id)
					# print(bool(srcdatas))
					# srcdatas = where(attractions.c.name.like(’梅%’))

				else:
					# 如果沒有keyword
					srcdatas = execute(t_api_attrs_noKeyword, id=id)
					
				return srcdatas
		
		
			def getDataNum():
				if bool(srckeyword):
					keyword = "%" + srckeyword + "%"
					dataNum = list(execute(t_count_api_attrs_keyword, keyword=keyword).first())[0]
					print('dataNum: ', dataNum)

					return dataNum
				
				else:
					return list(execute(t_count_api_attrs_noKeyword).first())[0]

			dataNum = getDataNum()

			if (dataNum == 0):
				dataReturn['nextPage'] = None
				
			else:
				srcdatas = fetchSrcdatas()
				# print('type(srcdatas): ', type(srcdatas))

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

				if (dataNum <= 12):
					dataReturn['nextPage'] = None

				# print('dataReturn: ', dataReturn)
		
		return json.dumps(dataReturn, ensure_ascii=False), 200


	except Exception as e:
		# print(e)
		errorReturn = {
			"error": True,
			"message": "自訂的錯誤訊息"
		}

		return json.dumps(errorReturn, ensure_ascii=False), 500

@app.route("/api/attraction/<attractionId>", methods=["GET"])
def handleApiAttraction(attractionId):
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
			# print('srcdata: ', srcdata)
			dataToAppend = {}

			for key in srcdata:
				if key != 'images':
					dataToAppend[key] = srcdata[key]
				else:
					dataToAppend[key] = cleanseImagesData(srcdata[key])

			dataReturn = {
				'data': dataToAppend
			}

			# print('dataReturn: ', dataReturn)

			return json.dumps(dataReturn, ensure_ascii=False), 200
	
	except Exception as e:
		# print(e)
		errorReturn = {
			"error": True,
			"message": "自訂的錯誤訊息"
		}

		return json.dumps(errorReturn, ensure_ascii=False), 500

@app.route("/api/user", methods=["OPTION"])
def handleApiUserPreflight():
	responseBody = {}
	responseHeaders = {
		'Access-Control-Request-Headers': 'content-type',
		'Access-Control-Request-Methods': ["GET", "POST", "PATCH", "DELETE"],
	}



	response = make_response(responseBody, responseHeaders)
	'''
	response['Access-Control-Request-Headers'] = ['content-type']
	response['Access-Control-Request-Methods'] = ["GET", "POST", "PATCH", "DELETE"]
	'''

	return response

@app.route("/api/user", methods=["GET", "POST", "PATCH", "DELETE"])
def handleApiUser():
	# Model
	def checkAccount(email, password):
		t_checkAccount = text(
			'select id, name, email from user where email = :email and password = :password'
		)
		# select id, name, email from user where email = 'emailTrial' and password = 'passwordTrial';
		# select id, name, email from user where email = 'ply@ply.com' and password = '12345678';

		response = execute(
			t_checkAccount,
			email = email,
			password = password
		).first()

		if (response != None):
			return dict(response)
		else:
			return None

		'''
		# 假資料，先測試前端串接
		if (True):
			dataFetched = {
				'data': {
					'id': 1,
					'name': '彭彭彭',
					'email': 'ply@ply.com'
				}
			}

			return dataFetched
		'''
	
	def createAccount(name, email, password):
		t_createAccount = text(
			'insert into user(name, email, password) values(:name, :email, :password)'
		)

		# insert into user(name, email, password) values('nameTrial', 'emailTrial', 'passwordTrial')

		accountData = checkAccount(email, password)
		if (accountData == None):
			execute(
				t_createAccount,
				name = name,
				email = email,
				password = password
			)
			newAccountData = checkAccount(email, password)
			return dict(newAccountData)
		else:
			return None

	# Controller
	if request.method == "GET":
		print('session: ', session)
		#  if ((session['id'] != False) & (session['name'] != False) & (session['email'] != False)):

		if (bool(session)):
			responseBody = {
				"data": {
					"id": session['id'],
					"name": session['name'],
					"email": session['email']
				}				
			}
			response = make_response(
				json.dumps(responseBody, ensure_ascii= False), 
				200
			)
			return response

		else:
			responseBody = {
				"data": None				
			}
			response = make_response(
				json.dumps(responseBody, ensure_ascii= False), 
				200
			)
			return response

	if request.method == "PATCH":
		try:
			data = request.json
			print(data)

			accountData = checkAccount(data['email'], data['password'])

			# view
			if (accountData != None): # 之後串接資料庫，應改成 model.checkData
				session['id'] = accountData['id']
				session['name'] = accountData['name']
				session['email'] = accountData['email']

				# 建立 session['sessionID']
				responseBody = {
					"ok": True
				}
				print('successfully access PATCH API')
				response = make_response(
					json.dumps(responseBody, ensure_ascii= False), 
					200
				)
				print(response)
				return response

			else:
				responseBody = {
					"error": True,
					"message": "登入失敗，帳號或密碼錯誤或其他原因"
				}
				response = make_response(
					json.dumps(responseBody, ensure_ascii= False), 
					400
				)
				print(response)

				return response

		except Exception as e:
			print(e)
			responseBody = {
				"error": True,
				"message": "伺服器內部錯誤"
			}
			response = make_response(
				json.dumps(responseBody, ensure_ascii= False), 
				500
			)

			return response

	if request.method == "POST":
		try:			
			# 註冊一個新的使用者
		
			# execute()
			# t_insertTbAtrs = sa.text('insert into attractions(id, name, category, description, address, transport, mrt, latitude, longitude, images) VALUES(:id, :name, :category, :description, :address, :transport, :mrt, :latitude, :longitude, :images)')
			#
			data = request.json
			# print(data)

			accountData = createAccount(data['name'], data['email'], data['password'])
			print('accountData: ', accountData)

			# view
			if (accountData != None):
				session['id'] = accountData['id']
				session['name'] = accountData['name']
				session['email'] = accountData['email']

				responseBody = {
					"ok": True
				}
				response = make_response(
					json.dumps(responseBody, ensure_ascii= False), 
					200
				)
				# print(response)
				return response

			else:
				responseBody = {
					"error": True,
					"message": "註冊失敗，重複的 Email 或其他原因"
				}
				response = make_response(
					json.dumps(responseBody, ensure_ascii= False), 
					400
				)
				# print(response)
				return response

		except Exception as e:
			print(e)
			responseBody = {
				"error": True,
				"message": "伺服器內部錯誤"
			}
			response = make_response(
				json.dumps(responseBody, ensure_ascii= False), 
				500
			)
			# print(responseBody)
			return response

	if request.method == "DELETE":
		
		session.pop('id', None)
		session.pop('name', None)
		session.pop('email', None)
		
		responseBody = {
			"ok": True
		}
		response = make_response(
			json.dumps(responseBody, ensure_ascii= False), 
			200
		)
		return response

@app.route("/api/booking", methods=["OPTION"])
def handleApiBookingPreflight():
	responseBody = {}
	responseHeaders = {
		"Access-Control-Request-Headers": "content-type",
		"Access-Control-Request-Methods": "['GET', 'POST', 'DELETE']"
	}

	response = make_response(responseBody, responseHeaders)
	return response

@app.route("/api/booking", methods=["GET", "POST"])
def handleApiBooking():
	def checkIsBookingCreated():
		t_checkBookingCreated = ("select * from booking where (createTime > subtime(current_timestamp(), '0:5:0')) and (userId = ':userId')")
		result = execute(
			t_checkBookingCreated,
			userId = session['id']
		).first()

		if result != None:
			return True
		else:
			return False

	def checkBookingByUserId(userId):
		t_checkBookingByUserId = text('select booking.id, booking.attractionId, attractions.name, attractions.address, attractions.images, booking.date, booking.time, booking.price from booking inner join attractions on booking.attractionId = attractions.id where booking.userId = :userId')
		results = execute(
			t_checkBookingByUserId,
			userId = userId
		)
		bookingData = []

		if results != None:
			for result in results:
				bookingData.append(dict(result))
			return bookingData
		else:
			return None

	def createBooking(bookingData):
		t_createBooking = text('insert into booking (date, time, price, userId, attractionId) values (:date, :time, :price, :userId, :attractionId)')
		execute(
			t_createBooking,
			date = bookingData['date'],
			time = bookingData['time'],
			price = bookingData['price'],
			userId = bookingData['userId'],
			attractionId = bookingData['attractionId']
		)
		# result = checkBookingById()
		result = {}
		return result

	if request.method == "GET":
		print('session: ', session)
		if bool(session):
			
			bookingDataList = checkBookingByUserId(session['id'])
			responseBody = {
				'data': None
			}

			if bookingDataList != None:
				responseBody['data'] = []
				for bookingData in bookingDataList:
					imageList = cleanseImagesData(bookingData['images'])

					responseData = {
						'id': bookingData['id'],
						'attraction': {
							'id': bookingData['attractionId'],
							'name': bookingData['name'],
							'address': bookingData['address'],
							'image': imageList[0]
						},
						'date': bookingData['date'],
						'time': bookingData['time'],
						'price': bookingData['price']
					}
					responseBody['data'].append(responseData)

				return make_response(json.dumps(responseBody, ensure_ascii=False), 200)

			else:
				return make_response(json.dumps(responseBody, ensure_ascii=False), 200)
		else:
			return getErrorReponse('未登入系統，拒絕存取', 403)
	if request.method == "POST":
		try:
			if bool(session):
				print('access POST with session')
				data = request.json

				# bookingData
				bookingData = {}
				for key in data:
					bookingData[key] = data[key]
					bookingData['userId'] = session['id']

				# fetch database
				createBooking(bookingData)
				checkResult = checkIsBookingCreated()

				if checkResult != None:
					return getOkReponse()
				else:
					return getErrorReponse('建立失敗，輸入不正確或其他原因', 400)
			else:
				return getErrorReponse('未登入系統，拒絕存取', 403)
		except Exception as error:
			printError(error)
			return getErrorReponse('伺服器內部錯誤', 500)

@app.route("/api/booking/<bookingId>", methods=['OPTION'])
def handleApiBookingDeletePreflight(bookingId):
	responseBody = {}
	responseHeaders = {
		"Access-Control-Request-Headers": "content-type",
		"Access-Control-Request-Methods": "['GET', 'POST', 'DELETE']"
	}

	response = make_response(responseBody, responseHeaders)
	return response

@app.route("/api/booking/<bookingId>", methods=['DELETE'])
def handleApiBookingDelete(bookingId):
	def deleteBooking(bookingId):
		t_deleteBooking = text('delete from booking where id = :bookingId')
		execute(
			t_deleteBooking,
			bookingId = bookingId
		)

		result = checkBookingById(bookingId)
		if result == None:
			return True
		else:
			return False

	if request.method == "DELETE":
		if bool(session):
			result = deleteBooking(bookingId)
			if result:
				return getOkReponse()
			else:
				return getErrorReponse('刪除失敗，輸入不正確或其他原因', 400)
		else:
			return getErrorReponse('未登入系統，拒絕存取', 403)

app.run(host="0.0.0.0", port=3000)

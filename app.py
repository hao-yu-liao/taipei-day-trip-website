import os, re, json

from flask import *
from sqlalchemy import create_engine, text
import requests as req
from datetime import datetime

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

def checkOrderById(orderId):
	t_checkOrder = text('select orders.number, orders.phone, orders.status, booking.price, booking.date, booking.time, attractions.id, attractions.name, attractions.address, attractions.images from ((orders inner join booking on orders.bookingId = booking.id) inner join attractions on orders.attractionId = attractions.id) where orders.id = :id')
	result = execute(
		t_checkOrder,
		id = orderId
	).first()

	return dict(result)

def checkOrderByUserId():
	t_checkOrderByUserId = text('select orders.number, orders.phone, booking.price, booking.date, booking.time, attractions.id, attractions.name, attractions.address, attractions.images from ((orders inner join booking on orders.bookingId = booking.id) inner join attractions on orders.attractionId = attractions.id) where orders.userId = :userId')
	result = execute(
		t_checkOrderByUserId,
		userId = session['id']
	).first()

	return dict(result)
	
def checkIsOrderCreated():
	# print('userId: ', session['id'])
	t_checkIsOrderCreated = text("select *  from orders where id = (select max(id) from orders where userId = ':userId')")
	result = execute(
		t_checkIsOrderCreated,
		userId = session['id']
	).first()
	# print('result: ', result)
	# result = dict(result)

	return dict(result)
	
	'''
	t_checkIsOrderCreated = text("select * from orders where userId = ' :userId ')")
	results = execute(
		t_checkIsOrderCreated,
		userId = f"{session['id']}"
	).first()
	print('results: ', results)		
	resultList = []
	finalResult = None

	# userId = session['id']

	if results != None:
		for result in results:
			resultList.append(result)
		else:
			finalResult = resultList[(len(resultList) - 1)]

		return finalResult
	else:
		return None
	'''

def createOrder(orderStatus, orderInfoDict):
	if orderStatus == 1:
		orderInfoDict['bank_transaction_id'] = ""

	t_createOrder = text('insert into orders (number, status, rec_trade_id, bank_transaction_id, phone, userId, attractionId, bookingId) values(:number, :status, :rec_trade_id, :bank_transaction_id, :phone, :userId, :attractionId, :bookingId)')
	execute(
		t_createOrder,
		number = orderInfoDict['order_number'],
		status = orderStatus,
		rec_trade_id = orderInfoDict['rec_trade_id'],
		bank_transaction_id = orderInfoDict['bank_transaction_id'],
		phone = orderInfoDict['booking']['contact']['phone'],
		userId = session['id'],
		attractionId = orderInfoDict['booking']['trip']['attractionId'],
		bookingId = orderInfoDict['booking']['bookingId']
	)

	'''
	execute(
		t_createOrder,
		number = 20210611121500,
		status = 0,
		rec_trade_id = "",
		bank_transaction_id = "",
		phone = '0912345678',
		userId = 9,
		attractionId = 5,
		bookingId = 15
	)
	'''

	result = checkIsOrderCreated()

	return result

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
			# printError(error)
			print(error.args)

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

@app.route("/api/orders", methods=['OPTION'])
def handleApiOrdersPreflight():
	responseBody = {}
	responseHeaders = {
		"Access-Control-Request-Headers": "content-type",
		"Access-Control-Request-Methods": "['GET', 'POST']"
	}

	response = make_response(responseBody, responseHeaders)
	return response

@app.route("/api/orders", methods=['GET', 'POST'])
def handleApiOrders():
	if request.method == "POST":
		try:
			if bool(session):
				# print('access POST /api/orders with session')
				clientData = request.json
				# print('requestBody: ', clientData)

				# request tappay api
				_timestamp_ = datetime.now()
				tappayInfo = {
					'_timestampString_': str("{:0>4d}".format(_timestamp_.year)) + str("{:0>2d}".format(_timestamp_.month)) + str("{:0>2d}".format(_timestamp_.day)) + str("{:0>2d}".format(_timestamp_.hour)) + str("{:0>2d}".format(_timestamp_.minute)) + str("{:0>2d}".format(_timestamp_.second)),
					'partner_key': 'partner_c4LGHUS1P9TeTSm53cblCCjVws22XInlCuCNR5AomcwM0N1AKqUnBMeP',
					'merchant_id': 'haoyuliaocurb_CTBC',
				}
				
				orderInfo = {
					'booking': {
						'bookingId': clientData['order']['id'],
						'price': clientData['order']['price'],
						'trip': {
							'attractionId': clientData['order']['trip']['attraction']['id'],
							'date': clientData['order']['trip']['date'],
							'time': clientData['order']['trip']['time'],
						},
						'contact': {
							"name": clientData['order']['contact']['name'],
							"email": clientData['order']['contact']['email'],
							"phone": clientData['order']['contact']['phone'],						
						}
					},
					'details': 'half-day tour',
					'rec_trade_id': "",
					'order_number': tappayInfo['_timestampString_'] + 'aaa',
					'bank_transaction_id': tappayInfo['_timestampString_'] + 'AAA',
				}

				#  + str(os.urandom(16))
				# print('orderInfo: ', orderInfo)

				requestTappayMaterial = {
					'URL': 'https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime',
					'headers': {
						'Content-Type': 'application/json',
						'x-api-key': tappayInfo['partner_key']					
					},
					'body': {
						"prime": 'test_3a2fb2b7e892b914a03c95dd4dd5dc7970c908df67a49527c0a648b2bc9',
						"partner_key": tappayInfo['partner_key'],
						"merchant_id": tappayInfo['merchant_id'],
						"amount": str(orderInfo['booking']['price']),
						"details": orderInfo['details'],
						"order_number": orderInfo['order_number'],
						"bank_transaction_id": orderInfo['bank_transaction_id'],
						"cardholder": {
							"phone_number": orderInfo['booking']['contact']['phone'],
							"name": orderInfo['booking']['contact']['name'].encode("utf-8").decode("latin1"),
							"email": orderInfo['booking']['contact']['email'],
							"zip_code": "",
							"address": "",
							"national_id": ""
						},
						"remember": True
					},
				}

				# print("requestTappayMaterial['body']: ", requestTappayMaterial['body'])

				requestTappay = req.post(
					requestTappayMaterial['URL'],
					headers = requestTappayMaterial['headers'],
					data = json.dumps(requestTappayMaterial['body'], ensure_ascii=False)
				)

				if requestTappay.status_code != 200:
					print('requestTappay.status_code: ', requestTappay.status_code)
					createOrderResult = createOrder(1, orderInfo)
					if bool(createOrderResult):
						return getErrorReponse('付款失敗，訂單狀態為未付款', 400)
					else:
						return getErrorReponse('訂單建立失敗，輸入不正確或其他原因', 400)

				responseTappay = requestTappay.json()
				if responseTappay['status'] != 0:
					print("responseTappay['status']: ", responseTappay['status'])
					createOrderResult = createOrder(1, orderInfo)
					if bool(createOrderResult):
						return getErrorReponse('付款失敗，訂單狀態為未付款', 400)
					else:
						return getErrorReponse('訂單建立失敗，輸入不正確或其他原因', 400)
					# print('request tappay api error message: ', responseTappay['msg'])

				# 建立付款狀態成功的訂單
				orderInfo['rec_trade_id'] = responseTappay['rec_trade_id']
				# orderInfo['bank_transaction_time'] = responseTappay['bank_transaction_time']

				print(orderInfo['rec_trade_id'])

				createOrderResult = createOrder(0, orderInfo)

				if bool(createOrderResult):
					responseBody = {
						"data": {
							"number": createOrderResult['number'],
							"payment": {
								"status": createOrderResult['status'],
								"message": "付款成功"
							}
						}						
					}
					print('responseBody of DB: ', responseBody)

					response = make_response(
						json.dumps(responseBody, ensure_ascii=False),
						200
					)
					return response					
					
				else:
					# 需連線 tappay 取消付款
					return getErrorReponse('訂單建立失敗，輸入不正確或其他原因', 400)
			else:
				return getErrorReponse('未登入系統，拒絕存取', 403)
		except ZeroDivisionError as error:
			printError(error)
			# print(error.args)
			return getErrorReponse('伺服器內部錯誤', 500)	

@app.route("/api/order/<orderNumber>", methods=['GET'])
def handleApiOrder(orderNumber):
	if request.method == "GET":
		print('session: ', session)
		if bool(session):
			orderData = checkOrderById(orderNumber)
			# print('orderData: ', orderData)

			if orderData != None:
				imageList = cleanseImagesData(orderData['images'])
				
				responseBody = {
					"data": {
						"number": orderData['number'],
						"price": orderData['price'],
						"trip": {
						"attraction": {
							"id": orderData['id'],
							"name": orderData['name'],
							"address": orderData['address'],
							"image": imageList[0]
						},
						"date": orderData['date'],
						"time": orderData['time']
						},
						"contact": {
						"name": session['name'],
						"email": session['email'],
						"phone": orderData['phone']
						},
						"status": orderData['status']
					}
				}
				print('responseBody: ', responseBody)

				return make_response(json.dumps(responseBody, ensure_ascii=False), 200)

			else:
				return make_response(json.dumps(responseBody, ensure_ascii=False), 200)
		else:
			return getErrorReponse('未登入系統，拒絕存取', 403)

app.run(host="0.0.0.0", port=3000)

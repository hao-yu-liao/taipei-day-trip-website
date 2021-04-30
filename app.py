import os, re, json

from flask import *
from sqlalchemy import create_engine, text


app=Flask(
	__name__,
	static_folder="static",
    static_url_path="/static"
)
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True

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

#

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
		
		
			def dataNum():
				if bool(srckeyword):
					keyword = "%" + srckeyword + "%"

					return list(execute(t_count_api_attrs_keyword, keyword=keyword).first())[0]
				
				else:
					return list(execute(t_count_api_attrs_noKeyword).first())[0]

			if (id < dataNum()):
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

				# print('dataReturn: ', dataReturn)
			
			else:
				dataReturn['nextPage'] = None
				
		
		return json.dumps(dataReturn, ensure_ascii=False), 200


	except Exception as e:
		# print(e)
		errorReturn = {
			"error": True,
			"message": "自訂的錯誤訊息"
		}

		return json.dumps(errorReturn, ensure_ascii=False), 500


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

app.run(host="0.0.0.0", port=3000)
# taipei-day-trip-website
## 目錄
1. [專案展示](#專案展示)
2. [專案摘要](#專案摘要)
3. [開發介紹](#開發介紹)
    - [技術架構及摘要](#技術架構及摘要)
        - 前端開發
        - 後端開發
        - 開發工具
    - [目錄架構](#目錄架構)
    - [開發、部署流程](#開發部署流程)
        - 開發
        - 部署  
    - [程式設計摘要](#程式設計摘要)
        1. [會員系統建立、登入狀態管理](#會員系統建立登入狀態管理)
        2. [Application server 程式架構](#Application-server-程式架構)
        3. [串接第三方金流](#串接第三方金流)
4. [附錄](#附錄)
    - [技術介紹](#技術介紹)
    - [專案介紹](#專案介紹)
        - [首頁](#首頁)
        - [登入/註冊 modal](#登入註冊-modal)
        - [行程簡介頁](#行程簡介頁)
        - [預定行程頁](#預定行程頁)

## 專案展示
- 專案網址：http://18.136.117.43:3000/
- 測試帳號：ply@ply.com
- 測試帳號：12345678

## 專案摘要
「台北一日遊」為一旅遊電商網站，其提供使用者搜尋台北著名景點，進一步預約導覽行程時間，並提供信用卡付款。

![](https://github.com/haoyuliaocurb/taipei-day-trip-website/blob/develop/images/index-lg.png)

## 開發介紹
### 技術架構及摘要
![](https://github.com/haoyuliaocurb/taipei-day-trip-website/blob/develop/images/taipei-day-trip-website-constructure-1.jpeg)

- 更多細節可見附錄 [技術介紹](#技術介紹)
- 前端開發：使用 [MVC](#MVC) 架構、[Sass/SCSS](#sassscss)、[Normalize.css]((#Normalizecss)) 等獨立開發，並實踐 [RWD、AJAX](#專案細節)，沒有使用任何前端 UI 套件
- 後端開發：使用 [Firebase](#Firebase-Firestore) 服務開發資料庫、web server、會員系統等，其中為了串接兩個第三方服務：[TapPay](#第三方服務) (金流)、[Algolia](#第三方服務) (Full-text search 套件)，需要使用 [Firebase Cloud Functions](#Firebase-Cloud-Functions) 自訂兩個跨網域 API，以 [Node.js、Express.js、Axios](#nodejsexpressjsaxios) 技術撰寫程式碼，使前端與 API、API 與第三方服務 req/res
- 開發工具：使用 [Git/GitHub](#gitgithub) 做版本控管，並迭代進行 QA，更多細節可見 [開發流程](#開發流程)

### 目錄架構
  - 專案目錄下有 static 目錄供 Python server 套件 [Flask.py](#PythonFlaskpy) 取得靜態檔案；templates 目錄下的 HTML 檔案則會配合 Jinja2 樣版引擎渲染
  - static 目錄下分立 scripts、styles 子目錄  
    - scripts：依照頁面拆分檔案；其中跨頁面共用組件，如 Nav Bar、SignIn modal 等，則將相關邏輯編寫在 general.js
    - styles：依照頁面拆分檔案；又 src 子目錄中，_general.scss 具有全域 styles，_library.js 存放開發者常用樣式模組
 
### 開發、部署流程
![](https://github.com/haoyuliaocurb/taipei-day-trip-website/blob/develop/images/taipei-day-trip-website-constructure-2.jpeg)

- 開發
  - 以 [GitHub Flow](#gitgithub) 為基礎進行開發，包含要求 reviewer 同意 pull request 實踐 GitHub Flow，並迭代進行 QA
  - 使用 [MVC 架構](#MVC) 撰寫前端程式碼，並依所屬組件分類，以 attraction 頁面為例，在 load 事件後執行包含 controller.attraction.initComponent 的 callback，controller 中先是呼叫 model 函式取得資料，之後再以 view 函式渲染畫面
    - Model 函式：model.attraction.fetchAttractionData
    - View 函式：view.attraction.renderComponent
    - Controller 函式：controller.attraction.initComponent
  - 依據後端規格文件建立 [MySQL 資料庫](#MySQL)、開發 [RESTful API](#RESTful-API)，實踐細節可見 [會員系統建立、登入狀態管理](#會員系統建立登入狀態管理)
  - 清洗臺北旅遊網 Open API 的原始資料，並建立 MySQL 資料庫 attractions 資料表
- 部署
  - 使用 [AWS EC2](#AWS-EC2) 作 Virtual machine，選用 Linux Ubuntu 發行版本，並運行由 [Python、Flask.py](#pythonflaskpy) 編寫之 Application server
  - 編寫並執行 configs 檔案，在 [AWS EC2](#AWS-EC2) 上快速建立 MySQL 資料庫
  - 使用 nohup 指令讓 Application server 在 [AWS EC2](#AWS-EC2) 背景運作

### 程式設計摘要
1. #### 會員系統建立、登入狀態管理
- 使用 [MySQL 資料庫](#MySQL) users 資料表建立會員系統
- 使用 [Flask.py](#PythonFlaskpy) Session 套件實踐 cookies、server-side session 讓 HTTP stateful，以此實踐登入、登出功能
- 在每個頁面中，前端會先呼叫 general.js 中的 initGeneral、getSignInData 等函式，透過 GET HTTP 方法向 /api/user 要求目前使用者登入狀態，並渲染對應的畫面

2. #### Application server 程式架構
- 使用 [Flask.py](#PythonFlaskpy) 建立 Routing system
- 配合規格文件實踐 [RESTful API](#RESTful-API)，依照不同 HTTP 方法的請求，執行對應的程式碼

3. #### 串接第三方金流
- 前端透過 [第三方金流 TapPay](#第三方金流) 官方 TapPay SDK 模組渲染輸入介面，以取得使用者輸入之信用卡資訊，其後得觸發 submit 事件，callback 中先以 TapPay SDK 函式取得驗證碼，接著透過 POST HTTP 方法向 /api/orders 請求開始付款程序，後端進一步使用前端資訊請求 TapPay API，並依據 TapPay API 回應判斷給予前端之回應

<!-- ## 優化方向 -->
## 附錄
<!-- ### 功能介紹 -->
### 技術介紹
#### 前端
- ##### HTML
- ##### Sass/SCSS
  使用 Sass/SCSS 預處理、靜態切版
- ##### Normalize.css
  使用 Normalize.css 作跨瀏覽器 CSS 問題處理
- ##### Modern JavaScript
  使用 Modern JavaScript 操作 DOM 建立前端動態
- ##### MVC
  使用 MVC 架構撰寫前端程式碼，並依所屬組件分類，以 attraction 頁面為例，在 load 事件後執行包含 controller.attraction.initComponent 的 callback，controller 中先是呼叫 model 函式取得資料，之後再以 view 函式渲染畫面
  - Model 函式：model.attraction.fetchAttractionData
  - View 函式：view.attraction.renderComponent
  - Controller 函式：controller.attraction.initComponent
- ##### 專案細節
  - 實踐 RWD
  - 實踐 infinite scroll、carousel
  - 使用 Fetch API 實踐 AJAX

#### 後端
- ##### Python、Flask.py
  使用 Python、Flask.py 建立 Application server
- ##### AWS EC2
  使用 AWS EC2 作 Virtual machine，選用 Linux Ubuntu 發行版本，並運行 Application server
- ##### RESTful API
  實踐 RESTful API 並更新資料庫
- ##### cookies、server-side session
  使用 [Flask.py](#PythonFlaskpy) Session 套件實踐 cookies、server-side session 讓 HTTP stateful
- ##### 第三方金流
  串接 TapPay 作第三方金流，實踐信用卡付款功能
- ##### MySQL
  使用 MySQL 建立關聯式資料庫
- ##### pool connection
  使用 SQLAlchemy 與資料庫建立 pool connection

#### 開發工具
- ##### Git/GitHub
  使用 Git/GitHub 做版本控管，配合 pull request 實踐 GitHub Flow
* ##### NPM、ES6 module system 、Webpack、Babel
  使用 NPM、ES6 module system 、Webpack、Babel 導入套件、解析 ES6 JS 語法
  
### 專案介紹
「台北一日遊」為一旅遊電商網站，其提供使用者搜尋台北著名景點，進一步預約導覽行程時間，並提供信用卡付款。

![](https://github.com/haoyuliaocurb/taipei-day-trip-website/blob/develop/images/index-lg.png)

- #### 首頁
在首頁中，使用者可以瀏覽台北著名景點，並輸入關鍵字進行全文搜尋。實踐 [infinite scroll](#專案細節)，向下滑動可自動載入下一頁資料，直到沒有相符搜尋結果。

圖左：首頁，可輸入關鍵字全文搜尋台北著名景點<br>
圖右：登入/註冊 modal，圖中提示登入失敗字樣

![](https://github.com/haoyuliaocurb/taipei-day-trip-website/blob/develop/images/index-combined-sm.png)

- #### 登入/註冊 modal
在各個頁面的導航列中，都可以透過「登入/註冊」按鈕顯示彈跳視窗，進一步登入、註冊帳戶。登入者，可使用導航列「登出」按鈕登出帳戶。

- #### 行程簡介頁
在行程簡介頁中呈現景點相關資訊，包含 [carousel]((#專案細節)) 實踐，並可讓使用者預約導覽行程時間，跳轉預定行程頁進一步付款。

圖：行程簡介頁，可瀏覽景點相關資訊，並預約導覽行程時間

![](https://github.com/haoyuliaocurb/taipei-day-trip-website/blob/develop/images/attraction-lg.png)

- #### 預定行程頁
在預定行程頁中，使用者瀏覽尚未付款的預定行程，並進一步使用信用卡付款。系統會自動帶入使用者聯絡資訊。

圖：預定行程頁，可使用信用卡付款

![](https://github.com/haoyuliaocurb/taipei-day-trip-website/blob/develop/images/booking-lg.png)

圖左：行程簡介頁<br>
圖右：預定行程頁

![](https://github.com/haoyuliaocurb/taipei-day-trip-website/blob/develop/images/attractionNBooking-sm.png)
<!-- ### 程式設計
### 組件開發總覽
#### \<App />
* ##### \<Main /> -->

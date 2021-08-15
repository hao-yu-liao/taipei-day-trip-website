# TodoShop
## 目錄
1. [專案展示](#專案展示)
2. [專案簡介](#專案簡介)
    - [首頁](#首頁)
    - [登入/註冊 modal](#登入註冊-modal)
    - [行程簡介頁](#行程簡介頁)
    - [預定行程頁](#預定行程頁)
3. [開發簡介](#開發簡介)
    - [技術架構及摘要](#技術架構及摘要)
        - 前端開發
        - 後端開發
        - 開發工具
    - [目錄架構](#目錄架構)
    - [開發流程](#開發流程)
    - [程式設計摘要](#程式設計摘要)
        1. [SPA Routing](#SPA-Routing)
        2. [會員系統建立、登入狀態管理](#會員系統建立登入狀態管理)
        3. [登入狀態驗證、redirect](#登入狀態驗證redirect)
        4. [composition 概念、reusable component](composition-概念reusable-component)
        5. [Imperative operation：useRef、ref 屬性](#imperative-operationuserefref-屬性)
4. [附錄](#附錄)
    - [技術介紹](#技術介紹)

## 專案展示
- 專案網址：http://18.136.117.43:3000/
- 測試帳號：ply@ply.com
- 測試帳號：12345678

## 專案簡介
「台北一日遊」為一旅遊電商網站，其提供使用者搜尋台北著名景點，進一步預約導覽行程時間，並提供信用卡付款。

![](https://github.com/haoyuliaocurb/TodoShop/blob/main/images/index-lg.png)

- ### 首頁
在首頁中，使用者可以瀏覽台北著名景點，並輸入關鍵字進行全文搜尋。實踐 infinite scroll(#專案細節)，向下滑動可自動載入下一頁資料，直到沒有相符搜尋結果。

圖左：首頁，可輸入關鍵字全文搜尋台北著名景點<br>
圖右：登入/註冊 modal，圖中提示登入失敗字樣

![](https://github.com/haoyuliaocurb/TodoShop/blob/main/images/imdex-combined-sm.png)

- ### 登入/註冊 modal
在各個頁面的導航列中，都可以透過「登入/註冊」按鈕顯示彈跳視窗，進一步登入、註冊帳戶。登入者，可使用導航列「登出」按鈕登出帳戶。

- ### 行程簡介頁
在行程簡介頁中呈現景點相關資訊，包含 [carousel]((#專案細節)) 實踐，並可讓使用者預約導覽行程時間，跳轉預定行程頁進一步付款。

圖：行程簡介頁，可瀏覽景點相關資訊，並預約導覽行程時間

![](https://github.com/haoyuliaocurb/TodoShop/blob/main/images/attraction-lg.png)

- ### 預定行程頁
在預定行程頁中，使用者瀏覽尚未付款的預定行程，並進一步使用信用卡付款。系統會自動帶入使用者聯絡資訊。

圖：預定行程頁，可使用信用卡付款
![](https://github.com/haoyuliaocurb/TodoShop/blob/main/images/booking-lg.png)

圖左：行程簡介頁<br>
圖右：預定行程頁

![](https://github.com/haoyuliaocurb/TodoShop/blob/main/images/attractionNBooking-sm.png)

## 開發簡介
### 技術架構及摘要
![](https://github.com/haoyuliaocurb/TodoShop/blob/main/images/TodoShop%20%E5%89%8D%E5%BE%8C%E7%AB%AF%E6%9E%B6%E6%A7%8B.jpeg)

- 更多細節可見附錄 [技術介紹](#技術介紹)

串接台北 API
清洗資料
MVC


- 前端開發：使用 [Sass/SCSS](#sassscss)、[React 生態系]((#react)) 獨立開發，沒有使用任何前端 UI 套件
- 後端開發：使用 [Firebase](#Firebase-Firestore) 服務開發資料庫、web server、會員系統等，其中為了串接兩個第三方服務：[TapPay](#第三方服務) (金流)、[Algolia](#第三方服務) (Full-text search 套件)，需要使用 [Firebase Cloud Functions](#Firebase-Cloud-Functions) 自訂兩個跨網域 API，以 [Node.js、Express.js、Axios](#nodejsexpressjsaxios) 技術撰寫程式碼，使前端與 API、API 與第三方服務 req/res
- 開發工具：使用 [Git/GitHub](#gitgithub) 做版本控管，並迭代進行 QA，更多細節可見 [開發流程](#開發流程)

### 目錄架構
以 [Create-react-app](#Create-react-app) 建立專案目錄基礎分立 src、public，其中 src 之中分立 app、components、pages、styles、utils 等子目錄
* app、components、pages：放置 React component 檔案；root component App.js 放置 app 目錄；HomePage、SearchPage 等頁面 component 放置 pages 目錄，其餘者依照所屬 page 分類在 components 目錄
* styles：放置 Styled components 檔案，依照所屬 page 分類；general.scss 具有全域 styles，cssMaterials.js 存放 styles 相關變數及跨頁面邏輯 
* utils：放置 Firebase config script、開發者自身 Library 等
### 開發流程
以 [Git Flow](#gitgithub) 為基礎進行開發，並迭代進行 QA
* 初始化專案時，具有 main、develop branch
* 開發新頁面、新功能時，則新增 branch feature/featureName 進行開發
* 開發完成後以 develop merge  feature/featureName branch
* 階段性發行版本則以 release/versionName 紀錄
* 配合 QA 表格測試、Debug，搭配使用 [USB Debugging](#USB-debugging) 等技術
### 程式設計摘要
1. #### SPA Routing
* 使用 [React Router](#React-Router) 為 SPA Routing 技術基礎
* 骨幹 Routing 實現於 \<Main /> 中，以 \<Switch>、\<Route> 來轉址對應的 URL path /pageName，並 render 的 page component
  * 例如：/todolist 即 render \<TodolistPage />，/cart 即 render \<CartPage />
  * 配合帶入 \<Main /> 中的 isSignIn、windowWidth 兩個 state 給 page components
2. #### 會員系統建立、登入狀態管理
- 使用 Firebase Auth 建立後端會員系統
- 前端以 \<Main /> 中的 isSignIn state 觸發，render 不同登入狀態的頁面功能及畫面
- 使用 Firebase Auth 提供的 onAuthStateChanged 監聽器，當登入狀態改變，onAuthStateChanged 會呼叫 callback 函式以改變 isSignIn，進而 re-render 畫面
- isSignIn 預設為未登入，值為 null；登入時，值為後端會員系統的識別碼 uid，可配合 fetch 資料庫資料使用
3. #### 登入狀態驗證、redirect
- 包含敏感資料頁面，如 \<Paymentpage />、\<Authpage />，render 時會自 URL path 取得相關資料識別碼，與登入狀態比對，如不符合即 redirect 至前一頁面
  - 例如：在 /auth/uid/:UserId 頁面中會使用 UserId 變數取得會員相關資料並 render \<AuthPage />，然而在這之前，會先將 UserId 值與 isSignIn 作比對，若不符合，則視為非法瀏覽頁面，跳轉至 /auth/signIn 登入頁面
4. #### composition 概念、reusable component
- 運用 Composition 概念，將跨頁面功能相似者，例如：各種 button、modal、scrollable bar、Carousel 等，保留其事件 callback、圖文內容、state 等位置為空白，就像一個容器，並於使用時傳入對應的 props 彈性地呈現特定內容，藉此達到 reuse 程式碼的目的
5. #### Imperative operation：useRef、ref 屬性
- 操作組件 modal 等視覺效果時，若以 ref 屬性直接操作該 DOM element，而非透過 React state 來觸發 re-render，可以帶來開發方便、節省效能的益處。
- 開發中多直接控制 React element tree 末端者的 classList，以操作 css 並控制組件的視覺效果
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
- ##### Cookies、Server Session
  實踐 Cookies、Server Session 讓 HTTP stateful
- ##### 第三方金流
  串接 TapPay 作第三方金流，實踐信用卡付款功能
- ##### MySQL
  使用 MySQL 建立關聯式資料庫
- ##### Pool connection
  使用 SQLAlchemy 與資料庫建立 Pool connection

#### 開發工具
- ##### Git/GitHub
  使用 Git/GitHub 做版本控管，配合 Pull request 實踐 GitHub Flow
* ##### NPM、ES6 module system 、Webpack、Babel
  使用 NPM、ES6 module system 、Webpack、Babel 導入套件、解析 ES6 JS 語法
<!-- ### 程式設計
### 組件開發總覽
#### \<App />
* ##### \<Main /> -->

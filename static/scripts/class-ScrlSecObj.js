let scrlSecObj = {};
let HTMLElementByID = {};

// ScrlSecObj類別
class ScrlSecObj {
  // 建構式
  constructor(scrlSec, scrlUnit, scrlSecObjName) {
    // 物件屬性
    this._name = scrlSecObjName;
    this._printedName = `scrlSecObj.${this._name}`;
    // scrlSecObj初始化
    this._scrlUnit = scrlUnit;
    
    // 取得ScrlSec位置應找：_settedScrlSec，_scrlSec是創造一個scrlSec的函式
    this._scrlSec = scrlSec;

    // 註冊scrlSecObj
    this._isEnrolledScrlSecObj = this._enrollScrlSecObj()
    
    // _generateRandomScrlSecID()使用
    this._hasScrlSecID = false;
    this._scrlSecID = this._generateRandomScrlSecID();
    
    // _setScrlSecID()使用
    this._settedScrlSec = this._setScrlSecID();
    this._hasSetScrlSec = false;

    // appendScrlSec()使用
    this._hasAppendScrlSec = false;

    // data相關：fetchData()、_cleanseSrcData()使用
    this._dataFetching = true;
    this._data = []; // 應該要有一個setData()，然後會把this._dataFetching = false
    this._isAllDataDisplayed = false;
    this._isUnableMtnDataStockStd = false;
    this._dataFetchingURL = this._accessDataFetchingURL();
    // 刪掉舊的_oldDataFetchingURL
    this._oldDataFetchingURL = null;
    this._dataCleansingRoot = function(){};
    this._cleanseData = function(){};

    // addScrlUnits()使用
    this._counter = 0;
    this._hasFirstAddScrlUnits = false;

    // dataStockStd
    this._dataStockStd = null;
    this._hasSetDataStockStd = false;

    // onscrlAddScrlUnits()使用
    this._onsrclTimeout = {};

    // clsAddScrlUnit()使用
    this._clsAddScrlUnitsTimeoust = {};

    // 函式間若需要調動參數
    this._parameter = {};

  }

  // 靜態方法
  // 因為static語法的限制，靜態方法_generateScrlSecID以prototype的方式來處理
  static _generateRandomScrlSecID() {
    var generatedScrlSecID = [];
    // let self = this; // 這裡不用self，是因為我希望this隨著呼叫的對象改變，而非指到定義時候的this

    function geneRandomScrlSecID() {
      if (this._hasScrlSecID === false) {
        var generateRandom = function reset() {
          let random = Math.floor(Math.random()*998+1); // random：1 -> 999
          if (generatedScrlSecID.every(function(value) { return value !== random })) {
            return random;
          }
          else {
            return reset();
          }
        }
        let random = generateRandom();
        generatedScrlSecID.push(random);
        this._hasScrlSecID = true;
        return `scrlSec-${random}`;
      }
    }

    return geneRandomScrlSecID;
  }

  static _setScrlSecID() {
    let scrlSec = this._scrlSec();
    scrlSec.setAttribute('id', this._scrlSecID);
    this._hasSetScrlSec = true;
    return scrlSec
  }
  
  static _accessCurrentScrlSec() {
    var initialized = false;
    var currentScrlSec = null;

    function clsAccessCurrentScrlSec( action = 'get' ){
      let self = this;

      if ( action === 'get' ) {
        // getCurrentScrlSec        
        return currentScrlSec;
      }
      else if ( action === 'set' ) {
        // setCurrentScrlSec        
        if (initialized ===  false) {
          initialized = true;
          currentScrlSec = self; 
          currentScrlSec._settedScrlSec.classList.remove("dp-none");
          console.log(`currentScrlSec ${self._printedName} initialized`);
        }
        if (currentScrlSec !== self ) {
          currentScrlSec._settedScrlSec.classList.add("dp-none");
          self._settedScrlSec.classList.remove("dp-none");
          currentScrlSec = self;
        }
        else {
          currentScrlSec._settedScrlSec.classList.remove("dp-none");
        }
      }  
    }
    return clsAccessCurrentScrlSec;
  }

  static _accessDataFetchingURL() {
    let URLObj = {};
    let thisValueURLObj = {};
    let self = this;

    function clsAccessDataFetchingURL(srcDataFetchingURLObj={}) {
        let dataFetchingURLObj = srcDataFetchingURLObj;

        // console.log(`thisValueURLObj = \n`);
        for (let i in thisValueURLObj) {
            // console.log(`${i}: ${thisValueURLObj[i]}`)
            if (thisValueURLObj[i] !== null) {
                dataFetchingURLObj[i] = thisValueURLObj[i];
            }
        }
        
        // 若有dataFetchingURLObj，便取回處理
        function handleDataFetchingURLObj () {
            
            for (let i in dataFetchingURLObj) {
                let splitDotArray = String(dataFetchingURLObj[i]).split(".");
                if (splitDotArray[0] === 'this') {
                    let thisValue = self;
                    for (let i = 1; i < splitDotArray.length; i++) {
                        thisValue = thisValue[splitDotArray[i]];
                    }
                    URLObj[i] = thisValue;
                    thisValueURLObj[i] = dataFetchingURLObj[i];
                }
                else {
                    URLObj[i] = dataFetchingURLObj[i];
                    thisValueURLObj[i] = null;
                }
            }
        }

        function generateURL() {
            let URLPath;
            let URLQueryString = "";
            let URL;

            for (let i in URLObj) {
                if (i === 'path') {
                    URLPath = URLObj[i];
                }
                else {
                    URLQueryString = `${URLQueryString}${i}=${URLObj[i]}&`
                }
            }

            URL = `${URLPath}?${URLQueryString}`;
            URL = URL.slice(0, -1);
            // console.log(`${self._printedName}.setDataFetchingURL() = ${URL}`)

            return URL
        }

        handleDataFetchingURLObj();
        let generatedURL = generateURL();

        return generatedURL
    }
    
    return clsAccessDataFetchingURL
  }

  static onsrclAddScrlUnits(num) {
    let currentScrlSec = ScrlSecObj.prototype._accessCurrentScrlSec();

    // 使用_onsrclTimeout，來保證最後要運行一次
    setTimeout(function () {
      if (currentScrlSec._onsrclTimeout !== undefined) {
          window.clearTimeout(currentScrlSec._onsrclTimeout);
      }
      currentScrlSec._onsrclTimeout = window.setTimeout(function () {
          //監聽事件內容
          if(getScrollHeight() <= getDocumentTop() + getWindowHeight()) {
              //當滾動條到底時,這裡是觸發內容
              //異步請求數據,局部刷新dom
              currentScrlSec.addScrlUnits(num)
          }
          // console.log('successfully onsrclAddScrlUnits()')
      }, 105);
    }, 100);

    // scroll的位移
    function getDocumentTop() {
      var scrollTop =  0, bodyScrollTop = 0, documentScrollTop = 0;
      if (document.body) {
          bodyScrollTop = document.body.scrollTop;
      }
      if (document.documentElement) {
          documentScrollTop = document.documentElement.scrollTop;
      }
      scrollTop = (bodyScrollTop - documentScrollTop > 0) ? bodyScrollTop : documentScrollTop;
      // console.log("scrollTop: "+scrollTop);
      return scrollTop;
    }

    // 視窗高度
    function getWindowHeight() {
      var windowHeight = 0;
      if (document.compatMode == "CSS1Compat") {
          windowHeight = document.documentElement.clientHeight;
      } else {
          windowHeight = document.body.clientHeight;
      }
      // console.log("windowHeight: "+windowHeight);
      return windowHeight;
    }

    // scroll總高
    function getScrollHeight() {
      var scrollHeight = 0, bodyScrollHeight = 0, documentScrollHeight = 0;
      if (document.body) {
          bodyScrollHeight = document.body.scrollHeight;
      }
      if (document.documentElement) {
          documentScrollHeight = document.documentElement.scrollHeight;
      }
      scrollHeight = (bodyScrollHeight - documentScrollHeight > 0) ? bodyScrollHeight : documentScrollHeight;
      // console.log("scrollHeight: "+scrollHeight);
      return scrollHeight;
    }
  }
  
  static accessAllScrlSecObj() {
    var enrolledScrlSecObj = [];
    
    function clsAccessAllScrlSecObj(accessAllfunc, isAccessAll=true) {
      let self = this;
      // console.log(`self._printedName = ${self._printedName}`);
      function printEnrolledScrlSecObjList() {
        let enrolledScrlSecObjList = `\n`;
        enrolledScrlSecObj.forEach(function(element){
          enrolledScrlSecObjList +=  `${element._printedName} \n`;
        });
        return enrolledScrlSecObjList
      }

      console.log(self);
      console.log(self.constructor);
      console.log(self instanceof ScrlSecObj);

      if (self instanceof ScrlSecObj === true) {
        if (enrolledScrlSecObj.some(function(element) {
          return element === self
        })) {
          console.log(`${self._printedName} is already enrolled in scrlSecObj list: \n`, printEnrolledScrlSecObjList());
      }
        else {
          enrolledScrlSecObj.push(self);
          console.log(`${self._printedName} is enrolled in scrlSecObj list: \n`, printEnrolledScrlSecObjList());
        }
      }
      else {
        if (self.constructor === ScrlSecObj) {
          if (accessAllfunc instanceof Function) {
            if (isAccessAll === true) {
              for (let i of enrolledScrlSecObj) {
                accessAllfunc(i);
              }
              console.log(`successfully run ScrlSecObj.prototype.accessAllScrlSecObj()`)
            }
            if ((isAccessAll instanceof Object) && !(isAccessAll instanceof Array)) {
              // console.log(`isAccessAll = `, isAccessAll);
              let isAccessAllCopy = JSON.parse((JSON.stringify(isAccessAll)));
              // console.log(`isAccessAllCopy = `, isAccessAllCopy);
              for (let j in isAccessAllCopy) {
                console.log(`j = `, j);
                for (let i of enrolledScrlSecObj){
                  // console.log(`i = `,i);
                  // console.log(`i['_name'] = `,i['_name']);
                  if(j === i['_name']) {
                    console.log(`i['_name'] = `,i['_name'], `; j = `, j);
                    accessAllfunc(i);
                    delete isAccessAllCopy.j;
                  }
                }
              }
            }
          }
        }
      }
    }

    return clsAccessAllScrlSecObj
  }

  static _enrollScrlSecObj() {
    if (!(this._isEnrolledScrlSecObj)) {
      this.accessAllScrlSecObj();
      console.log(`${this._printedName}._isEnrolledScrlSecObj = true`)
      
      return true
    }
  }

  // 物件方法
  appendScrlSec(parent) {
    if (this._hasAppendScrlSec === false) {
      this.appendScrlSec(parent);
      this._hasAppendScrlSec = true;
    }
  }

  getDataStockNum() {
    let dataStockNum = this._data.length - this._counter;
    return dataStockNum;
  }

  addCounter(num) {
    this._counter+= num;
    // console.log(this)
    // console.log(this._counter)
  };

  appendScrlSec(parent) {
    parent.appendChild(this._settedScrlSec);
    this._hasAppendScrlSec = true;
    console.log(`successfully append ${this._printedName}`)
  }

  setDataStockStd(num) {
    this._dataStockStd = num;
    console.log(`${this._printedName}._dataStockStd = ${this._dataStockStd}`);
  }

  setLocalData(localData) {
    if (Array.isArray(localData)) {
      this._data = localData;
      this._dataFetching = false;
    }
  };

  _rootData(data) {
    let clsData = data;
    clsData = this._dataCleansingRoot(clsData);
    return clsData
  }

  initDataFetching(defaultDataFetchingURLObj, dataCleansingRoot, cleanseData) {
    // this._oldDataFetchingURL = dataFetchingURL;
    this._dataFetchingURL(defaultDataFetchingURLObj);
    this._dataCleansingRoot = dataCleansingRoot;
    this._cleanseData = cleanseData;
  }

  addScrlUnits(num) {
    let self = this;
    let earlyCounter = self._counter;
    let targetNum = self._counter + num;
    let completedNum = 0;
    self._parameter.addScrlUnits_num = num;

    console.log(`start to add ScrlUnits into ${self._printedName}`);

    function fetchData(num) {
      console.log(`start to fetch data into ${self._printedName}`);
      self._parameter.fetchDataNum = num;
      
      // let request = new Request(self._oldDataFetchingURL);
      console.log(`${self._printedName}._dataFetchingURL() = ${self._dataFetchingURL()}`)
      let request = new Request(self._dataFetchingURL());
      console.log('request.mode: ', request.mode);

      fetch(request)
      .then((response) => response.json())
      .then((srcData) => {
          srcData = self._rootData(srcData); // _dataCleasingRoot()位置再調整
  
          // dataStock管理：若this._dataFetching = true，便寫在fetchData()中
          if (srcData.length < num) {
            self._isUnableMtnDataStockStd = true;
            console.log(`nondisplayed data of ${self._scrlSecID} are less than ${self._dataStockStd}`);
          }
          if (JSON.stringify(srcData) === JSON.stringify([])) {
            // 若srcData為空陣列，表示資料已用盡
            self._isAllDataDisplayed = true;
            console.log(`all data of ${self._scrlSecID} are displayed`);
          }
  
          let revData = srcData.map((value) => {
              self._data.push(self._cleanseData(value));
              return self._cleanseData(value)
          })
          // console.log(`succesfully fetch ${num} data, below are data of ${self._printedName}: \n`, self._data);
          console.log(`succesfully fetch ${num} data into ${self._printedName}, ${self._data.length} data in total`);
      })
    }

    function clsAddScrlUnits() {
      console.log(`${self._printedName}._hasAppendScrlSec = ${self._hasAppendScrlSec}`)
      if (self._hasAppendScrlSec === false) {
        self.appendScrlSec(document.querySelector('body'))
      }

      for (let i=earlyCounter; i<targetNum; i++) {
        // 確認還有data可以新增
        // console.log(`${self._printedName}._counter = ${self._counter}`)
        if (self.getDataStockNum() > 0) {
          // console.log(self._counter)
          self._settedScrlSec.appendChild(self._scrlUnit(self._data, i));
          self.addCounter(1);
          completedNum+=1;
        }
        else {
          self._isAllDataDisplayed = true;
          console.log(`all data of ${self._printedName} are displayed`);
          break;
        }  
      }
      console.log(`successfully add ${completedNum} ScrlUnits into ${self._printedName}, ${num-completedNum} failed`)
      console.log(`now ${self._counter} ScrlUnits in ${self._printedName}`)
      
      if ((self._dataFetching === true) && (self._isUnableMtnDataStockStd === false)) {
        fetchData(num);
      }
    }

    // 第一次addScrlUnits()前置作業
    console.log(`${self._printedName}._hasFirstAddScrlUnits = ${self._hasFirstAddScrlUnits}`);
    if (self._hasFirstAddScrlUnits === false) {
      console.log(`${self._printedName}._dataFetching = ${self._dataFetching}`);
      if (self._dataFetching === false) {
        if (JSON.stringify(self._data) !== JSON.stringify([])) {
          self._hasFirstAddScrlUnits = true;
        }
      }
      else {
        // 預設透過num來使用setDataStockStd()
        console.log(`${self._printedName}._hasSetDataStockStd = ${self._hasSetDataStockStd}`);
        if (self._hasSetDataStockStd ===  false) {
          if (num > 10) {
            self.setDataStockStd(num);
          }
          else {
            self.setDataStockStd(10);
          }
          self._hasSetDataStockStd = true;
        }
        fetchData(self._dataStockStd);

        let checkFirstDataFetching = function clsCheckFirstDataFetching () {
          if (JSON.stringify(self._data) === JSON.stringify([])) {
            setTimeout(function () {
              console.log(`still waiting for fetching data into ${self._printedName}`);
              clsCheckFirstDataFetching ();
            }, 100); 
          }
          else {
            // 寫到這裡，把它合併到module，然後看看self._dataFetching === false的情況，要怎麼clsAddScrlUnits()
            clsAddScrlUnits();
            console.log(`successfully first add SrclUnits into ${self._printedName}`);
            self._hasFirstAddScrlUnits = true;
            console.log(`${self._printedName}._hasFirstAddScrlUnits = ${self._hasFirstAddScrlUnits}`);
          }
        }
        checkFirstDataFetching(); 
      }
    }

    // 第二次之後的addScrlUnits()
    // console.log(`self._hasFirstAddScrlUnits = ${self._hasFirstAddScrlUnits}`);
    if (self._hasFirstAddScrlUnits === true) {
      // 使用clsAddScrlUnits()的前置作業
      if (self._dataFetching === false) {
        // dataStock管理：若this._dataFetching = false，便寫在addScrlUnits()中
        if (self._dataStockNum < self._dataStockStd) {
          self._isUnableMtnDataStockStd = true;
          console.log(`nondisplayed data of ${self._scrlSecID} are less than ${self._dataStockStd}`);
        }
      }

      console.log('clsAddScrlUnits()');
      clsAddScrlUnits();
    }
  }
  
  trial() {
    // console.log(this._accessDataFetchingURL());
  }
}
  
ScrlSecObj.prototype._generateRandomScrlSecID = ScrlSecObj._generateRandomScrlSecID();
// 因為static語法的限制，，沒辦法將某函式直接賦值給一個變數，靜態方法_setScrlSecID以prototype的方式來處理
ScrlSecObj.prototype._setScrlSecID = ScrlSecObj._setScrlSecID;
ScrlSecObj.prototype._accessCurrentScrlSec = ScrlSecObj._accessCurrentScrlSec();
ScrlSecObj.prototype._accessDataFetchingURL = ScrlSecObj._accessDataFetchingURL;
ScrlSecObj.prototype.accessAllScrlSecObj = ScrlSecObj.accessAllScrlSecObj();
ScrlSecObj.prototype._enrollScrlSecObj = ScrlSecObj._enrollScrlSecObj;

ScrlSecObj.createScrlSecObj = function(scrlSec, scrlUnit, scrlSecObjName) {
  // 往後可以優化為，只要第一次輸入過scrlSec, scrlUnit，以後就不用再輸入

  if (typeof(scrlSecObjName) === 'string') {
    if (scrlSecObj.scrlSecObjName === undefined) {
      scrlSecObj[scrlSecObjName] = new ScrlSecObj(scrlSec, scrlUnit, scrlSecObjName);
      console.log(`create ${scrlSecObj[scrlSecObjName]._printedName}`);
    }
  }
  if ((scrlSecObjName instanceof Object) && !(scrlSecObjName instanceof Array)) {
    for (let i in scrlSecObjName) {
      scrlSecObj[i] = new ScrlSecObj(scrlSec, scrlUnit, i);
      console.log(`create ${scrlSecObj[i]._printedName}`)
    }
  }
} 

export {
  scrlSecObj, HTMLElementByID, ScrlSecObj
};
  
  /*
  onsrclAddScrlUnits(num) {
    let self = this;
  
    // 使用_onsrclTimeout，來保證最後要運行一次
    setTimeout(function () {
      if (self._onsrclTimeout !== undefined) {
          window.clearTimeout(self._onsrclTimeout);
      }
      self._onsrclTimeout = window.setTimeout(function () {
          //監聽事件內容
          if($(document).height() <= $(window).height() + $(window).scrollTop()) {
              //當滾動條到底時,這裡是觸發內容
              //異步請求數據,局部刷新dom
              self.addScrlUnits(num)
          }
          console.log('successfully onsrclAddScrlUnits()')
      }, 105);
    }, 100);
  };
  */


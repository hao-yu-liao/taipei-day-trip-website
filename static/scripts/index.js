import lib from './library.js'
import gen from './general.js'

// global
let nextPage = null;
let _onsrclTimeout = null;
let scrlSecOpt = {};
let main = document.getElementById('main');
let currentScrlSec = null;
let keyword = null;

// scrlSec元件：使用者自定義

const scrlSec = (id) => {
    const scrlSec = document.createElement('section');
    scrlSec.setAttribute('id', `scrlSec_${id}`)
    scrlSec.classList.add('c_scrlSec', 'dp-none');
  
    return scrlSec;
}
  
// scrlUnit元件：使用者自定義
  
const scrlUnit = (data) => {
    const scrlUnitFig = document.createElement('figure');
    scrlUnitFig.appendChild(document.createElement('img')).setAttribute('src', `${data.images[0]}`);

    const scrlUnitCnt = document.createElement('figcaption');

    // line 1
    const scrlUnitCnt_L1 = scrlUnitCnt.appendChild(document.createElement('p'));
    scrlUnitCnt_L1.appendChild(document.createTextNode(`${data.name}`));
    scrlUnitCnt_L1.classList.add('body', 'bold');
    // scrlUnitCnt_L1.setAttribute('class', 'body');
    // scrlUnitCnt_L1.classList.add('bold');

    // line 2
    const scrlUnitCnt_L2 = scrlUnitCnt.appendChild(document.createElement('div'));

    const scrlUnitCnt_L2_01 = scrlUnitCnt.appendChild(document.createElement('p'));
    if (data.mrt !== null) {
        scrlUnitCnt_L2_01.appendChild(document.createTextNode(`${data.mrt}`));
    }
    else {
        scrlUnitCnt_L2_01.appendChild(document.createTextNode(`附近無捷運站`));
    }
    scrlUnitCnt_L2_01.classList.add('body');

    const scrlUnitCnt_L2_02 = scrlUnitCnt.appendChild(document.createElement('p'));
    scrlUnitCnt_L2_02.appendChild(document.createTextNode(`${data.category}`));
    scrlUnitCnt_L2_02.classList.add('body');
    scrlUnitCnt_L2.appendChild(scrlUnitCnt_L2_01);
    scrlUnitCnt_L2.appendChild(scrlUnitCnt_L2_02);

    scrlUnitCnt.appendChild(scrlUnitCnt_L1);
    scrlUnitCnt.appendChild(scrlUnitCnt_L2);

    const scrlUnit = document.createElement('div');
    scrlUnit.classList.add('c_scrlUnit');
    scrlUnit.appendChild(scrlUnitFig);
    scrlUnit.appendChild(scrlUnitCnt);

    // 加入 id property
    scrlUnit.attractionId = data.id;

    return scrlUnit;
};

//
function getURLwithQueryString(page, keyword, path) {
    if (path === undefined) {
        path = lib.getURL('/api/attractions');
    }
    
    if (page === null) return null

    let url = `${path}?page=${page}`;

    if (!(keyword)) {
        return new Request(url)
    }
    else {
        let revUrl = `${url}&keyword=${keyword}`;
        return new Request(revUrl)
    }
}

function createScrlSec(id) {
    main.appendChild(scrlSec(id))
    scrlSecOpt[id] = document.getElementById(`scrlSec_${id}`);
}

function addScrlUnits(request, scrlSecOpt) {
    if (!request) {
        return
    }

    fetch(request)
    .then((response) => response.json())
    .then((srcData) => {

        let data = srcData['data'];
        // console.log(data)
        nextPage = srcData['nextPage'];
        // console.log(`nextPage: ${nextPage}`);

        if (JSON.stringify(data) === JSON.stringify([])){
            // console.log('addScrlUnits: false');

            let noScrlUnitMessage = document.createElement('p');
            noScrlUnitMessage.classList.add('c_noScrlUnitMessage', 'body');
            noScrlUnitMessage.appendChild(document.createTextNode('無相關搜尋結果'));
            scrlSecOpt.appendChild(noScrlUnitMessage);

            return
        }

        data.forEach(function(value, index){
            let currentScrlUnit = scrlUnit(value);
            scrlSecOpt.appendChild(currentScrlUnit);
            currentScrlUnit.addEventListener('click', function() {
                // console.log('trial');
                window.location = lib.getURL(`/attraction/${currentScrlUnit.attractionId}`);
            })
        });

        // console.log(`succesfully fetch data`);
    })
}

function onscrlAddScrlUnits(request, scrlSecOpt) {
    // 使用_onsrclTimeout，來保證最後要運行一次
    setTimeout(function () {
        if (_onsrclTimeout !== undefined) {
            window.clearTimeout(_onsrclTimeout);
        }
        _onsrclTimeout = window.setTimeout(function () {
            //監聽事件內容
            if(getScrollHeight() <= getDocumentTop() + getWindowHeight()) {
                //當滾動條到底時,這裡是觸發內容
                //異步請求數據,局部刷新dom
                addScrlUnits(request, scrlSecOpt)
            }
            // // console.log('successfully onsrclAddScrlUnits()')
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
        // // console.log("scrollTop: "+scrollTop);
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
        // // console.log("windowHeight: "+windowHeight);
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
        // // console.log("scrollHeight: "+scrollHeight);
        return scrollHeight;
    }  
}

// 主程式
window.addEventListener('load', async function() {
    // console.log(`window loaded`);
    await gen.exportFunc.initGeneral();
    createScrlSec('attractions');
    currentScrlSec = scrlSecOpt['attractions'];
    nextPage = 0;

    currentScrlSec.classList.remove('dp-none');
    addScrlUnits(
        getURLwithQueryString(0, keyword), 
        currentScrlSec
    );
});

window.addEventListener('scroll', function() {
    // // console.log(`window scrolled`);
    onscrlAddScrlUnits(
        getURLwithQueryString(nextPage, keyword),
        currentScrlSec
    );
});

// 點擊搜尋鍵
// 創造新的scrlSec

document.getElementById('searchSpot').addEventListener('submit', function(event) {
    // console.log(`search submited`);

    event.preventDefault();
    keyword = document.getElementById('searchSpot_input').value;
    // console.log(keyword);

    createScrlSec(keyword);
    currentScrlSec.classList.add('dp-none');
    nextPage = 0;

    currentScrlSec = scrlSecOpt[keyword];
    currentScrlSec.classList.remove('dp-none');
    addScrlUnits(
        getURLwithQueryString(0, keyword), 
        currentScrlSec
    );
})



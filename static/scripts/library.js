function getURL(path) {
    // protocal
    let protocal = 'http';

    // domain
    let domain_localServer = '127.0.0.1:3000';
    let domain_vsCodeliveServer = '127.0.0.1:5500';
    let domain_EC2 = '18.136.117.43:3000';

    // host, port
    let localhost = 'localhost';
    let port = '3000'
    let composedDomain = `${localhost}:${port}`;

    let domain = domain_EC2;

    // for production
    // return `${protocal}://${domain}${path}`

    // for development
    return path
}

function removePx(originValue) {
    let pxPattern = /px$/i;

    if (typeof(originValue) === 'number') {
        return originValue
    }

    if (!(pxPattern.test(originValue))) {
        return originValue
    }

    let charArray = originValue.split("");
    // 兩次 pop() 把 px 去掉
    charArray.pop();
    charArray.pop();
    // console.log(charArray);
    let revisedValue = Number(charArray.join(""));
    // console.log('revisedValue: ', revisedValue);

    return revisedValue
}

function addPx(originValue) {
    if (typeof(originValue) !== 'number') {
        return originValue
    }

    let revisedValue = `${originValue}px`;

    return revisedValue
}

function dpnoneElemnet(element) {
    element.classList.add("dp-none");

    return element
}

function undoDpnoneElemnet(element) {
    element.classList.remove("dp-none");

    return element
}

function vbhiddenElement(element) {
    element.classList.add("vb-hidden");

    return element
}

function undoVbhiddenElement(element) {
    element.classList.remove("vb-hidden");

    return element
}

function getElementHeight(element) {
    let elementHeight = element.offsetHeight;

    return elementHeight
}

// 要先取 offsetHeight
const calcElementsHeight = {
    add: function() {
        let sumHeight = 0;
        for (var i = 0; i < arguments.length; i++) {
            let elementHeight = removePx(getElementHeight(arguments[i]));
            sumHeight += elementHeight;
        }

        sumHeight = addPx(sumHeight);

        return sumHeight
    },
    sub: function(elementOne, elementTwo) {
        let elementHeightOne = removePx(getElementHeight(elementOne));
        let elementHeightTwo = removePx(getElementHeight(elementTwo));
        let elementHeightLarge = null;
        let elementHeightSmall = null;
        if (elementHeightOne >= elementHeightTwo) {
            elementHeightLarge = elementHeightOne;
            elementHeightSmall = elementHeightTwo;
        }
        else {
            elementHeightLarge = elementHeightTwo;
            elementHeightSmall = elementHeightOne;
        }

        let subHeight = null;
        subHeight = addpx((elementHeightLarge - elementHeightSmall));

        return subHeight
    }
}

function cleanseQueryString(queryString) {
    let srcQueryStringArray = queryString.split("")
    srcQueryStringArray.shift();
    let queryStringArray = srcQueryStringArray.join("").split("&");
    let queryStringObj = {};

    for (let i = 0; i < queryStringArray.length; i++) {
        let keyValuePair = queryStringArray[i].split("=");
        queryStringObj[keyValuePair[0]] =  keyValuePair[1];
    }

    // console.log('queryStringObj: ', queryStringObj);

    return queryStringObj
}

function transferMysqlDateString(dateString, monthShowInWord = false, daytypeShowinWord = false) {
    console.log('dateString in transferMysqlDateString: ', dateString);
    
    let dateStringArray = dateString.split(' ');
    let dataStringObj = {}

    // 處理 daytype name
    let srcDaytypeName = dateStringArray[0];
    let srcDaytypeNameArray = srcDaytypeName.split("");
    srcDaytypeNameArray.pop();
    let daytypeName = srcDaytypeNameArray.join("");
    dateStringArray[0] = daytypeName

    // 處理時間
    let timeArray = dateStringArray[5].split(':')

    function transferMysqlDateStringMonth(monthName) {
        switch (monthName) {
            case 'Jan':
                return '01'
            case 'Feb':
                return '02'          
            case 'Mar':
                return '03'
            case 'Apr':
                return '04'     
            case 'May':
                return '05'
            case 'Jun':
                return '06'     
            case 'Jul':
                return '07'
            case 'Aug':
                return '08'          
            case 'Sep':
                return '09'
            case 'Oct':
                return '10'     
            case 'Nov':
                return '11'
            case 'Dec':
                return '12'
        }                     
    }

    function transferMysqlDateStringDaytype(daytypeName) {
        switch (daytypeName) {
            case 'Mon':
                return '1'
            case 'Tue':
                return '2'          
            case 'Wed':
                return '3'
            case 'Thu':
                return '4'     
            case 'Fri':
                return '5'
            case 'Sat':
                return '6'     
            case 'Sun':
                return '7'
        }                     
    }

    // "Sat, 12 Jun 2021 00:00:00 GMT"

    dataStringObj['day'] = dateStringArray[1];
    dataStringObj['month'] = (monthShowInWord === false)? transferMysqlDateStringMonth(dateStringArray[2]): dateStringArray[2];
    dataStringObj['year'] = dateStringArray[3];
    dataStringObj['daytype'] = (daytypeShowinWord === false)? transferMysqlDateStringDaytype(dateStringArray[0]): dateStringArray[0];
    dataStringObj['hour'] = timeArray[0];
    dataStringObj['minute'] = timeArray[1];
    dataStringObj['second'] = timeArray[2];
    
    return dataStringObj                          
}

export default {
    getURL,
    removePx,
    addPx,
    dpnoneElemnet,
    undoDpnoneElemnet,
    vbhiddenElement,
    undoVbhiddenElement,
    getElementHeight,
    calcElementsHeight,
    cleanseQueryString,
    transferMysqlDateString
};
function getURL(path) {
    // protocal
    let protocal = 'http';
    // domain
    let localServer = '127.0.0.1:3000';
    let vsCodeliveServer = '127.0.0.1:5500';
    let EC2 = '18.136.117.43:3000';

    let domain = localServer;

    // for production
    return `${protocal}://${domain}${path}`

    // for development
    // return path
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

export default {
    getURL,
    removePx,
    addPx,
    dpnoneElemnet,
    undoDpnoneElemnet,
    vbhiddenElement,
    undoVbhiddenElement,
    getElementHeight,
    calcElementsHeight
};
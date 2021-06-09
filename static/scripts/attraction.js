import lib from './library.js'
import gen from './general.js'

const element = {
    attraction: {
        self: document.querySelector('.attraction'),
        carousel: {
            self: document.querySelector('.carousel'),
            chevronLeft: document.querySelector('.chevron-left'),
            chevronRight: document.querySelector('.chevron-right'),
            dotSelector: document.querySelector('.dot_selector'),
            imageList: [],
            dotList: [],
        },
        bookingForm: {
            self: document.querySelector('.bookingForm'),
            submitButton: document.querySelector('.buttonSet > button'),
            message: document.querySelector('.buttonSet > p'),
            inputRadio_morning: document.querySelector('.inputRadio_morning'),
            inputRadio_afternoon: document.querySelector('.inputRadio_afternoon'),
            touringFee: document.querySelector('.touringFee'),
            inputDate: document.querySelector('.inputDate'),
        },
        content: {
            name: document.querySelector('.attraction_name'),
            category: document.querySelector('.attraction_category'),
            description: document.querySelector('.attraction_description'),
            address: document.querySelector('.attraction_address'),
            transport: document.querySelector('.attraction_transport'),
            mrt: document.querySelector('.attraction_mrt'),
        }
    }
};
const model = {
    attraction: {
        getAttractionId: function() {},
        fetchAttractionData: function() {},
        postBookingData: function() {},
        carousel: {
            _accessImagesListSwitcher: function() {},
            accessImagesListSwitcher: function() {}
        }
    }
};

model.attraction.getAttractionId = function() {
    let srcAttractionId = location.pathname;
    let regExpAttractionId = /\/\d+$/;
    let attractionId = regExpAttractionId.exec(srcAttractionId)[0].split('\/')[1];

    return attractionId
}

model.attraction.fetchAttractionData = async function() {
    let attractionId = model.attraction.getAttractionId();

    let initObj = {method: 'GET'};
    
    let response = await fetch(lib.getURL(`/api/attraction/${attractionId}`), initObj);
    let srcData = await response.json();

    return srcData
}
model.attraction.postBookingData = async function() {
    console.log('trigger postBookingData');
    let getDataTime = function() {
        if (element.attraction.bookingForm.inputRadio_morning.checked === true) {
            console.log('dataTime: ', element.attraction.bookingForm.inputRadio_morning.value)
            return element.attraction.bookingForm.inputRadio_morning.value
        }
        if (element.attraction.bookingForm.inputRadio_afternoon.checked === true) {
            console.log('dataTime: ', element.attraction.bookingForm.inputRadio_afternoon.value)
            return element.attraction.bookingForm.inputRadio_afternoon.value
        }
    };

    console.log('dataDate: ', element.attraction.bookingForm.inputDate.value)

    let data = {
        attractionId: model.attraction.getAttractionId(),
        date: element.attraction.bookingForm.inputDate.value,
        time: getDataTime(),
        price: element.attraction.bookingForm.touringFee.textContent,
    };
    // console.log(data);

    let initObj = {
        method: 'POST',
        headers: new Headers({
            'Content-Type': 'application/json',
        }),
        body: JSON.stringify(data),
    };
    let request = new Request(lib.getURL('/api/booking'), initObj);

    let srcResponse = await fetch(request);
    let response = await srcResponse.json();

    return response
}

model.attraction.carousel._accessImagesListSwitcher = function() {
    let currentImgId = 0;
    let imgAmount = null;

    let clsAccessImagesListSwitcher = function(command, amount) {
        // console.log('start - ', 'currentImgId: ', currentImgId, 'imgAmount: ', imgAmount);

        if (command === 'init') {
            imgAmount = amount;
            // console.log('imgAmount: ', imgAmount);
        }
    
        if (command === 'add') {
            if (currentImgId < (imgAmount - 1)) {
                currentImgId += 1;
            }
            else {
                console.log('when currentImgId = 6');
                currentImgId = 0;
                console.log('now currentImgId = ', currentImgId);
            }
            // console.log('imgAmount: ', imgAmount);
            // console.log('counter: ', counter);
        }
    
        if (command === 'sub') {
            if (currentImgId > 0) {
                currentImgId -= 1;
            }
            else {
                currentImgId = (imgAmount - 1);
            }
            // console.log('imgAmount: ', imgAmount);
            // console.log('counter: ', counter);
        }   
        
        // console.log('end - ', 'currentImgId: ', currentImgId, 'imgAmount: ', imgAmount);
        let returnElement = {
            img: element.attraction.carousel.imageList[currentImgId],
            dot: element.attraction.carousel.dotList[currentImgId],
        }
        console.log(returnElement['img'], returnElement['dot']);
        
        return returnElement
    }
    return clsAccessImagesListSwitcher
}

model.attraction.carousel.accessImagesListSwitcher = model.attraction.carousel._accessImagesListSwitcher() ;

const view = {
    attraction: {
        renderComponent: function() {},
        carousel: {
            displayNextImage: function() {},
            displayLastImage: function() {},
        },
        bookingForm: {
            switchTouringFee: function() {},
        },
    }
};

view.attraction.renderComponent = function(data) {
    // contents
    element.attraction.content.name.textContent = data['name'];
    element.attraction.content.category.textContent = data['category'];
    element.attraction.content.description.textContent = data['description'];
    element.attraction.content.address.textContent = data['address'];
    element.attraction.content.transport.textContent = data['transport'];
    element.attraction.content.mrt.textContent = data['mrt'];

    // images
    for (let i = 0; i < data['images'].length; i++) {
        let img = document.createElement('img');
        img.setAttribute('src', data['images'][i]);
        img.classList.add('transitionVisibilityProp');
        let dot = document.createElement('div');
        dot.classList.add('dot');
        if (i === 0) {
            dot.classList.add('dot_selected');
            element.attraction.carousel.dotSelector.appendChild(dot);
        }
        else {
            img.classList.add('vb-hidden');
        }
        element.attraction.carousel.self.appendChild(img);
        let imgElement = document.querySelectorAll('.carousel > img')[i];
        element.attraction.carousel.imageList.push(imgElement);
        // console.log('imgElement: ', imgElement);

        element.attraction.carousel.dotSelector.appendChild(dot);
        // console.log(document.querySelectorAll('.dot_selector > .dot'));
        let dotElement = document.querySelectorAll('.dot_selector > .dot')[i];
        element.attraction.carousel.dotList.push(dotElement);
        
    }
    // console.log(element.attraction.carousel.imageList);
    // console.log(element.attraction.carousel.dotList);
}
view.attraction.carousel.displayNextImage = async function() {
    console.log('trigger displayNextImage');
    // console.log('imageList', element.attraction.carousel.imageList);
    // console.log(document.querySelector('.carousel > img'));
    let currentElement = model.attraction.carousel.accessImagesListSwitcher();
    // console.log(currentElement['img'], currentElement['dot']);
    let nextElement = model.attraction.carousel.accessImagesListSwitcher('add');
    // console.log(nextElement['img'], nextElement['dot']);

    let currentImg = currentElement['img'];
    let nextImg = nextElement['img'];    
    let currentDot = currentElement['dot'];
    let nextDot = nextElement['dot'];
    // console.log(currentImg, currentDot);
    // console.log(nextImg, nextDot);

    currentImg.classList.add('zidx-negativeOne');
    currentDot.classList.remove('dot_selected');
    nextDot.classList.add('dot_selected');
    nextImg.classList.remove('vb-hidden');
    currentImg.classList.add('vb-hidden');
    currentImg.classList.remove('zidx-negativeOne');
}

view.attraction.carousel.displayLastImage = function() {
    console.log('trigger displayLastImage');
    let currentElement = model.attraction.carousel.accessImagesListSwitcher();
    let lastElement = model.attraction.carousel.accessImagesListSwitcher('sub');

    let currentImg = currentElement['img'];
    let lastImg = lastElement['img'];
    let currentDot = currentElement['dot'];
    let lastDot = lastElement['dot'];
    
    currentImg.classList.add('zidx-negativeOne');
    currentDot.classList.remove('dot_selected');
    lastDot.classList.add('dot_selected');
    lastImg.classList.remove('vb-hidden');
    currentImg.classList.add('vb-hidden');  
    currentImg.classList.add('zidx-negativeOne');  
}

view.attraction.bookingForm.switchTouringFee = function(eventTarget) {
    if (eventTarget === element.attraction.bookingForm.inputRadio_morning) {
        element.attraction.bookingForm.touringFee.textContent = 2000;
    }
    if (eventTarget === element.attraction.bookingForm.inputRadio_afternoon) {
        element.attraction.bookingForm.touringFee.textContent = 2500;
    }
}

const controller = {
    attraction: {
        initComponent: async function() {
            let attractionSrcData = await model.attraction.fetchAttractionData()
            let attractionData = attractionSrcData['data'];
            view.attraction.renderComponent(attractionData);
            
            // carousel
            // init carousel imagesCounter
            model.attraction.carousel.accessImagesListSwitcher('init', attractionData['images'].length);
            element.attraction.carousel.chevronRight.addEventListener('click', function() {
                view.attraction.carousel.displayNextImage();
            })
            element.attraction.carousel.chevronLeft.addEventListener('click', function() {
                view.attraction.carousel.displayLastImage();
            })

            // bookingForm
            // touringFee
            element.attraction.bookingForm.inputRadio_morning.addEventListener('click', function(event) {
                console.log('trigger morning');
                view.attraction.bookingForm.switchTouringFee(event.target);
            })
            element.attraction.bookingForm.inputRadio_afternoon.addEventListener('click', function(event) {
                console.log('trigger afternoon');
                view.attraction.bookingForm.switchTouringFee(event.target);
            })     
            element.attraction.bookingForm.submitButton.addEventListener('click', async function(event) {
                console.log('trigger submitButton event');
                event.preventDefault();
                let result = await model.attraction.postBookingData();
                console.log(result);

                if (result.ok === true) {
                    window.location = lib.getURL('/booking');
                }
                
                if (result.error === true){
                    element.attraction.bookingForm.message.textContent = result.message;
                    element.attraction.bookingForm.message.classList.add('errorMessage');
                    element.attraction.bookingForm.message.classList.remove('vb-hidden');
                    
                    // 點選頁面即消除 errorMessage
                    window.addEventListener('click', function() {
                        element.attraction.bookingForm.message.classList.remove('vb-hidden');    
                        element.attraction.bookingForm.message.textContent = "";
                        element.attraction.bookingForm.message.classList.remove('errorMessage');
                    }, {once: true})
                }
            });
        }
    }
};

window.addEventListener('load', async function() {
    await gen.exportFunc.initGeneral();
    controller.attraction.initComponent();
})





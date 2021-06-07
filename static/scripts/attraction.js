import lib from './library.js'

const element = {
    attraction: {
        self: document.querySelector('.attraction'),
        carousel: {
            self: document.querySelector('.carousel'),
            chevronLeft: document.querySelector('.chevron-left'),
            chevronRight: document.querySelector('.chevron-right'),
            dotSelector: document.querySelector('.dot_selector'),
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
        postBookingData: function() {}
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

const view = {
    attraction: {
        renderComponent: function() {},
        carousel: {
            showNextImage: function() {},
            showLastImage: function() {},
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
        let dot = document.createElement('div');
        dot.classList.add('dot');
        if (i === 0) {
            dot.classList.add('dot_selected');
            element.attraction.carousel.dotSelector.appendChild(dot);
        }
        else {
            img.classList.add('dp-none');
        }
        element.attraction.carousel.self.appendChild(img);
        element.attraction.carousel.dotSelector.appendChild(dot);
    }
}
view.attraction.carousel.showNextImage = function() {

}
view.attraction.carousel.showLastImage = function() {

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
            element.attraction.carousel.chevronRight.addEventListener('click', function() {
                view.attraction.carousel.showNextImage();
            })
            element.attraction.carousel.chevronLeft.addEventListener('click', function() {
                view.attraction.carousel.showLastImage();
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

window.addEventListener('load', function() {
    controller.attraction.initComponent();
})





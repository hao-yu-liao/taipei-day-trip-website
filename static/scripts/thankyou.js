import lib from "./library.js"
import gen from "./general.js"

const element = {
    section_thankyou: {
        self: document.querySelector('.section_thankyou'),
    }
}

const model = {
    section_thankyou: {
        fetchOrderData: function() {},
    }
}

model.section_thankyou.fetchOrderData = async function() {
    let queryString = window.location.search;
    let orderNumber = lib.cleanseQueryString(queryString).number;
    console.log('orderNumber: ', orderNumber);

    let response = await fetch(lib.getURL(`/api/order/${orderNumber}`));
    // let data = await response.json()['data'];

    let json = await response.json();
    console.log('json of fetchOrderData: ', json);

    let returnPromise = new Promise(function(resolve, reject) {
        resolve(json);
    });

    return returnPromise
}

const view = {
    section_thankyou: {
        generateComponent: function() {},
    }
}

view.section_thankyou.generateComponent = function(response) {
    console.log('response in section_thankyou.generateComponent: ', response);
    if (!(response['error'])) {
        // 有成功登入
        document.querySelector('.welcomingMessageGen').classList.add('dp-none');
        document.querySelector('.welcomingMessageSpec').classList.remove('dp-none');
        document.querySelector('.welcomingMessageSpec > span').textContent = gen.exportFunc.getSignInData().name;

        let fetchOrderData = response['data'];
       //  console.log('fetchOrderData: ', fetchOrderData);
        
        if (fetchOrderData !== null) {
            // console.log(true);

            let welcomingMessageContent = document.querySelector('.welcomingMessageContent');
            welcomingMessageContent.textContent = '感謝您的支持，您預訂的行程已成功付款，請於預訂日期前三天留意領隊來電，並祝福您有一段順心的旅程！';

            // let ThankyouCardsArray = [];

            let ThankyouCards = document.createElement('div');
            ThankyouCards.classList.add('vb-hidden');

            /*
            function foldCardDetailsNotFirst() {
                document.querySelector('.section_unpaidBooking > div > :first-child > .ThankyouCard_details').classList.remove('dp-none');
                let cardDetailsArrayNotFirst = document.querySelectorAll('.section_unpaidBooking > div > :not(:first-child) > .ThankyouCard_details');
                for (let i = 0; i < cardDetailsArrayNotFirst.length; i++) {
                    cardDetailsArrayNotFirst[i].classList.add('dp-none');
                }
            }
            */

            function createThankyouCard() {
                let ThankyouCard = document.createElement('div');
                ThankyouCard.classList.add('ThankyouCard');
    
                    let ThankyouCard_info = document.createElement('div');
                    ThankyouCard_info.classList.add('ThankyouCard_info');
                    
                        let ThankyouCard_info_div = document.createElement('div');
    
                            let info_div_img = document.createElement('img');
                            info_div_img.setAttribute('src', fetchOrderData['trip']['attraction']['image']);
    
                            function  generateElement_info_div_div() {
                                let info_div_div = document.createElement('div');
                                    let info_div_div_divTitle = document.createElement('div');
                                        let info_div_div_divTitle_p_name = document.createElement('p');
                                        info_div_div_divTitle_p_name.classList.add('body');
                                        info_div_div_divTitle_p_name.classList.add('bold');
                                        info_div_div_divTitle_p_name.textContent = '台北一日遊：';
                                            let info_div_div_divTitle_p_name_span = document.createElement('span');
                                            // info_div_div_divTitle_p_name_span.classList.add('body');
                                            info_div_div_divTitle_p_name_span.textContent = fetchOrderData['trip']['attraction']['name'];
                                            info_div_div_divTitle_p_name.appendChild(info_div_div_divTitle_p_name_span);

                                        let info_div_div_divTitle_p_number  = document.createElement('p');
                                        info_div_div_divTitle_p_number.classList.add('body');
                                        info_div_div_divTitle_p_number.classList.add('bold');
                                        info_div_div_divTitle_p_number.textContent = '訂單編號：';
                                            let info_div_div_divTitle_p_number_span = document.createElement('span');
                                            // info_div_div_divTitle_p_name_span.classList.add('body');
                                            info_div_div_divTitle_p_number_span.textContent = fetchOrderData['number'];
                                            info_div_div_divTitle_p_number.appendChild(info_div_div_divTitle_p_number_span);

                                        info_div_div_divTitle.appendChild(info_div_div_divTitle_p_name);
                                        info_div_div_divTitle.appendChild(info_div_div_divTitle_p_number);
                                    
                                    let info_div_div_p_date = document.createElement('p');
                                    info_div_div_p_date.classList.add('body');
                                    info_div_div_p_date.textContent = '日期：';
                                        console.log("fetchOrderData['date']: ", fetchOrderData['trip']['date']);
                                        let dateStringObj = lib.transferMysqlDateString(fetchOrderData['trip']['date']);
                                        let info_div_div_p_date_span = document.createElement('span');
                                        info_div_div_p_date_span.classList.add('body');
                                        info_div_div_p_date_span.textContent = `${dateStringObj['year']}-${dateStringObj['month']}-${dateStringObj['day']}`;
                                        info_div_div_p_date.appendChild(info_div_div_p_date_span);

                                    let info_div_div_p_time = document.createElement('p');
                                    info_div_div_p_time.classList.add('body');
                                    info_div_div_p_time.textContent = '時間：';
                                        function getBookingDataTimeWording(bookingDataTime) {
                                            if (bookingDataTime === "morning") {
                                                return '早上 9 點到下午 12 點'
                                            }
                                            if (bookingDataTime === "afternoon") {
                                                return '下午 1 點到下午 4 點'
                                            }
                                        }
                                        let info_div_div_p_time_span = document.createElement('span'); 
                                        info_div_div_p_time_span.textContent = getBookingDataTimeWording(fetchOrderData['trip']['time']);
                                        info_div_div_p_time_span.classList.add('body');
                                        info_div_div_p_time.appendChild(info_div_div_p_time_span);
                                        
                                    let info_div_div_p_price = document.createElement('p');
                                    info_div_div_p_price.classList.add('body');
                                    info_div_div_p_price.textContent = '費用：';
                                        let info_div_div_p_price_span = document.createElement('span');
                                        info_div_div_p_price_span.classList.add('body');
                                        info_div_div_p_price_span.textContent = `新台幣 ${fetchOrderData['price']} 元`; 
                                        info_div_div_p_price.appendChild(info_div_div_p_price_span);   
    
                                    let info_div_div_p_address = document.createElement('p');
                                    info_div_div_p_address.classList.add('body');
                                    info_div_div_p_address.textContent = '地點：';
                                        let info_div_div_p_address_span = document.createElement('span');
                                        info_div_div_p_address_span.classList.add('body');
                                        info_div_div_p_address_span.textContent = fetchOrderData['trip']['attraction']['address'];
                                        info_div_div_p_address.appendChild(info_div_div_p_address_span);
    
                                info_div_div.appendChild(info_div_div_divTitle);
                                info_div_div.appendChild(info_div_div_p_date);
                                info_div_div.appendChild(info_div_div_p_time);
                                info_div_div.appendChild(info_div_div_p_price);
                                info_div_div.appendChild(info_div_div_p_address); 
                                
                                return info_div_div
                            };
                            let info_div_div = generateElement_info_div_div();
                            ThankyouCard_info_div.appendChild(info_div_img);
                            ThankyouCard_info_div.appendChild(info_div_div);
                        
                        ThankyouCard_info.appendChild(ThankyouCard_info_div);
    
                ThankyouCard.appendChild(ThankyouCard_info);
                ThankyouCard.orderNumber = fetchOrderData.number;

                return ThankyouCard
            }

            let ThankyouCard = createThankyouCard();
            ThankyouCards.appendChild(ThankyouCard);

            // ThankyouCardsArray.push(ThankyouCard);
            
            console.log('element.section_thankyou.self: ', element.section_thankyou.self);
            element.section_thankyou.self.appendChild(ThankyouCards);
            //  element.section_thankyou.ThankyouCards.array = ThankyouCardsArray;
            // foldCardDetailsNotFirst();
            ThankyouCards.classList.remove('vb-hidden');
        }
        else {
            // console.log(false);

            let welcomingMessageContent = document.querySelector('.welcomingMessageContent');
            let textnode_1 = document.createTextNode('您沒有編號為');
            
            let span_orderNumber = document.createElement('span');
            span_orderNumber.classList.add('button');
            span_orderNumber.classList.add('bold');
            span_orderNumber.classList.add('span_orderNumber');

            let queryString = window.location.search;
            let orderNumber = lib.cleanseQueryString(queryString).number;
            // console.log('orderNumber: ', orderNumber);            
            span_orderNumber.textContent = orderNumber;

            let textnode_2 = document.createTextNode('的訂單，請再次確認欲查詢的訂單編號');

            welcomingMessageContent.appendChild(textnode_1);
            welcomingMessageContent.appendChild(span_orderNumber);
            welcomingMessageContent.appendChild(textnode_2);
        }
    }

    else {
        // console.log('沒有登入');
        document.querySelector('.welcomingMessageSpec').classList.add('dp-none');
        document.querySelector('.welcomingMessageGen').classList.remove('dp-none');
    }
}

const controller = {
    section_thankyou: {
        initComponent: function() {},
    }
}

controller.section_thankyou.initComponent = async function() {
    let signInData = gen.exportFunc.getSignInData();
    let response = await model.section_thankyou.fetchOrderData();
    // console.log('fetchOrderData: ', fetchOrderData);
    view.section_thankyou.generateComponent(response);
}

window.addEventListener('load', async function() {
    await gen.exportFunc.initGeneral();
    controller.section_thankyou.initComponent();
});
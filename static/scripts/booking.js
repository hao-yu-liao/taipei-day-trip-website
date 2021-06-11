// 若 UnpaidBookingCard_details 顯示
// UnpaidBookingCard_button_fold 增加 style="transform: rotate(0.5turn);"，讓箭頭指向上方 

import lib from "./library.js"
import gen from "./general.js"

const element = {
    section_unpaidBooking: {
        self: document.querySelector('.section_unpaidBooking'),
        unpaidBookingCards: {
            self: document.querySelector('.section_unpaidBooking > div'),
            array: [],
        }
    },
    section_paidBooking: {
        paidBookingCard: {

        }
    }
}

const model = {
    section_unpaidBooking: {
        fetchBookingData: function() {},
        fetchDeleteBooking: function() {},
        fetchPostOrder: function() {},
        cleanseBookingDataDate: function() {},
        initTPDirect: function() {},
        data: {
            unpaidBookingCardsId: [],
        },
        _fetchPostOrderMaterial: null,
    },
    section_paidBooking: {}
}

model.section_unpaidBooking.fetchBookingData = async function() {
    let response = await fetch(lib.getURL('/api/booking'));
    // let data = await response.json()['data'];

    let json = await response.json();
    // console.log('json of fetchBookingData: ', json);
    /*
    let data = json['data'];
    console.log('data of fetchBookingData: ', data);
    */

    let returnPromise = new Promise(function(resolve, reject) {
        resolve(json);
    });

    return returnPromise
}

model.section_unpaidBooking.fetchDeleteBooking = async function(bookingId) {
    let initObj = {
        method: 'DELETE',
        headers: new Headers({
            'Content-Type': 'application/json',
        })
    };
    let srcResponse = await fetch(lib.getURL(`/api/booking/${bookingId}`), initObj);
    let response = await srcResponse.json();

    let returnPromise = new Promise(function(resolve, reject) {
        if (response['ok']) {
            resolve(true)
        }

        if (response['error']) {
            resolve(false)
        }
    });

    return returnPromise
}

model.section_unpaidBooking.fetchPostOrder = async function() {
    let returnPromise = new Promise(function(resolve, reject) {
        TPDirect.card.getPrime(async (result) => {
            if (result.status === 0) {
                let tappayPrime = result.card.prime;
                // console.log('result.card.prime: ', tappayPrime);
        
                model.section_unpaidBooking._fetchPostOrderMaterial.prime = tappayPrime;
                // console.log('model.section_unpaidBooking._fetchPostOrderMaterial: ', model.section_unpaidBooking._fetchPostOrderMaterial);  
    
                let requestHeaders = new Headers({
                    'Content-Type': 'application/json',
                });
                let requestBody = model.section_unpaidBooking._fetchPostOrderMaterial;
                // console.log('requestBody: ', requestBody);
                let initObj = {
                    method: 'POST',
                    headers: requestHeaders,
                    body: JSON.stringify(requestBody),
                };
                let srcResponse = await fetch(lib.getURL('/api/orders'), initObj);
                let response = await srcResponse.json();
                console.log('response of POST /api/booking', response);

                model.section_unpaidBooking._fetchPostOrderMaterial = null;

                resolve(response);
            }
            else {
                console.log('error message of getting  tappay prime: ', result.msg);
                resolve(result.msg);
            }
        })
    });  

    return returnPromise
}

model.section_unpaidBooking.initTPDirect = function() {
    // setup SDK
    let _APPKEY_ = 'app_aZCYMha5Pc1ywLOxmUgD3O1g3i90rnEx7DFMqwf1QGpEZgpRvF96fFMC2h8i';
    TPDirect.setupSDK(20704, _APPKEY_, 'sandbox');

    // setup card
    // Display ccv field
    let fields = {
        number: {
            element: '#card-number',
            placeholder: '**** **** **** ****'
        },
        expirationDate: {
            element: document.getElementById('card-expiration-date'),
            placeholder: 'MM / YY'
        },
        ccv: {
            element: '#card-ccv',
            placeholder: 'ccv'
        }
    }

    let argument = {
        fields: fields,
        styles: {
            'input': {
                'color': 'black',
                'font-family': 'Noto Sans TC',
                'font-style': 'normal',
                'font-size': '16px',
                'line-height': '21px',
                'font-weight': 'normal',
            },
            ':focus': {
                'color': 'black'
            },
            '.valid': {
                'color': 'green'
            },
            '.invalid': {
                'color': 'red'
            },
            '@media screen and (max-width: 400px)': {
                'input': {
                    'color': 'orange'
                }
            }
        }
    };

    console.log('TPDirect.card.setup argument: ', argument)
    TPDirect.card.setup(argument);
}

const view = {
    section_unpaidBooking: {
        welcomingMessage: {
            renderComponent: function() {},
        },
        content: {
            generateComponent: function() {},
            patchComponent: function() {},
        }
    },
    section_paidBooking: {}
}

view.section_unpaidBooking.content.generateComponent = function(response) {
    console.log('response in content.generateComponent: ', response);
    if (!(response['error'])) {
        // 有成功登入
        document.querySelector('.welcomingMessageGen').classList.add('dp-none');
        document.querySelector('.welcomingMessageSpec').classList.remove('dp-none');
        document.querySelector('.welcomingMessageSpec > span').textContent = gen.exportFunc.getSignInData().name;

        let bookingDataArray = response['data'];
        // console.log('bookingDataArray: ', bookingDataArray);
        console.log('bookingDataArray.length: ', bookingDataArray.length);
        
        if (bookingDataArray.length !== 0) {
            console.log(true);

            let UnpaidBookingCardsArray = [];

            let UnpaidBookingCards = document.createElement('div');
            UnpaidBookingCards.classList.add('vb-hidden');

            function foldCardDetailsNotFirst() {
                document.querySelector('.section_unpaidBooking > div > :first-child > .UnpaidBookingCard_details').classList.remove('dp-none');
                let cardDetailsArrayNotFirst = document.querySelectorAll('.section_unpaidBooking > div > :not(:first-child) > .UnpaidBookingCard_details');
                for (let i = 0; i < cardDetailsArrayNotFirst.length; i++) {
                    cardDetailsArrayNotFirst[i].classList.add('dp-none');
                }
            }

            for (let i = 0; i < bookingDataArray.length; i++) {
                // generate a unpaidBookingCard
                // 除了第一個 card，其他的 details 都要 dp-none
                // console.log('bookingData: ', bookingDataArray[i]);
                let UnpaidBookingCard_button_delete = null;
                let UnpaidBookingCard_button_fold = null;
                let UnpaidBookingCard_details = null;
                let contact_label_phone_input = null;

                function createUnpaidBookingCard() {
                    let UnpaidBookingCard = document.createElement('div');
                    UnpaidBookingCard.classList.add('UnpaidBookingCard');
        
                        let UnpaidBookingCard_info = document.createElement('div');
                        UnpaidBookingCard_info.classList.add('UnpaidBookingCard_info');
                        
                            let UnpaidBookingCard_info_div = document.createElement('div');
        
                                let info_div_img = document.createElement('img');
                                info_div_img.setAttribute('src', bookingDataArray[i]['attraction']['image']);
        
                                function  generateElement_info_div_div() {
                                    let info_div_div = document.createElement('div');
                                        let info_div_div_p_name = document.createElement('p');
                                        info_div_div_p_name.classList.add('body');
                                        info_div_div_p_name.classList.add('bold');
                                        info_div_div_p_name.textContent = '台北一日遊：';
                                            let info_div_div_p_name_span = document.createElement('span');
                                            // info_div_div_p_name_span.classList.add('body');
                                            info_div_div_p_name_span.textContent = bookingDataArray[i]['attraction']['name'];
                                            info_div_div_p_name.appendChild(info_div_div_p_name_span);
                                        
                                        let info_div_div_p_date = document.createElement('p');
                                        info_div_div_p_date.classList.add('body');
                                        info_div_div_p_date.textContent = '日期：';
                                            let dateStringObj = lib.transferMysqlDateString(bookingDataArray[i]['date']);
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
                                            info_div_div_p_time_span.textContent = getBookingDataTimeWording(bookingDataArray[i]['time']);
                                            info_div_div_p_time_span.classList.add('body');
                                            info_div_div_p_time.appendChild(info_div_div_p_time_span);
                                            
                                        let info_div_div_p_price = document.createElement('p');
                                        info_div_div_p_price.classList.add('body');
                                        info_div_div_p_price.textContent = '費用：';
                                            let info_div_div_p_price_span = document.createElement('span');
                                            info_div_div_p_price_span.classList.add('body');
                                            info_div_div_p_price_span.textContent = `新台幣 ${bookingDataArray[i]['price']} 元`; 
                                            info_div_div_p_price.appendChild(info_div_div_p_price_span);   
        
                                        let info_div_div_p_address = document.createElement('p');
                                        info_div_div_p_address.classList.add('body');
                                        info_div_div_p_address.textContent = '地點：';
                                            let info_div_div_p_address_span = document.createElement('span');
                                            info_div_div_p_address_span.classList.add('body');
                                            info_div_div_p_address_span.textContent = bookingDataArray[i]['attraction']['address'];
                                            info_div_div_p_address.appendChild(info_div_div_p_address_span);
        
                                    info_div_div.appendChild(info_div_div_p_name);
                                    info_div_div.appendChild(info_div_div_p_date);
                                    info_div_div.appendChild(info_div_div_p_time);
                                    info_div_div.appendChild(info_div_div_p_price);
                                    info_div_div.appendChild(info_div_div_p_address); 
                                    
                                    return info_div_div
                                };
                                let info_div_div = generateElement_info_div_div();
                                UnpaidBookingCard_info_div.appendChild(info_div_img);
                                UnpaidBookingCard_info_div.appendChild(info_div_div);
        
                            UnpaidBookingCard_button_delete = document.createElement('button');
                            UnpaidBookingCard_button_delete.classList.add('UnpaidBookingCard_button_delete');
                            UnpaidBookingCard_button_fold = document.createElement('button');
                            UnpaidBookingCard_button_fold.classList.add('UnpaidBookingCard_button_fold');
                            
                            UnpaidBookingCard_info.appendChild(UnpaidBookingCard_info_div);
                            UnpaidBookingCard_info.appendChild(UnpaidBookingCard_button_delete);
                            UnpaidBookingCard_info.appendChild(UnpaidBookingCard_button_fold);
        
                        UnpaidBookingCard_details = document.createElement('form');
                        UnpaidBookingCard_details.classList.add('UnpaidBookingCard_details');
    
                            let UnpaidBookingCard_details_block_contact = document.createElement('div');
                            UnpaidBookingCard_details_block_contact.classList.add('UnpaidBookingCard_details_block');
                            
                                let contact_p_1 = document.createElement('p');
                                contact_p_1.classList.add('button');
                                contact_p_1.classList.add('bold');
                                contact_p_1.textContent = '您的聯絡資訊';
        
                                function createTextInput() {
                                    let input = document.createElement('input');
                                    input.classList.add('body');
                                    input.setAttribute('type', 'text');
        
                                    return input
                                }
        
                                let contact_label_name = document.createElement('label');
                                contact_label_name.classList.add('body');
                                contact_label_name.textContent = '聯絡姓名：'
                                    let contact_label_name_input = createTextInput();
                                    contact_label_name_input.value = gen.exportFunc.getSignInData().name;
                                    contact_label_name.appendChild(contact_label_name_input);
        
                                let contact_label_email = document.createElement('label');
                                contact_label_email.classList.add('body');
                                contact_label_email.textContent = '聯絡信箱：'
                                    let contact_label_email_input = createTextInput();
                                    contact_label_email_input.value = gen.exportFunc.getSignInData().email;
                                    contact_label_email.appendChild(contact_label_email_input);
        
                                let contact_label_phone = document.createElement('label');
                                contact_label_phone.classList.add('body');
                                contact_label_phone.textContent = '手機號碼：'
                                    contact_label_phone_input = createTextInput();
                                    contact_label_phone_input.value = '0912345678';
                                    contact_label_phone.appendChild(contact_label_phone_input);
        
                                let contact_p_2 = document.createElement('p');
                                contact_p_2.classList.add('button');
                                contact_p_2.classList.add('body');
                                contact_p_2.textContent = '請保持手機暢通，準時到達，導覽人員將用手機與您聯繫，務必留下正確的聯絡方式。';
        
                                UnpaidBookingCard_details_block_contact.appendChild(contact_p_1);
                                UnpaidBookingCard_details_block_contact.appendChild(contact_label_name);
                                UnpaidBookingCard_details_block_contact.appendChild(contact_label_email);
                                UnpaidBookingCard_details_block_contact.appendChild(contact_label_phone);
                                UnpaidBookingCard_details_block_contact.appendChild(contact_p_2);
        
                            let UnpaidBookingCard_details_block_payment = document.createElement('div');
                            UnpaidBookingCard_details_block_payment.classList.add('UnpaidBookingCard_details_block');

                                let payment_p_1 = document.createElement('p');
                                payment_p_1.classList.add('button');
                                payment_p_1.classList.add('bold');
                                payment_p_1.textContent = '信用卡付款資訊';

                                let payment_label_cardNumber = document.createElement('label');
                                payment_label_cardNumber.classList.add('body');
                                payment_label_cardNumber.textContent = '卡片號碼：';
                                    let payment_tpfield_cardNumber = document.createElement('div');
                                    payment_tpfield_cardNumber.classList.add('tpfield');
                                    payment_tpfield_cardNumber.setAttribute('id', 'card-number');
                                    payment_label_cardNumber.appendChild(payment_tpfield_cardNumber);

                                let payment_label_cardExpirationDate = document.createElement('label');
                                payment_label_cardExpirationDate.classList.add('body');
                                payment_label_cardExpirationDate.textContent = '過期時間：';
                                    let payment_tpfield_cardExpirationDate = document.createElement('div');
                                    payment_tpfield_cardExpirationDate.classList.add('tpfield');
                                    payment_tpfield_cardExpirationDate.setAttribute('id', 'card-expiration-date');
                                    payment_label_cardExpirationDate.appendChild(payment_tpfield_cardExpirationDate);


                                let payment_label_cardCcv = document.createElement('label');
                                payment_label_cardCcv.classList.add('body');
                                payment_label_cardCcv.textContent = '驗證密碼：';
                                    let payment_tpfield_cardCcv = document.createElement('div');
                                    payment_tpfield_cardCcv.classList.add('tpfield');
                                    payment_tpfield_cardCcv.setAttribute('id', 'card-ccv');
                                    payment_label_cardCcv.appendChild(payment_tpfield_cardCcv);

                                UnpaidBookingCard_details_block_payment.appendChild(payment_p_1);
                                UnpaidBookingCard_details_block_payment.appendChild(payment_label_cardNumber);
                                UnpaidBookingCard_details_block_payment.appendChild(payment_label_cardExpirationDate);
                                UnpaidBookingCard_details_block_payment.appendChild(payment_label_cardCcv);
                            
                            let UnpaidBookingCard_details_buttonSet = document.createElement('div');
                            UnpaidBookingCard_details_buttonSet.classList.add('UnpaidBookingCard_details_buttonSet');
                                let UnpaidBookingCard_details_buttonSet_p = document.createElement('p');
                                UnpaidBookingCard_details_buttonSet_p.classList.add('body');
                                UnpaidBookingCard_details_buttonSet_p.classList.add('bold');
                                UnpaidBookingCard_details_buttonSet_p.textContent = `總價：新台幣 ${bookingDataArray[i]['price']} 元`;
                                
                                let UnpaidBookingCard_details_buttonSet_button = document.createElement('button');
                                UnpaidBookingCard_details_buttonSet_button.setAttribute('type', 'submit');
                                UnpaidBookingCard_details_buttonSet_button.textContent = '確認訂購並付款';

                                UnpaidBookingCard_details_buttonSet.appendChild(UnpaidBookingCard_details_buttonSet_p);
                                UnpaidBookingCard_details_buttonSet.appendChild(UnpaidBookingCard_details_buttonSet_button);
        
                            UnpaidBookingCard_details.appendChild(UnpaidBookingCard_details_block_contact);
                            UnpaidBookingCard_details.appendChild(UnpaidBookingCard_details_block_payment);
                            UnpaidBookingCard_details.appendChild(UnpaidBookingCard_details_buttonSet);
        
                    UnpaidBookingCard.appendChild(UnpaidBookingCard_info);
                    UnpaidBookingCard.appendChild(UnpaidBookingCard_details);

                    UnpaidBookingCard.bookingId = bookingDataArray[i].id;

                    return UnpaidBookingCard
                }

                let UnpaidBookingCard = createUnpaidBookingCard();
                UnpaidBookingCards.appendChild(UnpaidBookingCard);

                UnpaidBookingCard_button_delete.addEventListener('click', async function(event) {
                    // console.log('event.target: ', event.target);
                    // console.log('event.target.bookingId: ', event.target.bookingId);
                    console.log('UnpaidBookingCard.bookingId: ', UnpaidBookingCard.bookingId);
                    let result = await model.section_unpaidBooking.fetchDeleteBooking(UnpaidBookingCard.bookingId)
                    if (result) {
                        if (UnpaidBookingCard.parentNode) {
                            UnpaidBookingCard.parentNode.removeChild(UnpaidBookingCard);
                        }
                        window.location = window.location;
                    }
                    foldCardDetailsNotFirst();
                });
                
                UnpaidBookingCard_button_fold.addEventListener('click', function() {
                    console.log("if UnpaidBookingCard_details.classList.contains('dp-none'): ", UnpaidBookingCard_details.classList.contains('dp-none'));

                    if (UnpaidBookingCard_details.classList.contains('dp-none')) {
                        let element = document.querySelector('.UnpaidBookingCard_details:not(.dp-none)')
                        element.classList.add('dp-none');
                        UnpaidBookingCard_details.classList.remove('dp-none');
                        UnpaidBookingCard_button_fold.classList.add('upsideDown');
                    }


                    else {
                        UnpaidBookingCard_details.classList.add('dp-none');
                        UnpaidBookingCard_button_fold.classList.remove('upsideDown');
                    }
                });

                UnpaidBookingCard_details.addEventListener('submit', function(event) {
                    event.preventDefault();
                    console.log('trigger submit UnpaidBookingCard_details');

                    function checkCardDetailsForm() {
                        if (!(contact_label_phone_input.value)) {
                            return false
                        }

                        // 確認 tpfield
                        let tappayStatus = TPDirect.card.getTappayFieldsStatus();
                        console.log('tappayStatus: ', tappayStatus);
                        if (tappayStatus.canGetPrime === false) {
                            return false
                        }

                        return true
                    }

                    if (checkCardDetailsForm()) {
                        console.log('checkCardDetailsForm() is true');
                        let dateStringObj = lib.transferMysqlDateString(bookingDataArray[i]['date']);

                        model.section_unpaidBooking._fetchPostOrderMaterial = {
                            prime: null,
                            order: {
                                id: bookingDataArray[i].id,
                                price: bookingDataArray[i]['price'],
                                trip: {
                                    attraction: {
                                    id: bookingDataArray[i]['attraction']['id'],
                                    name: bookingDataArray[i]['attraction']['name'],
                                    address: bookingDataArray[i]['attraction']['address'],
                                    image: bookingDataArray[i]['attraction']['image']
                                    },
                                    date: `${dateStringObj['year']}-${dateStringObj['month']}-${dateStringObj['day']}`,
                                    time: bookingDataArray[i]['time']
                                },
                                contact: {
                                    name: gen.exportFunc.getSignInData().name,
                                    email: gen.exportFunc.getSignInData().email,
                                    phone: contact_label_phone_input.value,
                                },
                            }
                        }
                        controller.section_unpaidBooking.postOrder();
                    }
                    else {
                        // 若 cardDetailsForm 欄位填寫不正確
                        return
                    }
                });

                UnpaidBookingCardsArray.push(UnpaidBookingCard);
            }
            element.section_unpaidBooking.self.appendChild(UnpaidBookingCards);
            element.section_unpaidBooking.unpaidBookingCards.array = UnpaidBookingCardsArray;
            foldCardDetailsNotFirst();
            UnpaidBookingCards.classList.remove('vb-hidden');
        }
        else {
            console.log(false);

            let errorBookingMessage = document.createElement('p');
            errorBookingMessage.classList.add('errorBookingMessage');
            errorBookingMessage.classList.add('body');
            errorBookingMessage.textContent = '目前沒有任何待預訂的行程';

            element.section_unpaidBooking.self.appendChild(errorBookingMessage);
        }
    }

    else {
        // console.log('沒有登入');
        document.querySelector('.welcomingMessageSpec').classList.add('dp-none');
        document.querySelector('.welcomingMessageGen').classList.remove('dp-none');
        /*
        let welcomingMessageSpec = document.querySelector('.welcomingMessageSpec');
        if (welcomingMessageSpec) {
            document.querySelector('.welcomingMessageSpec').classList.add('dp-none');
        }
        let welcomingMessageGen = document.querySelector('.welcomingMessageGen');
        if (!(welcomingMessageGen)) {
        }
        */
    }
}

view.section_unpaidBooking.content.patchComponent = function() {
    if (true) {
        // 當顯示 unpaidBookingCards
        // 將 Booking 的 id 存在 array 中放在
            // model.section_unpaidBooking.data.unpaidBookingCardsId
        // 並取目前 HTML element 的 unpaidBookingCards 中的 child 的 id，即 unpaidBookingCard 的 id
            // element.section_unpaidBooking.content.unpaidBookingCards
        // 跟 model.section_unpaidBooking.data.unpaidBookingCardsId 不符者就刪除
    }
}

const controller = {
    section_unpaidBooking: {
        initComponent: function() {},
        setComponent: function() {},
        postOrder: function() {},
    },
    section_paidBooking: {}    
}

controller.section_unpaidBooking.initComponent = async function() {
    let signInData = gen.exportFunc.getSignInData();

    let response = await model.section_unpaidBooking.fetchBookingData();
    // console.log('bookingDataArray: ', bookingDataArray);
    view.section_unpaidBooking.content.generateComponent(response);

    // view.section_unpaidBooking.welcomingMessage.renderComponent()
    // view.section_unpaidBooking.content.generateComponent()
}

controller.section_unpaidBooking.setComponent = function() {
    // view.section_unpaidBooking.content.generateComponent()
}

controller.section_unpaidBooking.postOrder = async function() {
    let result = await model.section_unpaidBooking.fetchPostOrder();
    if (result['data']) {
        console.log("result['data']['number']: ", result['data']['number']);
        window.location = lib.getURL(`/thankyou?number=${result['data']['number']}`);
    }

    if (result['error']) {
        // 應顯示錯誤訊息
    }
}

window.addEventListener('load', async function() {
    await gen.exportFunc.initGeneral();
    await controller.section_unpaidBooking.initComponent();
    model.section_unpaidBooking.initTPDirect();
    // console.log('element.unpaidBookingCards.array: ', element.section_unpaidBooking.unpaidBookingCards.array);
});
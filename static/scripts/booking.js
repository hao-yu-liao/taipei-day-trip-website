// 若 UnpaidBookingCard_details 顯示
// UnpaidBookingCard_button_fold 增加 style="transform: rotate(0.5turn);"，讓箭頭指向上方 


const element = {
    section_unpaidBooking: {
        welcomingMessage: document.querySelector('.welcomingMessage'),
        content: {
            unpaidBookingCards: document.querySelector('.section_unpaidBooking > div'),
            emptyBookingMessage: document.querySelector('.emptyBookingMessage')
        },
        unpaidBookingCard: {
            info: {
                button_delete: document.querySelector('.UnpaidBookingCard_button_delete'),
                button_fold: document.querySelector('.UnpaidBookingCard_button_fold'),
            },
            details: document.querySelector('.UnpaidBookingCard_details'),
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
        data: {
            unpaidBookingCardsId: [],
        }
    },
    section_paidBooking: {}
}

model.section_unpaidBooking.fetchBookingData = function() {
    // fetch GET /api/booking
}

model.section_unpaidBooking.fetchDeleteBooking = function() {}

const view = {
    section_unpaidBooking: {
        welcomingMessage: {
            renderComponent: function() {},
        },
        content: {
            generateComponent: function() {},
            patchComponent: function() {},
        },
        unpaidBookingCard: {
            displayDetails: function() {},
        }
    },
    section_paidBooking: {}
}

view.section_unpaidBooking.content.generateComponent = function(fetchedBookingData) {
    if (fetchedBookingData['data'] !== null) {
        view.section_unpaidBooking
    }
    else {

    }

    // 切換 state，如果 GET /api/booking 有資料
        // 若有：element.section_unpaidBooking.content.unpaidBookingCards
        // 若沒有：element.section_unpaidBooking.content.emptyBookingMessage
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
        foldDetails: function() {},
        deleteBooking: function() {},
        postOrder: function() {},
    },
    section_paidBooking: {}    
}

controller.section_unpaidBooking.initComponent = async function() {
    let result = await model.section_unpaidBooking.fetchBookingData();
    view.section_unpaidBooking.content.generateComponent(result);

    // view.section_unpaidBooking.welcomingMessage.renderComponent()
    // view.section_unpaidBooking.content.generateComponent()
}

controller.section_unpaidBooking.setComponent = function() {
    // view.section_unpaidBooking.content.generateComponent()
}

controller.section_unpaidBooking.foldDetails = function() {
    element.section_unpaidBooking.unpaidBookingCard.info.button_fold.addEventListener('click', function() {
        view.section_unpaidBooking.unpaidBookingCard.displayDetails();
    })
}

controller.section_unpaidBooking.deleteBooking = function() {
    element.section_unpaidBooking.unpaidBookingCard.button_delete.addEventListener('click', async function() {
        let result = await model.section_unpaidBooking.fetchDeleteBooking();
        // 試試看用讓 fetchDeleteBooking 回傳 Promise 來將 fetch 程式碼寫在 fetchDeleteBooking
        if (result) {

        }
        else {

        }
    })
}

controller.section_unpaidBooking.postOrder = async function() {
    let result = await model.section_unpaidBooking.fetchPostOrder();
}

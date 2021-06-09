import lib from './library.js'

// let modal = document.createElement('div');
// modal.classList.add('dp-none');

const element = {
    nav: {
        anchor_signIn: document.querySelector('.c_nav > nav > a:last-child'),
        anchor_home: document.querySelector('.c_nav > nav > :first-child > a'),
        anchor_booking: document.querySelector('.c_nav > nav > .c_nav_anchor_booking')
    },
    modal_signIn: {
        self: document.getElementById('modal_signIn'),
        modalMask: document.querySelector('.modalMask'),
        form: document.getElementById('modal_signIn_form'),
        icon_close: document.querySelector('.icon_close'),
        title: document.querySelector('.modal_signIn > form > h3'),
        button: document.querySelector('.modal_signIn > form > :last-child > button'),
        message: document.getElementById('modal_signIn_message'),
        errorMessage: document.querySelector('.modal_signIn_errorMessage'),
        label_name: document.getElementById('modal_signIn_label_name'),
        input_name: document.getElementById('modal_signIn_input_name'),
        input_email: document.getElementById('modal_signIn_input_email'),
        input_password: document.getElementById('modal_signIn_input_password'),
    }
}

const model = {
    nav: {
        updateCurrentState: function() {},
        checkHasSignIn: function() {},
        currentState: null,
        hasSignIn: {
            name: 'hasSignIn',
            data: {
                anchorText_signIn: '登出帳戶',
                name: null,
                email: null,
            }
        },
        hasNotSignIn: {
            name: 'hasNotSignIn',
            data: {
                anchorText_signIn: '登入/註冊'
            }
        },
        child_modal_signIn: {
            fetchData: function() {}
        },
    },

    modal_signIn: {
        updateCurrentState: function() {},
        currentState: null,
        ifSignUp: {
            name: 'ifSignUp',
            data: {
                formHeight: null,
                titleText: "登入會員帳號",
                buttonText: "登入帳號",
                messageText: {
                    switch: "還沒有帳戶？點此註冊",
                    formError: ""
                }
            }
        },
        ifNotSignUp: {
            name: 'ifNotSignUp',
            data: {
                formHeight: "380px",
                titleText: "註冊會員帳號",
                buttonText: "註冊新帳戶",
                messageText: {
                    switch: "已經有帳戶了？點此登入",
                    formError: ""
                }
            },

        },
        getSomeElementHeight: function() {},
    }
};

model.nav.child_modal_signIn.fetchData = async function(currentState) {
    // console.log('email: ', element.modal_signIn.input_email.getAttribute('value'));
    if (currentState.name === 'ifSignUp') {
        try {
            let headers = {
                'Content-Type': 'application/json',
            };
            let body = JSON.stringify({
                email: element.modal_signIn.input_email.getAttribute('value'),
                password: element.modal_signIn.input_password.getAttribute('value')
            })
            let init = {
                method: 'PATCH',
                headers: headers,
                body: body
            }
            let response = await fetch('/api/user', init);
            let data = await response.json;
            console.log('data: ', data);
            return data            
        }
        catch {
            console.log('deal the error');
        }
    }

    if (currentState.name === 'ifNotSignUp') {
        try {
            let headers = {
                'Content-Type': 'application/json',
            };
            let body = JSON.stringify({
                name: element.modal_signIn.input_name.getAttribute('value'),
                email: element.modal_signIn.input_email.getAttribute('value'),
                password: element.modal_signIn.input_password.getAttribute('value')
            })
            let init = {
                method: 'POST',
                headers: headers,
                body: body
            }

            /*
            let srcResponse = await fetch(lib.getURL('/api/user'), init);
            */

            fetch(lib.getURL('/api/user'), init)
            .then(async function(srcResponse) {
                if (srcResponse.ok === true) {}
                else {
                    let response = await srcResponse.json();     
                    // console.log('response: ', response);
                    return response
                }
            })


            fetch(lib.getURL('/api/user'), init)
            .then(async function(srcResponse) {
                if (srcResponse.ok === true) {}
                else {
                    let response = await srcResponse.json();     
                    console.log('response: ', response);
                    return new Promise(function(resolve, reject) {
                        resolve(response);
                        reject();
                    })
               
                    /*
                    console.log('trial');
                    let response = await srcResponse.json();
                    throw new Error(JSON.stringify(response));
                    */
                }
            })
            .catch(function(error) {
                console.log('.catch: ', error);

            });

            /*
            let ifSrcResponseOk = srcResponse.ok;
            let response = await srcResponse.json;

            if (ifSrcResponseOk === true) {
                console.log("sucessfully fetch data")
                // 之後優化，多一個「成功登入」、「註冊成功」 modal
                // view.modal_signIn.displayComponent(false);
                // controller.nav.setComponent();
                return response
            }
            if (srcResponse.error === true) {
                console.log(srcResponse.error);
                throw new Error(JSON.stringify(response))
                // view.modal_signIn.renderComponentText('errorMessage', response.message);
            }
            */        
        }
        catch(error) {
            console.log('deal the error');
            console.log('error: ', JSON.parse(error.message));
            return JSON.parse(error.message)            
        }

        /*
        try {
            let headers = {
                'Content-Type': 'application/json',
            };
            let body = JSON.stringify({
                name: element.modal_signIn.input_name.getAttribute('value'),
                email: element.modal_signIn.input_email.getAttribute('value'),
                password: element.modal_signIn.input_password.getAttribute('value')
            })
            let init = {
                method: 'POST',
                headers: headers,
                body: body
            }
            let response = await fetch(lib.getURL('/api/user'), init)
            .error(function() {
                console.log('deal the error');                            
            });
            let data = await response.json;
            return data            
        }
        catch {
            console.log('deal the error');            
        }
        */
    }
}

model.nav.checkHasSignIn = async function() {
    // trial for not to fetch data
    // return model.modal_signIn.ifNotSignUp

    let returnPromise = new Promise(function(resolve, reject) {
        fetch(lib.getURL('/api/user'))
        .then((response) => (response.json()))
        .then((data) => {
            if (data["data"] !== null) {
                model.nav.currentState = model.nav.hasSignIn;
                model.nav.hasSignIn.data.name = data['data']['name'];
                model.nav.hasSignIn.data.email = data['data']['email']; 
                // console.log('trigger returnPromise true');
                resolve(true);
            }
    
            else {
                model.nav.currentState = model.nav.hasNotSignIn;
                // console.log('trigger returnPromise false');
                resolve(false);
            }
        })
    });

    return returnPromise
}
model.nav.updateCurrentState = function() {
    if (model.nav.currentState === model.nav.hasNotSignIn) {
        model.nav.currentState = model.nav.hasSignIn

        return model.nav.hasSignIn
    }

    if (model.nav.currentState === model.nav.hasSignIn) {
        model.nav.currentState = model.nav.hasNotSignIn

        return model.nav.hasNotSignIn
    }
}
model.modal_signIn.updateCurrentState = function() {
    if (model.modal_signIn.currentState === model.modal_signIn.ifNotSignUp) {
        model.modal_signIn.currentState = model.modal_signIn.ifSignUp

        return model.modal_signIn.ifSignUp
    }

    if (model.modal_signIn.currentState === model.modal_signIn.ifSignUp) {
        model.modal_signIn.currentState = model.modal_signIn.ifNotSignUp

        return model.modal_signIn.ifNotSignUp
    }
}
model.modal_signIn.ifSignUp.data.formHeight = lib.addPx(lib.removePx(model.modal_signIn.ifNotSignUp.data.formHeight) - lib.removePx(element.modal_signIn.input_name.offsetHeight));

const view = {
    nav: {
        renderComponent: function() {
            element.nav.anchor_signIn.textContent = model.nav.currentState.data.anchorText_signIn;
        },
        setAnchorURL: function() {
            element.nav.anchor_home.setAttribute('href', lib.getURL('/'));
            element.nav.anchor_booking.setAttribute('href', lib.getURL('/booking'));
        }
    },
    modal_signIn: {
        renderComponentLayout: function() {
            if (model.modal_signIn.currentState === model.modal_signIn.ifSignUp) {
                element.modal_signIn.label_name.classList.add('vb-hidden');
                element.modal_signIn.form.style.height = model.modal_signIn.ifSignUp.data.formHeight;
                element.modal_signIn.label_name.classList.add('dp-none');
            }
            if (model.modal_signIn.currentState === model.modal_signIn.ifNotSignUp) {
                element.modal_signIn.form.style.height = model.modal_signIn.ifNotSignUp.data.formHeight;
                element.modal_signIn.label_name.classList.remove('dp-none');
                element.modal_signIn.label_name.classList.remove('vb-hidden');
            }
        },
        renderComponentText: function(option='normal', errorMessage=null) {
            if (option === 'normal') {
                element.modal_signIn.title.textContent = model.modal_signIn.currentState.data.titleText;
                element.modal_signIn.button.textContent = model.modal_signIn.currentState.data.buttonText;
                element.modal_signIn.message.textContent = model.modal_signIn.currentState.data.messageText.switch;    
            }
            if (option === 'errorMessage') {
                console.log('access renderComponentText(errorMessage)');
                console.log('errorMessage: ', errorMessage);

                element.modal_signIn.errorMessage.textContent = errorMessage;
                element.modal_signIn.errorMessage.classList.add('errorMessage');
                element.modal_signIn.errorMessage.classList.remove('vb-hidden');
                
                // 點選頁面即消除 errorMessage
                window.addEventListener('click', function() {
                    element.modal_signIn.errorMessage.classList.remove('vb-hidden');    
                    element.modal_signIn.errorMessage.textContent = "";
                    element.modal_signIn.errorMessage.classList.remove('errorMessage');
                }, {once: true})                
            }
        },
        displayComponent: function(boolean) {
            if (boolean) {
                element.modal_signIn.self.classList.remove('dp-none');
            }
            else {
                element.modal_signIn.self.classList.add('dp-none');
            }
        }
    }
};

const controller = {
    initGeneral: function() {},
    nav: {
        initComponent: async function() {
            view.nav.setAnchorURL();
            /*
            let getCurrentSignInState = async function() {
                let srcResponse = await fetch('/api/user');
                let response = await srcResponse.json();

                if (response.data !== null) {
                    return model.nav.hasSignIn
                }
                else {
                    return model.nav.hasNotSignIn
                }
            }
            model.nav.currentState = await getCurrentSignInState();
            */

            let response = await model.nav.checkHasSignIn();
            console.log('currentState: ', model.nav.currentState.name);

            view.nav.renderComponent();

            element.nav.anchor_signIn.addEventListener('click', async function() {
                console.log('currentState: ', model.nav.currentState.name);
                if (model.nav.currentState.name === 'hasNotSignIn') {
                    element.modal_signIn.self.classList.remove('dp-none');
                }
                if (model.nav.currentState.name === 'hasSignIn') {
                    let headers = {
                        'Content-Type': 'application/json',
                    };
                    let init = {
                        method: 'DELETE',
                        headers: headers,
                    }
                    let srcResponse = await fetch('/api/user', init);
                    /*
                    isResponseOk = srcResponse.ok;
                    response = await srcResponse.json(); 
                    */

                    model.nav.hasSignIn.data.name = null;
                    model.nav.hasSignIn.data.email = null;
                    
                    controller.nav.setComponent();

                    // 暫時：重新 load 頁面
                    window.location = window.location;
                }
            })

            return Promise.resolve(true)
        },
        setComponent: function() {
            model.nav.updateCurrentState();
            view.nav.renderComponent();
        }
    },
    modal_signIn: {
        initComponent:  function() {
            model.modal_signIn.currentState = model.modal_signIn.ifNotSignUp;
            element.modal_signIn.message.addEventListener('click', function() {
                // console.log('current state:', model.modal_signIn.updateCurrentState());
                controller.modal_signIn.setComponent();
            })
            
            element.modal_signIn.modalMask.addEventListener('click', function() {
                element.modal_signIn.self.classList.add('dp-none');
            })
            
            element.modal_signIn.icon_close.addEventListener('click', function() {
                element.modal_signIn.self.classList.add('dp-none');
            })
            
            return Promise.resolve(true)
        },
        setComponent: function() {
            model.modal_signIn.updateCurrentState();
            // console.log('current state:', model.modal_signIn.updateCurrentState());
    
            view.modal_signIn.renderComponentLayout();
            view.modal_signIn.renderComponentText();
            // console.log('run function');
        },
        submitForm: function() {
        },
    }
};

controller.modal_signIn.submitForm = function() {
    element.modal_signIn.form.addEventListener('submit', async function(event) {
        try {
            event.preventDefault();
            // let response = await model.nav.child_modal_signIn.fetchData(model.modal_signIn.currentState);
            // 先把 fetchData 之內容搬到 controller 中
            console.log('trigger submit event callback');

            let response = null;
            let isResponseOk = null;
            let currentState = model.modal_signIn.currentState;
            console.log('currentState: ', currentState.name);
            
            if (currentState.name === 'ifSignUp') {
                try {
                    let headers = {
                        'Content-Type': 'application/json',
                    };
                    let body = JSON.stringify({
                        email: element.modal_signIn.input_email.getAttribute('value'),
                        password: element.modal_signIn.input_password.getAttribute('value')
                    })
                    let init = {
                        method: 'PATCH',
                        headers: headers,
                        body: body
                    }
                    let srcResponse = await fetch('/api/user', init);
                    isResponseOk = srcResponse.ok;
                    response = await srcResponse.json();        
                }
                catch(error) {}
            }
            
            if (currentState.name === 'ifNotSignUp') {
                try {
                    let headers = {
                        'Content-Type': 'application/json',
                    };
                    let body = JSON.stringify({
                        name: element.modal_signIn.input_name.getAttribute('value'),
                        email: element.modal_signIn.input_email.getAttribute('value'),
                        password: element.modal_signIn.input_password.getAttribute('value')
                    })
                    let init = {
                        method: 'POST',
                        headers: headers,
                        body: body
                    }
            
                    let srcResponse = await fetch(lib.getURL('/api/user'), init);
                    isResponseOk = srcResponse.ok;
                    response = await srcResponse.json();
                    // console.log('isResponseOk: ', isResponseOk);
                    // console.log('response: ', response);
                }
                catch(error) {}
            }

            if (isResponseOk === true) {
                console.log("sucessfully fetch data")
                // 之後優化，多一個「成功登入」、「註冊成功」 modal
                view.modal_signIn.displayComponent(false);
                controller.nav.setComponent();

                // 暫時：重新 load 頁面
                window.location = window.location;
            }
            else {
                console.log('start to renderComponentText()');
                console.log('response.message: ', response.message);
                view.modal_signIn.renderComponentText('errorMessage', response.message);
            }
        }
        catch(error) {}
    });

    return Promise.resolve(true)
}

const exportFunc = {
    initGeneral: function() {},
    getSignInData: function() {},
};

exportFunc.initGeneral = async function() {
    await controller.nav.initComponent();
    await controller.modal_signIn.initComponent();
    await controller.modal_signIn.submitForm();

    return Promise.resolve(true)
}

exportFunc.getSignInData = function() {
    let returnValue = {
        name: model.nav.hasSignIn.data.name,
        email: model.nav.hasSignIn.data.email,
    }

    return returnValue
}



export default {
    exportFunc,
};
form.addEventListener('submit', function(event) {
    event.preventDeafult();
    model.modal_signIn.currentState.submitFormData;
})

// 發一個 ajax，這個 ajax 也很根據 modal_signIn 的 state 而改變
// 這個 fetch 應該要放在 nav，讓父層來管理 state 的改變

submitFormData: function() {
    let requestBody = {
        // 應該從 <Form> 來
        email: "ply@ply.com",
        password: "12345678"
    };

    let requestOptionObj = {
        method: 'PATCH',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    };
}

submitFormData: function() {
    let requestBody = {
        // 應該從 <Form> 來
        name: "彭彭彭",
        email: "ply@ply.com",
        password: "12345678"
    };

    let requestOptionObj = {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    };
    fetch()
    .then((response) => (response.json()))
    .then((responseData) => {
        // return 的 data 是要繼續觸發前端做 view 的改變的
    })
}
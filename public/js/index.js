$(window).ready(() => {
    if (!readCookie("user")) {
        window.location.href = 'login.html'
    }
    $('#username').attr('value', readCookie('user'))
    $('#createRoom').click(() => {
        $.post('/room/createRoom', {
            userName: $('#username').val(),
            rName: $('#rName').val(),
            rPassword: $('#rPassword').val()
        }, (response) => {
            if (response.status == 200) {
                window.location.href = 'index.html';
                alert('Room Created With Name : ' + response.roomInfo.name + ' Password : ' + response.roomInfo.password);
            }
        })
    })

    $('#listRoom').click(() => {
        $('#roomList').html('');
        $('#roomList').toggle('display');
        $.post('/room/list', { userName: $('#username').val() }, (response) => {
            if (response[0] == undefined) {
                $('#roomList').append('<li><p>No Room are Found.</p></li>')
            } else {
                response.forEach(element => {
                    $('#roomList').append(`<li><p>${element.room_name} <button onclick=removeRoom('${element.room_name}') class='btn' style='width:75%;'>Remove Room</button></p></li>`)
                });
            }
        })
    })

    $('#joinChat').click(()=>{
        $.post('/room/joinChat',{
            username : readCookie('user'),
            roomName : $('#jName').val(),
            password : $('#jPassword').val()
        },(res)=>{
            console.log(res)
            if(res.status == 200){
            window.location.href = `chat.html?username=${res.username}&room=${res.roomName}`
        }else if(res.status == 404){
            alert(res.message)
        }
        })
    })
})

function removeRoom(roomName) {
    $.post('/room/delete', {
        room: roomName
    }, (response) => {
        if (response.status == 200) {
            alert('Room Deleted successfully.');
        }
    })
}

function logout() {
    eraseCookie("user");
    window.location.href = 'login.html'
}

function customRoom() {
    $('#mainForm').css('display', 'none')
    $('#logout').css('display', 'none')
    $('#joinRoom').css('display', 'none')
    $('#customRoom').css('display', 'none')
    $('#customForm').css('display', 'block');
    $.get('/room/random', (data) => {
        if (data.status == 200) {
            $('#rName').attr('value', data.roomName);
        }
    })
}

function cancel() {
    $('#mainForm').css('display', 'block')
    $('#logout').css('display', 'block')
    $('#joinRoom').css('display', 'block')
    $('#customRoom').css('display', 'block')
    $('#customForm').css('display', 'none')
    $('#joinForm').css('display', 'none')
}

function joinRoom() {
    $('#mainForm').css('display', 'none')
    $('#logout').css('display', 'none')
    $('#joinRoom').css('display', 'none')
    $('#customRoom').css('display', 'none')
    $('#joinForm').css('display', 'block')
}
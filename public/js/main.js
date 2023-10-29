const form = document.getElementById('chat-form');
const socket = io();
const chatMsg = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Get the username and room from the URL
var { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

$(window).ready(() => {
    if (username != readCookie('user')) {
        window.location.href = 'index.html';
    } else {

        if(room == undefined){
            window.location.href = 'index.html'
            alert('Please select room to join the chat');
        }

        //Join Chat Room
        socket.emit('joinRoom', { username, room });

        // Get room and user
        socket.on('roomUsers', ({ room, users }) => {
            outputRoomName(room);
            outputUsersName(users);
        })

        socket.on('exit',({username , message})=>{
            if(username == readCookie('user')){
                //window.location.href = 'index.html';
                alert(message);
            }
        })

        // Msg from server
        socket.on('message', message => {
            outputMsg(message);
            //scroll down
            chatMsg.scrollTop = chatMsg.scrollHeight;
        })

        // Message submit

        form.addEventListener('submit', (event) => {
            event.preventDefault(); //Find out what this do

            // To get the text message from the frontend
            const message = event.target.elements.msg.value;

            // Emit Message to the server
            socket.emit('chatMsg', message);
            event.target.elements.msg.value = '';
            event.target.elements.msg.focus();
        })

        function outputMsg(message) {
            const div = document.createElement('div');
            div.classList.add('message');
            div.innerHTML = `<p class="meta">${message.userName} <span>${message.time}</span></p>
    <p class="text">
    ${message.textMsg}
    </p>`;
            chatMsg.appendChild(div);
        }

        // Add room name to the dom
        function outputRoomName(room) {
            roomName.innerText = room;
        }

        // Add users name to the dom
        function outputUsersName(users) {
            userList.innerHTML = `${users.map(user => `<li>${user.username}</li>`).join('')}`;
        }
    }
})


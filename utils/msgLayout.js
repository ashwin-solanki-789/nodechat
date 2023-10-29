const moment = require('moment');

function formatMsg(userName, textMsg){
    return{
        userName,
        textMsg,
        time : moment().format('h:mm a')
    }
}

module.exports = formatMsg;
const express = require('express');
const router = express.Router();
const connection = require('./connection');
const str = require('@supercharge/strings');
const bcrypt = require('bcrypt');
const readCookie = require('../public/js/cookie');

router.post('/createRoom', (req, res) => {
    const roomInfo = {
        username: req.body.userName,
        name: req.body.rName,
        password: req.body.rPassword
    }
    bcrypt.hash(roomInfo.password, 10, (err, hash) => {
        if (err) {
            return res.status(500).send({
                hashmessage: err.message
            })
        }
        connection.query("insert into chatroom (room_name, password, userName) values ('" + roomInfo.name + "','" + hash + "','" + roomInfo.username + "');", (error) => {
            if (error) {
                return res.status(500).send({
                    message: error.message
                })
            }
            res.status(200).send({
                status: 200,
                message: 'Room Created',
                roomInfo
            })
        })
    })
})

router.post('/joinChat',(req,res)=>{
    const username = req.body.username
    const roomName = req.body.roomName
    const password = req.body.password
    connection.query("select * from chatroom where room_name = '"+roomName+"';",(error, data)=>{
        if(error){
            return res.status(500).send({
                message : error.message
            })
        }
        if(data[0] != undefined){
            bcrypt.compare(password, data[0].password, (error1, data1)=>{
                if(error1){
                    return res.status(500).send({
                        message : error1.message
                    })
                }
                if(data1){
                    return res.status(200).send({
                        status : 200,
                        username,
                        roomName : data[0].room_name
                    })
                }
                else{
                    return res.status(200).send({
                        status : 401,
                        message : 'Password does not match'
                    })
                }
            })
        }else{
            return res.status(200).send({
                status : 404,
                message : 'Room not found'
            })
        }
    })
})

router.post('/list', (req, res) => {
    connection.query("select room_name from chatroom where username = '"+req.body.userName+"';", (err, data) => {
        if (err) {
            return res.status(500).send({
                DB_err_msg: err.message
            })
        }
        return res.status(200).send(data)
    })
})

router.post('/delete',(req,res)=>{
    const roomName = req.body.room
    connection.query("delete from chatroom where room_name = '"+roomName+"';", (error)=>{
        if(error){
            return res.status(500).send({
                message : error.message
            })
        }
        return res.status(200).send({
            status : 200
        })
    })
})

router.get('/random', (req, res) => {
    res.status(200).send({
        status: 200,
        roomName: str.random(10)
    })
    res.end();
})

module.exports = router
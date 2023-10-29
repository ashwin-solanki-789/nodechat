const express = require('express');
const router = express.Router();
const connection = require('./connection');
const bcrypt = require('bcrypt');
const emailregex = require('email-regex');

const users = [];

// Join user to chat
function userJoin(id, username, room) {
    const user = {
        id, username, room
    }
    users.push(user);
    return user;
}

// Get the current user
function getCurrentUser(id) {
    return users.find(user => user.id === id)
}

function userExist(name, room) {
    if (users[0] != undefined) {
        const index = users.findIndex(user => (user.username == name && user.room == room))
        if(index == -1){
            return -1
        }else{
            return 1
        }
    }else{
        return -1
    }
}

//User leaves chat
function userLeave(id) {
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}

// Get room users
function getRoomUsers(room) {
    return users.filter(user => user.room === room);
}

router.post('/login', (req, res) => {
    const user = {
        username: req.body.username,
        password: req.body.password
    }
    connection.query("select * from chatuser where username = '" + user.username + "' or email = '" + user.username + "';", (error, result) => {
        if (error) {
            return res.status(200).send({
                status: 404,
                errorMsg: error.message
            })
        }
        if (result[0] != undefined) {
            bcrypt.compare(user.password, result[0].password, (error, data) => {
                if (error) {
                    return res.status(402).send({
                        status: 402,
                        message: error.message
                    })
                }
                if (data) {
                    return res.status(200).send({
                        status: 200,
                        username: result[0].username
                    })
                } else {
                    return res.status(200).send({
                        status: 401,
                        message: 'Authantication Failed'
                    })
                }
                res.end();
            })
        } else {
            return res.status(200).send({
                status: 404,
                message: 'Username does not exist.'
            })
        }
    })
})


router.post('/register', (req, res) => {
    if (req.body.password !== req.body.cpassword) {
        return res.send({
            error: "Password Doesn't Match."
        })
    } else if (!emailregex({ exact: true, RegExp: /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/ }).test(req.body.email, '@gmail', '.com')) {
        return res.send({
            error: "Invalid Email ID."
        })
    }
    const user = {
        fname: req.body.fname.trim(),
        lname: req.body.lname.trim(),
        username: req.body.username.trim(),
        email: req.body.email.trim(),
        password: req.body.cpassword
    }
    connection.query('select username, email from chatuser;', (error, data) => {
        if (error) {
            return res.status(200).send({
                error: error.message
            })
        }
        if (!data) {
            bcrypt.hash(user.password, 10, (err, hash) => {
                if (err) {
                    return res.status(200).send({
                        message: err.message
                    });
                }
                connection.query("insert into chatuser (first_name, last_name, username, email, password, status) values ('" + user.fname + "','" + user.lname + "','" + user.username + "','" + user.email + "','" + hash + "', 0);", (err) => {
                    if (err) {
                        return res.status(200).send({
                            message: err.message
                        });
                    }
                    return res.status(201).send({
                        status: 201,
                        messaage1: 'User Created Successfully.',
                        user: user
                    });
                });
            });
        } else {
            for (i = 0; i < data.length; i++) {
                if (data[i].username == user.username || data[i].email == user.email) {
                    return res.status(200).send({
                        message: 'Username already Or Email Already Exist.'
                    })
                    break;
                }
            }
            bcrypt.hash(user.password, 10, (err, hash) => {
                if (err) {
                    return res.status(200).send({
                        message: err.message
                    });
                }
                connection.query("insert into chatuser (first_name, last_name, username, email, password, status) values('" + user.fname + "','" + user.lname + "','" + user.username + "','" + user.email + "','" + hash + "', 0);", (err) => {
                    if (err) {
                        return res.status(500).send({
                            message: err.message
                        });
                    }
                    return res.status(201).send({
                        status: 201,
                        messaage: 'User Created Successfully.',
                        user: user
                    });
                });
            });
        }
    })
})

module.exports = {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
    userExist,
    router
}
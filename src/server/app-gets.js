var express = require('express');
var path = require("path");

exports.app = express();
var app = exports.app;

function createLink(key, adress){
	app.get(key,function (req,res){res.sendFile(path.join(__dirname, adress));});
}

createLink("/admin", "../client/admin/admin.html");
createLink("/login", "../newClient/login.html");
createLink("/loginJS", "../newClient/login.js");


app.get('/user/room',function (req,res){res.sendFile(path.join(__dirname+'../client/user/room/index.html'));});
app.get('/user/room/quizz',function (req,res){res.sendFile(path.join(__dirname+'../client/user/room/quizz/index.html'));});
app.get('/session-index', function (req, res, next) {
  req.session.index = (req.session.index || 0) + 1;
  res.write("Index : " + req.session.index + " : " + req.sessionID);
  res.end();
});


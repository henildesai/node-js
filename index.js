const express = require('express')
const app = express()
var bodyParser = require('body-parser')
var cors = require('cors')
var MongoClient = require('mongodb').MongoClient;
var mongodb = require('mongodb');
var url = "mongodb://localhost:27017/mydb";

app.use(cors())

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

app.post('/addusers', function (req, res) {
    var today = new Date();
    var date = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
    req.body.userData.updated = date;
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      if(!req.body.userData.edit){
        delete req.body.userData['edit'];
        var dbo = db.db("mydb");
        req.body.userData.active = 1;
        var myobj = req.body.userData;
        dbo.collection("user").insertOne(myobj, function(err, obj) {
          if (err) throw err;
          db.close();
          res.send('Done')
        });
      }else{
        var dbo = db.db("mydb");
        var myobj = { _id : new mongodb.ObjectID(req.body.userData.edit), active : 1 };
        var newvalues = { $set: {
          name: req.body.userData.name,
          post: req.body.userData.post,
          desc: req.body.userData.desc,
          updated: date
        } };
        dbo.collection("user").updateOne(myobj, newvalues, function(err, obj) {
          if (err) throw err;
          db.close();
          res.send('Done')
        });
      }
    });
})

app.post('/deleteuser', function (req, res) {
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("mydb");
      var myobj = { _id : new mongodb.ObjectID(req.body.userData) };
      var newvalues = { $set: {
        active: 0
      } };
      dbo.collection("user").updateOne(myobj,newvalues, function(err, obj) {
        if (err) throw err;
        db.close();
        res.send('Done')
      });
    });
})

app.get('/getusers', function (req, res) {
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("mydb");
      var myobj = { active : 1 };
      dbo.collection("user").find(myobj).toArray(function(err, result) {
        var response = {};
        if (err) throw err;
        db.close();
        res.send(result)
      });
    });
})

app.listen(8080)
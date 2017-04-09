/*
  to start the server in debug mode:
  set DEBUG=express:* & node server.js
*/

let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let MongoClient = require('mongodb').MongoClient;
let ObjectId = require('mongodb').ObjectID;

let isPalindrome = require('./palindrome');

const DB_URL = 'mongodb://localhost:27017/palindrome';
const MESSAGES_COLLECTION = 'messages';

// middleware for parsing json body requests
app.use(bodyParser.json());

// for parsing application/x-www-form-urlencoded (data from forms)
// app.use(bodyParser.urlencoded({
//   extended: true
// }));

app.get('/api/messages', function(req, res) {
  MongoClient.connect(DB_URL, function(err, db) {
    if (err) return err;

    db.collection(MESSAGES_COLLECTION)
      .find({})
      .toArray(function(err, messages) {
        db.close();
        if (err) return err;

        res.json({ 'result': messages });
    });
  });
});

app.get('/api/messages/:id', function(req, res) {
  MongoClient.connect(DB_URL, function(err, db) {
    if (err) return err;

    let id = req.params.id;
    db.collection(MESSAGES_COLLECTION)
      .findOne({ '_id': ObjectId(id) }, function(err, message) {
        db.close();
        if (err) return err;

        if (!message) {
          res.status(404).end();
          return;
        }

        res.json(message);
      });
  });
});

app.get('/api/messages/:id/palindrome', function(req, res) {
  MongoClient.connect(DB_URL, function(err, db) {
    if (err) return err;

    let id = req.params.id;
    db.collection(MESSAGES_COLLECTION)
      .findOne({ '_id': ObjectId(id) }, function(err, message) {
        db.close();
        if (err) return err;

        if (!message) {
          res.status(404).end();
          return;
        }

        let result = isPalindrome(message.text);
        res.json({ 'isPalindrome': result });
      });
  });
});

app.post('/api/message', function(req, res) {
  MongoClient.connect(DB_URL, function(err, db) {
    if (err) return err;

    let message = req.body;
    db.collection(MESSAGES_COLLECTION).insert(message, function() {
      db.close();
      if (err) return err;

      res.status(201).send(message);
    });
  });
});

app.delete('/api/message/:id', function(req, res) {
  MongoClient.connect(DB_URL, function(err, db) {
    if (err) return err;

    let id = req.params.id;
    db.collection(MESSAGES_COLLECTION)
      .findAndRemove({ '_id': ObjectId(id) }, function(err, message) {
        db.close();
        if (err) return err;

        res.status(204).end();
    });
  });
});

app.listen(8080, function() {
  console.log('------------------------ server running ------------------------');
});

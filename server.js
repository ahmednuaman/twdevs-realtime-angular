var express = require('express'),
    io = require('socket.io').listen(8001),
    mongoClient = require('mongodb').MongoClient,
    app,
    server;

function initExpress () {
  app = express();
  server = require('http').createServer(app);

  server.listen(8000);

  app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
  });

  app.use('/', express.static(__dirname + '/'));
}

function initMongo () {
  mongoClient.connect('mongodb://127.0.0.1:27017/messages_db', function(err, db) {
    if (!err) {
      initCollection(db);
    } else {
      console.error(err);
    }
  });
}

function initCollection (db) {
  db.collectionNames('messages_collection', function (err, names) {
    var collection;

    if (names.length === 1) {
      collection = db.collection('messages_collection');

      verifyCollection(db, collection);
    } else {
      db.createCollection('messages_collection', {
        capped: true,
        size: 102400
      }, function (err, collection) {
        console.log('Created collection');

        verifyCollection(db, collection);
      });
    }
  });
}

function initSockets (collection) {
  io.sockets.on('connection', function (socket) {
    var stream = collection.find({}, {
      tailable: 1,
      awaitdata: true,
      numberOfRetries: -1
    }).sort({$natural: -1}).stream();

    stream.on('data', function (data) {
      console.log('Sending', data);
      socket.emit('messages', data);
    });

    socket.on('add_message', function (data) {
      collection.insert(data, function (err) {
        console.log('Wrote', data);
      });
    });
  });
}

function verifyCollection (db, collection) {
  collection.isCapped(function (err, capped) {
    if (capped) {
      initSockets(collection);
    } else {
      console.log('Not a capped collection');

      db.dropCollection('messages_collection', function (err) {
        console.log('Dropped collection');

        initCollection(db);
      });
    }
  });
}

initExpress();
initMongo();

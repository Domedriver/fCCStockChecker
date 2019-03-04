/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var request = require('request')
var expect = require('chai').expect;
var MongoClient = require('mongodb');



const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

function getPrice(ticker, callback) {
  request.get('https://api.iextrading.com/1.0/stock/' + ticker + '/quote', function(err, res, body) {
          if (err) throw err
          callback(JSON.parse(body).latestPrice)
        })
}

module.exports = function (app) { 

  app.route('/api/stock-prices')
    .get(function (req, res) {
      var stocks = req.query.stock;
      var symbolList = []
      Array.isArray(stocks) ? symbolList = stocks : symbolList.push(stocks)
      var likeVote = req.query.like
      if (likeVote == 'true') {
        try {
          var ip = req.headers['x-forwarded-for'].split(',')[0] || '108.32.37.63'
        } catch (error) {
          var ip = '999.99.99.99'
          }
        MongoClient.connect(CONNECTION_STRING, function(err, db) {
          
          function handleLikedTicker(i) {            
            if (i < symbolList.length) {
              var likedTicker = symbolList[i]
              db.collection('stocks').findOne({stock: likedTicker}, function(err, result) {                
                if (result == undefined) {
                  console.log('Ticker not in db. Adding it now...')
                  db.collection('stocks').insertOne({stock: likedTicker, likes: [ip]}, function(err, result) {
                    if (err) throw err
                    handleLikedTicker(i+1)
                  })
                } else {
                  if (!result.likes.includes(ip)) {
                    result.likes = [...result.likes, ip]
                    db.collection('stocks').update({stock: likedTicker}, {$set: {likes: result.likes}}, function(err, result) {
                      if (err) throw err
                      handleLikedTicker(i+1)
                    })
                  } else {
                    handleLikedTicker(i+1)
                  }
                }
              })
            } else {
              console.log("Done handling 'likes'")
              buildResults(0);
            }
          }
          
          handleLikedTicker(0)
        })
      } else {
        console.log("no 'likes'")
        buildResults(0);
      }
      
      var results = []
      
      function buildResults(i) {
        if (i < symbolList.length) {
          var stockObj = { stock: symbolList[i] }
          MongoClient.connect(CONNECTION_STRING, function(err, db) {
            db.collection('stocks').findOne({stock: symbolList[i]}, function(err, result) {
              result ? stockObj.likes = result.likes.length : stockObj.likes = 0              
              getPrice(symbolList[i], function(price) {
                stockObj.price = price
                results = [...results, stockObj]
                buildResults(i+1)
              })
            })
          })          
        } else {
          console.log('All done. Sending results');
          res.json({stockData: results})          
        }
      }
  })
};

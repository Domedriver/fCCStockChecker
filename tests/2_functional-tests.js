/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    
    suite('GET /api/stock-prices => stockData object', function() {
      
      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end(function(err, res){         
         assert.equal(res.status, 200);
         assert.isObject(res.body);
         done();
        })
      })
      
      test('1 stock with like', function(done) {
        chai.request(server)
          .get('/api/stock-prices')
          .query({stock: 'rdfn', like: 'true'})
          .end(function(err, res){            
            assert.equal(res.status, 200);
            assert.equal(res.body.stockData[0].stock, 'rdfn')
            assert.equal(res.body.stockData[0].likes, 1)
            done();
        });
      });
      
      test('1 stock with like again (ensure likes arent double counted)', function(done) {
        chai.request(server)
          .get('/api/stock-prices')
          .query({stock: 'rdfn', like: 'true'})
          .end(function(err, res) {
            assert.equal(res.status, 200)
            assert.equal(res.body.stockData[0].stock, 'rdfn')
            assert.equal(res.body.stockData[0].likes, 1)
            done()
        });        
      });
      
      test('2 stocks', function(done) {
        chai.request(server)
          .get('/api/stock-prices')
          .query({stock: ['acm', 'lmt']})          
          .end(function(err, res) {            
            assert.equal(res.status, 200)
            assert.equal(res.body.stockData[0].stock, 'acm')
            assert.equal(res.body.stockData[1].stock, 'lmt')
            assert.equal(res.body.stockData[0].likes, 0)            
            assert.equal(res.body.stockData[1].likes, 0)
            done()
        })        
      });
      
      test('2 stocks with like', function(done) {
        chai.request(server)
          .get('/api/stock-prices')
          .query({stock: ['vpg', 'rell'], like: 'true'})
          .end(function(err, res) {            
            assert.equal(res.status, 200)            
            assert.equal(res.body.stockData[0].stock, 'vpg')
            assert.equal(res.body.stockData[1].stock, 'rell')
            assert.equal(res.body.stockData[0].likes, 1)            
            assert.equal(res.body.stockData[1].likes, 1)
            done()
        })
        
      });
      
    });

});

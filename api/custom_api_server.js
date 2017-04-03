var express = require('express')
var md5 = require('md5')
var moment = require('moment')
var bodyParser = require('body-parser');
var dataFile = 'data.json'
var Gdax = require('gdax');
var publicClient = new Gdax.PublicClient('ETH-USD')
var request = require('request');

var app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

//this allows people to access the API via JS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "DELETE,PUT,GET,POST");
  next();
});

app.post('/', (req, res) => {
  let {key, secret, passphrase} = req.body
  let authedClient = new Gdax.AuthenticatedClient(key, secret, passphrase)
  authedClient.getAccounts(function(err, response, data) {
    if (Array.isArray(data)) {
      res.json({logged_in: true, key, secret, passphrase}) //res.json is the equivalent of 'return' because async
    } else {
      res.json({logged_in: false, key:'', secret:'', passphrase:''}) //res.json is the equivalent of 'return' because async
    }
  })
})

app.post('/trade', (req, res) => {
  let {key, secret, passphrase} = req.body
  let authedClient = new Gdax.AuthenticatedClient(key, secret, passphrase)
  authedClient.cancelAllOrders({product_id: 'ETH-USD'}, function(err, response, data){
    publicClient.getProductOrderBook({'level': 1}, function(err, response, data){
      var best_bid=Number(data.bids[0][0])
      var best_ask=Number(data.asks[0][0])
      authedClient.getAccounts(function(err, response, data) {
        //console.log(data)
        // var avail_USD=data[0].available
        // var avail_ETH=data[2].available
        var avail_USD = data.filter(function(x){return x.currency==='USD'})[0].available
        var avail_ETH = data.filter(function(x){return x.currency==='ETH'})[0].available
        console.log(avail_USD, avail_ETH)

        var url = 'https://poloniex.com/public?command=returnChartData&currencyPair=BTC_ETH&start=1405699200&end=9999999999&period=14400';
        request(url, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            var btc_eth_prices = JSON.parse(body);
            var url = 'https://poloniex.com/public?command=returnChartData&currencyPair=USDT_BTC&start=1405699200&end=9999999999&period=14400';
            request(url, function (error, response, body) {
              if (!error && response.statusCode == 200) {
                var btc_usd_prices = JSON.parse(body);
                var data = [];
                if (btc_usd_prices.length<btc_eth_prices.length) {
                  btc_eth_prices = btc_eth_prices.slice(btc_eth_prices.length - btc_usd_prices.length)
                } else {
                  btc_usd_prices = btc_usd_prices.slice(btc_usd_prices.length - btc_eth_prices.length)
                }
                //console.log(btc_usd_prices.length, btc_eth_prices.length)
                for (var i=0; i<btc_usd_prices.length; i++) {
                  var btc_usd = btc_usd_prices[i]
                  var btc_eth = btc_eth_prices[i]
                  var eth_usd = btc_usd.weightedAverage * btc_eth.weightedAverage;
                  data.push( {date: new Date(btc_usd.date*1000), price: eth_usd})
                }
                //the bot begins
                var rolling_average_period = 100;
                var rolling_average = data.map(function(x){ return x.price }).slice(data.length - rolling_average_period).reduce(function(a,b){return a+b})/Math.min(rolling_average_period,data.length)
                console.log(rolling_average, best_bid, best_ask)
                if (best_bid>rolling_average*1.005 && avail_ETH>=1) {
                  var sellParams = {
                    'price': best_bid, // USD
                    'size': '1', // ETH
                    'product_id': 'ETH-USD',
                  }
                  authedClient.sell(sellParams, function(err, response, data) {
                    var orderID = data.id
                    console.log("sell")
                    res.json({result: 'sell', params: sellParams})
                  })

                } else if (best_ask<rolling_average*0.995 && avail_ETH<10 && avail_USD>best_ask*1.1) {
                  var buyParams = {
                    'price': best_ask, // USD
                    'size': '1',  // ETH
                    'product_id': 'ETH-USD',
                  };
                  authedClient.buy(buyParams, function(err, response, data) {
                    var orderID = data.id
                    console.log("buy")
                    res.json({result: 'buy', params: buyParams})
                  });

                } else {
                  console.log("nothing")
                  res.json({result: 'nothing'})
                }
              }
            })
          }
        });
      })
    })
  })
})

const port = 8000
app.listen(port, function () {
  console.log('Example app listening on port', port);
});

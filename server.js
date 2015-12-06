// getting required modules
var express = require('express');
var compress = require('compression');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var moment = require('moment');

// initializing mongodb connection and models
mongoose.connect('mongodb://localhost/PortfolioStrat');
var mongodb = mongoose.connection;
mongodb.on('error', function () { console.log("Error connecting to mongodb"); process.exit(1);});
var Graph = null;
mongodb.once('open', function (callback) { 
    console.log("Successfully connected to mongodb");
    var GraphSchema = mongoose.Schema({chart_type: String, data: Array, data_min: Number, data_max: Number, title: String});
    Graph = mongoose.model('Graph', GraphSchema);
});

// creating a new app with express framework
var app = express();
// needed to compress all our responses
app.use(compress());
// needed to parse requests body (for example in post requests)
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app
.post('/graph/save', function (req, res) {
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    res.setHeader('Accept', 'application/json');

    var title = req.body.title;
    var type = req.body.type;
    var min = req.body.min;
    var max = req.body.max;

    if (title == undefined || type == undefined || min == undefined || max == undefined)
        return res.status(200).json({code: 400, status: "Bad request", error: "Please provide all informations for the chart"});
    else if (title == "")
        return res.status(200).json({code: 400, status: "Bad request", error: "Please provide a valid title for the chart"});
    else if (type != "line" && type != "scatter" && type != "bar")
        return res.status(200).json({code: 400, status: "Bad request", error: "Please provide a valid type for the chart"});
    else if (!/^[0-9]+$/.test(min) || !/^[0-9]+$/.test(max))
        return res.status(200).json({code: 400, status: "Bad request", error: "Please provide a valid min and max value for the chart"});

    min = parseInt(min);
    max = parseInt(max);
    var diff = max - min;
    if (min >= max) return res.status(200).json({code: 400, status: "Bad request", error: "Please provide a max value bigger than the min value"});

    var nbSeries = Math.floor((Math.random() * 4) + 1); // from 1 to 4 series
    var nbValues = Math.floor((Math.random() * 20) + 10); // from 10 to 30 values
    var datas = [];

    for (var k = 0; k < nbSeries; ++k) datas.push({series: []});
    for (var i = 0; i < nbValues; ++i) {
        var date = moment().add(i, 'days').format('YYYY-MM-DD');
        for (var k = 0; k < nbSeries; ++k) {
            var num = (Math.random() * diff) + min;
            datas[k].series.push([date, Math.round(num * 1000) / 1000]);
        }
    }

    new Graph({chart_type: type, data: datas, data_min: min, data_max: max, title: title})
    .save(function (err, obj) {
        if (err) {
            console.log(err);
            res.status(500).json({code: 500, status: "Internal server error", error: "Chart could not be saved in database"});
        }
        else res.status(200).json({code: 200, status: "OK", success: "Chart successfully added", _id: obj._id});
    });
})

.get('/graph/get/:_id', function (req, res) {
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    res.setHeader('Accept', 'application/json');

    if (req.params._id == undefined)
        return res.status(200).json({code: 400, status: "Bad request", error: "Please provide a chart id"});

    Graph.find({_id: req.params._id}, function (err, obj) {
        if (err) {
            console.log(err);
            res.status(500).json({code: 500, status: "Internal server error", error: "The chart could not be retrieved from database"});
        }
        else if (obj.length == 0) res.status(200).json({code: 400, status: "Bad request", error: "Chart not found"});
        else res.status(200).json({code: 200, status: "OK", success: "Chart successfully retrieved", chart: obj[0]});
    });
})

.get('/graphs/get', function (req, res) {
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    res.setHeader('Accept', 'application/json');

    Graph.find({}, function (err, obj) {
        if (err) {
            console.log(err);
            res.status(500).json({code: 500, status: "Internal server error", error: "Charts could not be retrieved from database"});
        }
        else {
            var datas = [];
            for (var k = 0; k < obj.length; ++k) datas.push({_id: obj[k]._id, title: obj[k].title});
            res.status(200).json({code: 200, status: "OK", success: "Charts successfully retrieved", charts: datas});
        }
    });
})

// route to get static files
.use(express.static(__dirname + '/app'))

app.listen(1337);
console.log('HTTP Server running at http://localhost:1337/');

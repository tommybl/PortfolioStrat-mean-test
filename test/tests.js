var supertest = require('supertest');
var should = require('should');
var mongoose = require('mongoose');
var serverHost = 'http://localhost:1337';

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

/**************************************/
/************* UNIT TESTS *************/
/**************************************/

describe('POST /graph/save -> Missing some arguments', function () {
it('Should return status 200 with JSON 400 code, status message and corresponding error message', function (done) {
var graph = {};
supertest(serverHost)
.post('/graph/save')
.send(graph)
.expect('Content-Type', 'application/json; charset=utf-8')
.set('Accept', 'application/json')
.expect(function(res) {})
.expect(200)
.expect(function(res) { res.body.should.have.property("code", 400); })
.expect(function(res) { res.body.should.have.property("status", "Bad request"); })
.expect(function(res) { res.body.should.have.property("error", "Please provide all informations for the chart"); })
.end(function(err, res) {
    if (err) return done(err);
    done();
}); }); });

describe('POST /graph/save -> Good request', function () {
it('Should return status 200 with JSON 200 code, success message and new chart ID', function (done) {
var graph = {title: "Test generation", min: 0, max: 30, type: "line"};
supertest(serverHost)
.post('/graph/save')
.send(graph)
.expect('Content-Type', 'application/json; charset=utf-8')
.set('Accept', 'application/json')
.expect(function(res) {})
.expect(200)
.expect(function(res) { res.body.should.have.property("code", 200); })
.expect(function(res) { res.body.should.have.property("status", "OK"); })
.expect(function(res) { res.body.should.have.property("success", "Chart successfully added"); })
.expect(function(res) { res.body.should.have.property("_id"); })
.end(function(err, res) {
    if (err) return done(err);
    else {
        Graph.find({_id: res.body._id}).remove(function (errr) { if (errr) console.log(errr); });
        done();
    }
}); }); });

describe('GET /graph/get/:_id -> Bad _id argument and chart not found', function () {
it('Should return status 200 with JSON 400 code, status message and corresponding error message', function (done) {
var _id = undefined;
supertest(serverHost)
.get('/graph/get/000000000000000000000000')
.expect('Content-Type', 'application/json; charset=utf-8')
.set('Accept', 'application/json')
.expect(function(res) {})
.expect(200)
.expect(function(res) { res.body.should.have.property("code", 400); })
.expect(function(res) { res.body.should.have.property("status", "Bad request"); })
.expect(function(res) { res.body.should.have.property("error", "Chart not found"); })
.end(function(err, res) {
    if (err) return done(err);
    done();
}); }); });

describe('GET /graph/get/:_id -> Good _id, chart found and retrieved', function () {
it('Should return status 200 with JSON 200 code, success message and new chart ID', function (done) {
var _id = undefined;
new Graph({chart_type: "line", data: ["some data"], data_min: 0, data_max: 30, title: "Test generation"})
.save(function (err, obj) {
    if (err) console.log(err);
    else {
        _id = obj._id;
        supertest(serverHost)
        .get('/graph/get/' + _id)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .set('Accept', 'application/json')
        .expect(function(res) {})
        .expect(200)
        .expect(function(res) { res.body.should.have.property("code", 200); })
        .expect(function(res) { res.body.should.have.property("status", "OK"); })
        .expect(function(res) { res.body.should.have.property("success", "Chart successfully retrieved"); })
        .expect(function(res) { res.body.should.have.property("chart"); })
        .end(function(err, res) {
            if (err) return done(err);
            else {
                Graph.find({_id: _id}).remove(function (errr) { if (errr) console.log(errr); });
                done();
            }
        });
    }
});
}); });

describe('GET /graphs/get -> Retrieving all charts for selecting on web page', function () {
it('Should return status 200 with JSON 200 code, success message and all charts id and title', function (done) {
var _id = undefined;
supertest(serverHost)
.get('/graphs/get')
.expect('Content-Type', 'application/json; charset=utf-8')
.set('Accept', 'application/json')
.expect(function(res) {})
.expect(200)
.expect(function(res) { res.body.should.have.property("code", 200); })
.expect(function(res) { res.body.should.have.property("status", "OK"); })
.expect(function(res) { res.body.should.have.property("success", "Charts successfully retrieved"); })
.expect(function(res) { res.body.should.have.property("charts"); })
.end(function(err, res) {
    if (err) return done(err);
    done();
}); }); });

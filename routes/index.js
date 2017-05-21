var express = require('express');
var router = express.Router();
var path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
  var viewPath = path.join(__dirname, '../', 'views', 'draw.html');
  res.sendFile(viewPath);
  //res.render('index', { title: 'Express' });
});

module.exports = router;

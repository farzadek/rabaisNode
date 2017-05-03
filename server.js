var express = require('express'),
	mongoose = require('mongoose'),
	bodyParser = require('body-parser'),
	bcrypt = require('bcrypt'),
	salt = bcrypt.genSaltSync(10),
	app = express(),
	router = express.Router();

mongoose.connect('mongodb://farzad:ff4802ee@ds161029.mlab.com:61029/userstory');
var tblPerson = mongoose.model('persons',{id: String, name:String, phone:String, email:String});
var tblProducts = mongoose.model('products',{price: Number, name:String, image:String, no:Number, promo:Number, cat:String});
var tblUsers = mongoose.model('users',{id: String, name:String, level:Number, username:String, password:String});

app.use(express.static(__dirname+'/public'));
app.use(bodyParser.json());

router.get('/',function(req,res){
	res.send('mainPage');
});

router.get('/users/:username',function(req,res){
	var query = tblUsers.findOne({
		'username': req.params.username
	});
	query.select('username');
	query.exec(function (err, user) {
		if (err) return handleError(err);
		if(user) res.json(user); else res.send(null);
	});
});

router.post('/users/:username/:password/:name',function(req,res){
	var hash = bcrypt.hashSync(req.params.password, salt);	
	var user = {
  		name: req.params.name,
  		username: req.params.username,
  		password: hash,
  		level: 2
	};
	var newUser = new tblUsers(user); 
	newUser.save(function(err){
		if(err) throw err;
		res.send('ok');
	}); 
});

router.get('/users/:username/:password',function(req,res){
	var hash = bcrypt.hashSync(req.params.password, salt);	
	var query = tblUsers.findOne({
		'username': req.params.username,'password':hash
	});
	query.select('name level');
	query.exec(function (err, user) {
		if (err) return handleError(err);
		if(user) res.json(user); else res.send(null);
	});
});
/* --------------------------------------------------------------------------------- */
router.get('/products', function(req,res){
	tblProducts.find(function(err,data){
		res.json(data);
	});
});
/*
router.get('/persons/:id', function(req,res){
	tblPerson.findById(req.params.id, function (err, data) {  
	    if (err) throw err;
	    if (data) {
	    	res.json(data);
        }
    });
});

router.post('/persons', function(req,res){
	var newPerson = new tblPerson(req.body); 
	newPerson.save(function(err){
		if(err) throw err;
		else{ 
			tblPerson.find(function(err,data){
				res.json(data);
			});
		}
	});
});

router.delete('/persons/:id', function(req,res){
	tblPerson.findByIdAndRemove(req.params.id, function (err, data) {  
    	res.json(data);
    });
});

router.put('/persons/:id', function(req,res){
	tblPerson.findByIdAndUpdate(req.body._id, {$set:req.body}, function(err, data){
        if(err) throw err;
        res.json(data);
    });
});
*/
/*
router.get('/persons', function(req,res){
	tblPerson.find(function(err,data){
		res.json(data);
	});
});
router.get('/persons/:id', function(req,res){
	tblPerson.findById(req.params.id, function (err, data) {  
	    if (err) throw err;
	    if (data) {
	    	res.json(data);
        }
    });
});

router.post('/persons', function(req,res){
	var newPerson = new tblPerson(req.body); 
	newPerson.save(function(err){
		if(err) throw err;
		else{ 
			tblPerson.find(function(err,data){
				res.json(data);
			});
		}
	});
});

router.delete('/persons/:id', function(req,res){
	tblPerson.findByIdAndRemove(req.params.id, function (err, data) {  
    	res.json(data);
    });
});

router.put('/persons/:id', function(req,res){
	tblPerson.findByIdAndUpdate(req.body._id, {$set:req.body}, function(err, data){
        if(err) throw err;
        res.json(data);
    });
});
*/
app.use('/', router);

app.listen(8013);
console.log('OK!');

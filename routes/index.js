var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
var passport = require('passport');
var jwt = require('express-jwt');

//GET Routes
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');
var User = mongoose.model('User');

//authenticate middleware token
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// GET/posts -return a list of posts and associated metadata
router.get('/posts', function(req, res, next){
	Post.find(function(err, posts){
		if(err){return next(err);}
		
		res.json(posts);
	});
});

// POST/posts -create a new post
router.post('/posts', auth, function(req, res, next){
	var post = new Post(req.body);
	post.author = req.payload.username;
	
	post.save(function(err, post){
		if(err){return next(err);}
		
		res.json(post);
	})
});


//Any query  running :post param (i.e posts/id) will run this function first
router.param('post', function(req, res, next, id){
	var query = Post.findById(id);
	
	query.exec(function(err, post){
		if(err){return next(err);}
		if(!post){return next(new Error('cant\'t find post'));}
		
		req.post = post;
		return next();
	});
});


//Returns a single post
router.get('/posts/:post', function(req, res, next){
	req.post.populate('comments', function(err,post){
		if(err){return next(err);}
		
		res.json(post);
	});
});

// PUT/posts/:id/upvote runs (:id) through router.param first
router.put('/posts/:post/upvote', auth, function(req, res, next){
	req.post.upvote(function(err, post){
		if(err){return next(err);}
		
		res.json(post);
	});
});

// POST/posts/:id/comments runs (:id) through router.param first
router.post('/posts/:post/comments', auth, function(req, res, next){
	var comment = new Comment(req.body);
	comment.post = req.post;
	comment.author = req.payload.username;
	
	comment.save(function(err, comment){
		if(err){return next(err);}
		
		req.post.comments.push(comment);
		req.post.save(function(err, post){
			if(err){return next(err);}
			
			res.json(comment);
		});
	});
});


//Any query running :comment (i.e posts/id/comments/id) will run this function first
router.param('comment', function(req, res, next, id){
	var query = Comment.findById(id);
	
	query.exec(function(err, comment){
		if(err){return next(err);}
		if(!comment){return next(new Error('cant\'t find post'));}
		
		req.comment = comment;
		return next();
	});
});


// PUT/posts/:post/comments/:comment/upvote runs through router.param function :comment 
router.put('/posts/:post/comments/:comment/upvote', auth, function(req, res, next){
	req.comment.upvote(function(err, comment){
		if(err){return next(err);}
		
		res.json(comment);
	});
});

/********* LOG IN ROUTES ***********/

router.post('/register', function(req, res, next){
	if(!req.body.username || !req.body.password){
		return res.status(400).json({message: "Please fill out all fields"});
	}
	
	var user = new User();
	
	user.username = req.body.username;
	user.setPassword(req.body.password)
	
	user.save(function(err){
		if(err){return next(err);}
		return res.json({token: user.generateJWT()})
	});
});

router.post('/login', function(req, res, next){
	if(!req.body.username || !req.body.password){
		return res.status(400).json({message: 'Please fill out all fields'});
	}
	
	passport.authenticate('local', function(err, user, info){
		if(err){return next(err)}
		
		if(user){
			return res.json({token: user.generateJWT()});
		} else {
			return res.status(401).json(info);
		}
	})(req, res, next);
});

module.exports = router;
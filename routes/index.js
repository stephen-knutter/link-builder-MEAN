var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;

//GET Routes
var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');

// GET/posts -return a list of posts and associated metadata
router.get('/posts', function(req, res, next){
	Post.find(function(err, posts){
		if(err){return next(err);}
		
		res.json(posts);
	});
});

// POST/posts -create a new post
router.post('/posts', function(req, res, next){
	var post = new Post(req.body);
	
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

//

//Returns a single post
router.get('/posts/:post', function(req, res, next){
	req.post.populate('comments', function(err,post){
		if(err){return next(err);}
		
		res.json(post);
	});
});

// PUT/posts/:id/upvote runs (:id) through router.param first
router.put('/posts/:post/upvote', function(req, res, next){
	req.post.upvote(function(err, post){
		if(err){return next(err);}
		
		res.json(post);
	});
});

// POST/posts/:id/comments runs (:id) through router.param first
router.post('/posts/:post/comments', function(req, res, next){
	var comment = new Comment(req.body);
	comment.post = req.post;
	
	comment.save(function(err, comment){
		if(err){return next(err);}
		
		req.post.comments.push(comment);
		req.post.save(function(err, post){
			if(err){return next(err);}
			
			res.json(comment);
		});
	});
});

router.param(['post', 'comment'], function(req, res, next, value){
	var query = Comment.findById(value.comment);
	
	query.exec(function(err, value.comment){
		if(err){return next(err);}
		if(!comment){return next(new Error('cant\'t find post'));}
		
		req.comment = value.comment;
		return next();
	});
});

// PUT/posts/:post/comments/:comment/upvote runs through router.param :post, :comment 
router.put('/posts/:post/comments/:comment/upvote', function(req, res, next){
	req.comment.upvote(function(err, post){
		if(err){return next(err);}
		
		res.json(comment);
	});
});











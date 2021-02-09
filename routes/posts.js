const express = require('express');
const router = express.Router();
const Post = require('../models/post');

// Middleware
import { checkAuthenticated, checkNotAuthenticated } from '../basicAuth';

// Routes
router.get('/new', checkAuthenticated, (req, res) => {
	res.render('posts/new', { post: new Post(), user: req.user });
});

router.get('/edit/:id', async (req, res) => {
	const post = await Post.findById(req.params.id);
	res.render('posts/edit', { post: post });
});

router.get('/:slug', async (req, res) => {
	const post = await Post.findOne({ slug: req.params.slug });
	if (post == null) res.redirect('/');
	res.render('posts/show', { post: post });
});

router.post('/', checkAuthenticated, async (req, res) => {
	const user = req.user;
	let post = new Post({
		title: req.body.title,
		description: req.body.description,
		markdown: req.body.markdown,
		author: user,
	});

	try {
		post = await post.save();
		user.posts.push(post);
		await user.save();
		res.redirect(`/posts/${post.slug}`);
	} catch {
		res.render('posts/new', { post: post });
	}
});

router.put('/:id', async (req, res) => {
	let post = await Post.findById(req.params.id);
	post.title = req.body.title;
	post.description = req.body.description;
	post.markdown = req.body.markdown;

	try {
		post = await post.save();
		res.redirect(`/posts/${post.slug}`);
	} catch (error) {
		res.render('posts/edit', { post: post });
	}
});

router.delete('/:id', async (req, res) => {
	await Post.findByIdAndDelete(req.params.id);
	res.redirect('/');
});

module.exports = router;

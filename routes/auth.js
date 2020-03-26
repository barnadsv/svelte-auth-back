const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const passport = require('passport');
const { addTokenToBlackList } = require('../services/redis');
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res, next) => {
	const user = await User.findOne({ username: req.body.username }).select('+password');
	const isAuthenticated = await (user && user.verifyPassword(req.body.password));
	if (!isAuthenticated) {
		next({
			status: 401,
			message: 'The username or password is wrong!'
		});
		return;
	}

	try {
		const token = user.getToken();
		// res.cookie('access_token', token, { expires: new Date(Date.now() + 9999999) });
		res.json({
			_id: user._id,
			username: user.username,
			token: token
		});
	} catch (error) {
		next({
			status: 500,
			message: error.message
		});
		return;
	}
});

// router.post('/logout', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
// 	try {
// 		console.info('Tentando executar logout no backend');
// 		const token = req.body;
// 		console.info('Token que esta no body do logout: ', token);
// 		await addTokenToBlackList(token);
// 		next({
// 			status: 200,
// 			message: 'Logout realizado com sucesso!'
// 		});
// 		return;
// 	} catch (error) {
// 		next({
// 			status: 500,
// 			message: error.message
// 		});
// 		return;
// 	}
// });

router.post('/logout', async (req, res, next) => {
	try {
		console.info('Tentando executar logout no backend');
		const token = req.body.token;
		console.info('Token que esta no body do logout: ', token);
		const payload = jwt.decode(token);
		console.info('Token payload: ', payload);
		await addTokenToBlackList(payload.jti, payload.exp);
		next({
			status: 200,
			message: 'Logout realizado com sucesso!'
		});
		return;
	} catch (error) {
		next({
			status: 500,
			message: error.message
		});
		return;
	}
});

module.exports = router;

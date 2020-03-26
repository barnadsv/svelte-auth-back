const redis = require('redis');
const bluebird = require('bluebird');

require('dotenv').config({ path: '.env' });

bluebird.promisifyAll(redis);

const redisClient = redis.createClient(process.env.REDIS_URL);

const convertExpToDate = exp => {
	const expireDate = new Date(exp * 1000);
	const expireDateArr = [
		expireDate.getFullYear(),
		('0' + (expireDate.getMonth() + 1)).slice(-2),
		('0' + expireDate.getDate()).slice(-2),
		('0' + expireDate.getHours()).slice(-2),
		('0' + expireDate.getMinutes()).slice(-2),
		('0' + expireDate.getSeconds()).slice(-2)
	];
	const expireDateDay = [expireDateArr[0], expireDateArr[1], expireDateArr[2]].join('/');
	const expireDateHour = [expireDateArr[3], expireDateArr[4], expireDateArr[5]].join(':');
	return expireDateDay + ' ' + expireDateHour;
};

module.exports = {
	addTokenToBlackList: async (jti, exp) => {
		console.info('Id do token (jti) que sera inserido na blacklist: ', jti);
		console.info('Timestamp da expiração do token: ', exp);

		// Data de expiração do token...
		const expirateDate = convertExpToDate(exp);

		// Tempo que resta para o token permanecer no banco de dados...
		const ttl = Math.ceil((exp * 1000 - Date.now()) / 1000);

		await redisClient.setAsync(jti, expirateDate, 'EX', ttl);
		// await redisClient.LPUSHAsync('token', token);
	},

	isTokenInBlackList: async jti => {
		const token = await redisClient.getAsync(jti);
		console.log('Token na blacklist do redis: ', token);
		return token === null ? false : true;
		// let tokens = await redisClient.LRANGEAsync('token', 0, 999999999);
		// return tokens.indexOf(token) > -1;
	}
};

redisClient.on('conect', () => {
	console.info('Redis server is up & running!');
});

redisClient.on('error', err => {
	console.error('Woops! Redis server is down', err);
});

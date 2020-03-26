const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const User = mongoose.model('User');
const fs = require('fs');
const { isTokenInBlackList } = require('../services/redis');

// PUBLIC key
const publicKey = fs.readFileSync('keys/public.key', 'utf8');

const token = ExtractJwt.fromAuthHeaderAsBearerToken();

const options = {
	jwtFromRequest: token,
	secretOrKey: publicKey, // AQUI DEVE TER A CHAVE PÚBLICA...
	algorithm: ['RS256']
};

passport.use(
	new JwtStrategy(options, async (jwtPayload, done) => {
		try {
			if (await isTokenInBlackList(jwtPayload.jti)) {
				console.log('Token inválido: ', jwtPayload.jti);
				return done({ msg: 'Token inválido' }, false);
			}
			const user = await User.findOne({ _id: jwtPayload.id });
			return done(null, user || false);
		} catch (err) {
			return done(err, false);
		}
	})
);

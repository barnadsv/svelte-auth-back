const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const uuid = require('uuid');

// PRIVATE key
const privateKey = fs.readFileSync('keys/private.key', 'utf8');

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true,
		select: false
	}
});

userSchema.methods.verifyPassword = function(password) {
	return bcrypt.compare(password, this.password);
};
userSchema.methods.getToken = function() {
	try {
		return jwt.sign(
			{
				id: this._id,
				username: this.username,
				jti: uuid.v4()
			},
			privateKey, // AQUI DEVE TER A CHAVE PRIVADA...
			{
				expiresIn: '5m',
				algorithm: 'RS256'
			}
		);
	} catch (error) {
		return error;
	}
};

userSchema.pre('save', async function(next) {
	this.password = await bcrypt.hash(this.password, 10);
	next();
});

module.exports = mongoose.model('User', userSchema);

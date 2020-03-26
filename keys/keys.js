const keypair = require('keypair');
const fs = require('fs');
module.exports = () => {
	return new Promise((resolve, reject) => {
		// ensureFolder('./keys').then(() => {
		/**
		 * Ensure that both the private and public keys
		 * are created, and if not create them both.
		 * Never generate just a single key.
		 */
		try {
			if (!fs.existsSync('keys/private.key') && !fs.existsSync('keys/public_new.key')) {
				console.info('Chaves não existem. Criando as chaves...');
				const pair = keypair([256]);
				// console.info('Public key: ' + pair.public);
				// console.info('Private key: ' + pair.private);
				fs.writeFileSync('keys/public.key', pair.public);
				fs.writeFileSync('keys/private.key', pair.private);
				console.info('Chaves criadas e sendo utilizadas na aplicação.');
				resolve({ private: pair.private, public: pair.public });
			} else {
				console.info('Chaves existentes. Carregando dos arquivos...');
				const public = fs.readFileSync('keys/public.key', 'utf8');
				const private = fs.readFileSync('keys/private.key', 'utf8');
				// console.info('Public key: ' + public);
				// console.info('Private key: ' + private);
				console.info('Chaves carregadas dos arquivos e sendo utilizadas na aplicação.');
				resolve({ private, public });
			}
		} catch (e) {
			console.error('Problema para carregar ou gerar as chaves...', e);
			reject(e);
		}
		// });
	});
};

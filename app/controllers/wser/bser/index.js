let Err = require('../aaIndex/err');
let Language = require('../aaIndex/language');

exports.bser = function(req, res) {
	let crWser = req.session.crWser;
	let Lang = Language.wsLanguage('/wser', '/index', crWser)
	// console.log(Lang);
	res.render('./wser/bser/index/index', {
		title: Lang.title,
		Lang: Lang,
		thisUrl: "/bser",
		crWser : crWser,
	});
}





let QrImage = require('qr-image');
exports.qrCode = function(req, res) {
	let words
	if(req.body.words){
		words = req.body.words
	} else {
		words = "kelinlab.com";
	}
	try {
		let img = QrImage.image(words, {size:10});
		res.writeHead(200, {'Content-Type': 'image/png'});
		img.pipe(res);
	} catch (e) {
		res.writeHead(414, {'Content-Type': 'text/html'});
		res.end('<h1> 414 Request-URI too large</h1>');
	}
}
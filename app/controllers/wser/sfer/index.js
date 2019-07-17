let Err = require('../aaIndex/err')
let Language = require('../aaIndex/language')

exports.sfer = function(req, res) {
	let crWser = req.session.crWser;
	let Lang = Language.wsLanguage('/wser', '/index', crWser)

	res.render('./wser/sfer/index/index', {
		title: Lang.title,
		Lang: Lang,
		thisUrl: "/sfer",
		crWser : req.session.crWser,
	});
}
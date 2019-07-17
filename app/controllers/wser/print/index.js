exports.pter = function(req, res) {
	res.render('./wser/print/index/index', {
		title: 'Invoice',
		thisUrl: "/pter",
		crWser : req.session.crWser,
	});
}
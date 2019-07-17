let AdIndex = require('../controllers/ader/index');
exports.aderIsLogin = function(req, res, next) {
	let crAder = req.session.crAder;
	if(!crAder) {
		info = "需要您的 Administrator 账户,请输入";
		AdIndex.adOptionWrong(req, res, info);
	} else {
		next();
	}
};


let Wser = require('../models/user/wser');
let WsIndex = require('../controllers/wser/bser/index');
exports.singleWsLogin = function(req, res, next){
	let crWser = req.session.crWser;
	Wser.findById(crWser._id, function(err, wser){ 
		if(err) {
			info = "ws判定唯一帐号时, 数据库出错, 请联系管理员";
			WsIndex.bsOptionWrong(req, res, info);
		} else if(!wser) {
			info = "此帐号已经被删除!";
			WsIndex.bsOptionWrong(req, res, info);
		} else {
			let crLog = (new Date(crWser.lgAt)).getTime();
			let atLog = (new Date(wser.lgAt)).getTime();
			if(crLog == atLog){
				next();
			}else{
				res.redirect('/logout');
			}
		} 
	});
};


exports.bserIsLogin = function(req, res, next) {
	let crWser = req.session.crWser;
	if(!crWser || crWser.role != 1) {
		res.redirect('/logout');
	} else {
		next();
	}
};


exports.pterIsLogin = function(req, res, next) {
	let crWser = req.session.crWser;
	if(!crWser || crWser.role != 3) {
		res.redirect('/logout');
	} else {
		next();
	}
};


exports.sferIsLogin = function(req, res, next) {
	let crWser = req.session.crWser;
	if(!crWser || crWser.role != 5) {
		res.redirect('/logout');
	} else {
		next();
	}
};



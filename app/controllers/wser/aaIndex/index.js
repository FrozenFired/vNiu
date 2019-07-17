let Err = require('./err');
let Language = require('./language');
exports.index = function(req, res) {
	// 判断是否登录
	if(req.session.crSfer) delete req.session.crSfer;
	if(req.session.crBser) delete req.session.crBser;
	if(req.session.crPter) delete req.session.crPter;
	// console.log(req.session)
	if(req.session.crWser) {
		let crWser = req.session.crWser
		if(crWser.role == 1) {
			res.redirect('/bser');
		}
		else if(crWser.role == 3) {
			res.redirect('/pter');
		}
		else if(crWser.role == 5) {
			res.redirect('/sfer');
		}
		else {
			delete req.session.crWser;
			info = "登录角色错误，请联系管理员";
			Err.wsError(req, res, info);
		}
	}
	else {
		res.redirect('/login');
	}
}



exports.login = function(req, res) {
	res.render('./aaViews/index/login', {
		title: 'Login',
		action: "/loginUser",
		code: "code",
		pwd: "pwd"
	});
}



let Wser = require('../../../models/user/wser');
let bcrypt = require('bcryptjs');
exports.loginUser = function(req, res) {
	let code = req.body.code.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
	let pwd = String(req.body.pwd).replace(/(\s*$)/g, "").replace( /^\s*/, '');
	if(pwd.length == 0) pwd = " ";

	loginWser(req, res, code, pwd);
}
loginWser = function(req, res, code, pwd) {
	Wser.findOne({code: code}, function(err, object) {
		if(err) console.log(err);
		if(!object){
			info = "用户名不正确，请重新登陆";
			Err.wsError(req, res, info);
		} else{
			bcrypt.compare(pwd, object.pwd, function(err, isMatch) {
				if(err) console.log(err);
				if(isMatch) {
					object.lgAt = Date.now();
					// console.log(object)
					object.save(function(err, objSave){
						if(err) console.log(err)
					})
					req.session.crWser = object;
					if(object.role == 1) {
						res.redirect('/bser');
					} else if(object.role == 3) {
						res.redirect('/pter');
					} else if(object.role == 5) {
						res.redirect('/sfer');
					} else {
						info = "登录角色错误，请联系管理员";
						Err.wsError(req, res, info);
					}
				}
				else {
					info = "用户名与密码不符，请重新登陆";
					Err.wsError(req, res, info);
				}
			})
		}
	})
}

exports.logout = function(req, res) {
	// Wser
	if(req.session.crWser) delete req.session.crWser;
	// Ader
	if(req.session.crAder) delete req.session.crAder;

	res.redirect('/');
}
let Err = require('../aaIndex/err')
let Language = require('../aaIndex/language')

let ObjDB = require('../../../models/user/wser')
let _ = require('underscore')

exports.sferFilter = function(req, res, next) {
	let crWser = req.session.crWser;
	let id = crWser._id;
	if(req.params && req.params.id) id = req.params.id;
	if(crWser._id != id) {
		info = "您无权查看此人信息";
		Err.wsError(req, res, info);
	} else {
		ObjDB.findOne({_id: id})
		.populate('group')
		.exec(function(err, object) {
			if(err) {
				info = "查看公司用户详情，数据库查找时错误, 请联系管理员";
				Err.wsError(req, res, info);
			}else if(!object) {
				info = "此帐号已经被删除";
				Err.wsError(req, res, info);
			}else if(object.role == 1 && object._id != crWser._id) {
				info = "您无权查看此人信息";
				Err.wsError(req, res, info);
			} else {
				req.body.object = object;
				next();
			}
		})
	}
}
exports.sferInfo = function(req, res) {
	let crWser = req.session.crWser;
	let Lang = Language.wsLanguage('/wser', '/wser', crWser)

	let object = req.body.object;
	let objBody = new Object();
	objBody.crWser = crWser;
	objBody.object = object;
	objBody.thisAct = "/sfer";
	objBody.thisTit = "公司用户"
	objBody.Lang = Lang;
	objBody.title = Lang.title;
	res.render('./wser/sfer/wser/detail', objBody)
}


exports.sferUpd = function(req, res) {
	let crWser = req.session.crWser;
	let obj = req.body.obj;
	if(crWser._id == obj._id) {
		ObjDB.findOne({_id: obj._id}, function(err, object) {
			if(err) {
				info = "更新公司用户，公司用户数据库查找时错误, 请联系管理员";
				Err.wsError(req, res, info);
			} else if(!object) {
				info = "您的账户已经被删除，请联系管理员";
				Err.wsError(req, res, info);
			} else {
				if(obj.pwd || obj.pwd == "") {
					prSferPwd(req, res, obj, object);
				} else {
					saveSfer(req, res, obj, object);
				}
			}
		})
	} else {
		info = "您无权修改别人密码";
		Err.wsError(req, res, info);
	}
}
let bcrypt = require('bcryptjs');
prSferPwd = function(req, res, obj, object) {
	obj.pw = obj.pw.replace(/(\s*$)/g, "").replace( /^\s*/, '')
	bcrypt.compare(obj.pw, object.pwd, function(err, isMatch) {
		if(err) console.log(err);
		if(!isMatch) {
			info = "原密码错误，请重新操作";
			Err.wsError(req, res, info);
		}
		else {
			saveSfer(req, res, obj, object);
		}
	});
}
saveSfer = function(req, res, obj, object) {
	let _object = _.extend(object, obj)
	_object.save(function(err, objSave) {
		if(err) {
			info = "更新公司用户时数据库保存数据时出现错误, 请联系管理员"
			Err.wsError(req, res, info);
		} else {
			req.session.crWser = objSave;
			res.redirect("/sferInfo")
		}
	})
}
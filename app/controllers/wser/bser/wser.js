let Err = require('../aaIndex/err')
let Language = require('../aaIndex/language')

let ObjDB = require('../../../models/user/wser')
let Group = require('../../../models/user/wsgp')
let _ = require('underscore')


exports.bsersFilter = function(req, res, next) {
	let crWser = req.session.crWser;
	
	ObjDB.find({'group': crWser.group})
	.populate('group')
	.sort({'role': 1})
	.exec(function(err, objects) {
		if(err) {
			info = "查找公司用户，数据库查找时错误, 请联系管理员";
			Err.wsError(req, res, info);
		} else {
			// objects.unshift(crWser)
			let objBody = new Object();

			objBody.crWser = crWser;
			objBody.objects = objects;

			req.body.objBody = objBody;
			next();
		}
	})
}
exports.bsWsers = function(req, res) {
	let crWser = req.session.crWser;

	let Lang = Language.wsLanguage('/wser', '/wsers', crWser)
	let objBody = req.body.objBody;
	objBody.title = Lang.title;
	objBody.Lang = Lang;
	res.render('./wser/bser/group/wsers', objBody);
}



exports.bserFilter = function(req, res, next) {
	let crWser = req.session.crWser;
	let id = crWser._id;
	if(req.params && req.params.id) id = req.params.id;

	ObjDB.findOne({_id: id})
	.populate('group')
	.exec(function(err, object) {
		if(err) {
			info = "查看公司用户详情，数据库查找时错误, 请联系管理员";
			Err.wsError(req, res, info);
		}else if(!object) {
			info = "此帐号已经被删除";
			Err.wsError(req, res, info);
		}else {
			req.body.object = object;
			next();
		}
	})
}
exports.bsMyInfo = function(req, res) {
	let crWser = req.session.crWser
	let Lang = Language.wsLanguage('/wser', '/wser', crWser)

	let object = req.body.object;
	let objBody = new Object();
	objBody.crWser = crWser;
	objBody.object = object;
	objBody.Lang = Lang;
	objBody.title = Lang.title;
	res.render('./wser/bser/group/wser', objBody)
}




exports.bsWserUpd = function(req, res) {
	let obj = req.body.obj
	if(obj.code) {
		obj.code = obj.code.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
	}
	if(obj.cd) {
		obj.cd = obj.cd.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
	}
	ObjDB.findOne({_id: obj._id}, function(err, object) {
		if(err) {
			info = "更新公司用户，公司用户数据库查找时错误, 请联系管理员";
			Err.wsError(req, res, info);
		} else if(!object) {
			info = "此用户已经被删除";
			Err.wsError(req, res, info);
		} else {
			if(obj.pwd || obj.pwd == "") {
				prWserPwd(req, res, obj, object);
			} else if(obj.code && obj.code != object.code) {
				prWserCode(req, res, obj, object);
			} else if(obj.cd && obj.cd != object.cd) {
				prWserCd(req, res, obj, object);
			} else {
				saveWser(req, res, obj, object);
			}
		}
	})
}
let bcrypt = require('bcryptjs');
prWserPwd = function(req, res, obj, object) {
	let crWser = req.session.crWser;
	if(crWser._id == object._id) {
		obj.pw = obj.pw.replace(/(\s*$)/g, "").replace( /^\s*/, '')
		bcrypt.compare(obj.pw, object.pwd, function(err, isMatch) {
			if(err) console.log(err);
			if(!isMatch) {
				info = "原密码错误，请重新操作";
				Err.wsError(req, res, info);
			}
			else {
				saveWser(req, res, obj, object);
			}
		});
	} else if(object.role != 1) {
		saveWser(req, res, obj, object);
	} else {
		info = "您无权修改此人密码";
		Err.wsError(req, res, info);
	}
}
prWserCode = function(req, res, obj, object) {
	ObjDB.findOne({code: obj.code})
	.where('_id').ne(obj._id)
	.exec(function(err, objSame) {
		if(err) {
			info = "更新公司用户，公司用户数据库查找相同时错误, 请联系管理员";
			Err.wsError(req, res, info);
		} else if(objSame) {
			info = "此用户名已经存在";
			Err.wsError(req, res, info);
		} else {
			if(obj.cd && obj.cd != object.cd) {
				prWserCd(req, res, obj, object);
			} else {
				saveWser(req, res, obj, object);
			}
		}
	})
}
prWserCd = function(req, res, obj, object) {
	if(obj.cd.length != 2) {
		info = "员工代码必须是两位字符，最好是两个字母";
		Err.wsError(req, res, info);
	} else {
		ObjDB.findOne({cd: obj.cd})
		.where('group').eq(obj.group)
		.exec(function(err, objSame) {
			if(err) {
				info = "更新公司用户，公司用户数据库查找相同时错误, 请联系管理员";
				Err.wsError(req, res, info);
			} else if(objSame) {
				info = "公司员工代号已经存在";
				Err.wsError(req, res, info);
			} else {
				saveWser(req, res, obj, object);
			}
		})
	}
}
saveWser = function(req, res, obj, object) {
	let _object = _.extend(object, obj)
	_object.save(function(err, objSave) {
		if(err) {
			info = "更新公司用户时数据库保存数据时出现错误, 请联系管理员"
			Err.wsError(req, res, info);
		} else {
			if(req.session.crWser._id == objSave._id) {
				req.session.crWser = objSave;
			}
			res.redirect("/bsWser/"+objSave._id)
		}
	})
}
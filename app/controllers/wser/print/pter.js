let Err = require('../aaIndex/err');
let Language = require('../aaIndex/language');

let ObjDB = require('../../../models/user/wser')
let _ = require('underscore')

exports.pterFilter = function(req, res, next) {
	let crWser = req.session.crWser;
	let id = crWser._id;
	ObjDB.findOne({_id: id})
	.populate('group')
	.exec(function(err, object) {
		if(err) {
			info = "查看公司用户详情，数据库查找时错误, 请联系管理员";
			Err.wsError(req, res, info);
		} else if(!object) {
			info = "此帐号已经被删除";
			Err.wsError(req, res, info);
		} else {
			req.body.object = object;
			next();
		}
	})
}
exports.pterInfo = function(req, res) {
	let object = req.body.object;
	let objBody = new Object();
	objBody.crWser = req.session.crWser;
	objBody.object = object;
	objBody.thisAct = "/pterInfo";
	objBody.title = "公司用户:"+objBody.object.code;
	res.render('./wser/print/pter/detail', objBody)
}

exports.pterInfoUpd = function(req, res) {
	if(req.body.obj && req.body.obj._id) {
		let obj = req.body.obj;
		ObjDB.findOne({_id: obj._id}, function(err, object) {
			if(err) {
				info = "打印员更新, 数据库错误, 请联系管理员";
				Index.wsOptionWrong(req, res, info);
			} else if(!object) {
				info = "打印员更新， 用户已经被删除";
				Index.wsOptionWrong(req, res, info);
			} 
			else {
				let _object = _.extend(object, obj)
				_object.save(function(err, objSave) {
					if(err) {
						info = "更新公司用户时数据库保存数据时出现错误, 请联系管理员"
						Index.wsOptionWrong(req, res, info);
					} else {
						req.session.crWser = object;
						res.redirect("/pterInfo")
					}
				})
			}
		})
	} else {
		info = "打印员更新 出现错误, 请联系管理员";
		Err.wsError(req, res, info);
	}
}
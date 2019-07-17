let Err = require('../aaIndex/err');
let Language = require('../aaIndex/language');

let ObjDB = require('../../../models/user/wsgp');
let _ = require('underscore');

exports.bsGroupFilter = function(req, res, next) {
	let crWser = req.session.crWser;
	ObjDB.findOne({_id: crWser.group}, function(err, object) {
		if(err) {
			info = "查找公司信息时，数据库错误 请联系管理员";
			Err.wsError(req, res, info);
		} else if(!object) {
			info = "公司信息出现错误，联系管理员";
			Err.wsError(req, res, info);
		} else {
			let objBody = new Object();

			objBody.crWser = req.session.crWser;
			objBody.object = object;
			objBody.thisAct = "/bsGroup";
			objBody.thisTit = "公司信息";

			req.body.objBody = objBody;
			next();
		}
	});
}

exports.bsGroup = function(req, res) {
	let crWser = req.session.crWser;
	let Lang = Language.wsLanguage('/wser', '/group', crWser)
	let objBody = req.body.objBody;
	objBody.title = Lang.title;
	objBody.Lang = Lang;
	// console.log(Lang)
	res.render('./wser/bser/group/detail', objBody);
}


exports.bsGroupUpd = function(req, res) {
	let obj = req.body.obj;
	ObjDB.findOne({_id: obj._id}, function(err, object) {
		if(err) {
			info = "修改公司信息时，数据库错误 请联系管理员";
			Err.wsError(req, res, info);
		} else if(!object) {
			info = "公司信息被删除, 请联系管理员";
			Err.wsError(req, res, info);
		} else {
			let _object = _.extend(object, obj);
			_object.save(function(err, objSave) {
				if(err) {
					info = "修改公司信息时，数据库保存错误 请联系管理员";
					Err.wsError(req, res, info);
				} else {
					res.redirect("/bsGroup");
				}
			});
		}
	});
}


exports.bsColors = function(req, res) {
	let crWser = req.session.crWser;
	ObjDB.findOne({_id: crWser.group}, function(err, object) {
		if(err) {
			info = "查找公司信息时，数据库错误 请联系管理员";
			Err.wsError(req, res, info);
		} else if(!object) {
			info = "公司信息出现错误，联系管理员";
			Err.wsError(req, res, info);
		} else {
			res.render('./wser/bser/group/color', {
				title: '颜色',
				crWser: crWser,
				colors: object.colors
			});
		}
	});
}

exports.bsColorNew = function(req, res) {
	let crWser = req.session.crWser;
	let obj = req.body.obj;
	if(obj.color) obj.color = obj.color.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();

	if(obj.color && obj.color.length>0) {
		ObjDB.findOne({_id: crWser.group}, function(err, object) {
			if(err) {
				info = "查找公司信息时，数据库错误 请联系管理员";
				Err.wsError(req, res, info);
			} else if(!object) {
				info = "公司信息出现错误，联系管理员";
				Err.wsError(req, res, info);
			} else {
				let flag = 0;
				if(object.colors && object.colors.length>0) {
					let colors = object.colors;
					let len = colors.length;
					for(i = 0; i<len; i++) {
						if(obj.color == colors[i]) break;
					}
					if(i==len) {
						flag = 1;
						object.colors.push(obj.color)
					}
				} else {
					flag = 1;
					object.colors = new Array();
					object.colors.push(obj.color)
				}

				if(flag == 1) {
					object.save(function(err, objSave) {
						if(err) console.log(err);
						res.redirect('/bsColors');
					})
				} else {
					res.redirect('/bsColors');
				}
			}
		});
	} else {
		info = "您没有输入颜色";
		Err.wsError(req, res, info);
	}
}

exports.bsColorDelAjax = function(req, res) {
	let crWser = req.session.crWser;
	let color = req.query.color;
	ObjDB.findOne({_id: crWser.group}, function(err, object) {
		if(err) {
			info = "查找公司信息时，数据库错误 请联系管理员";
			Err.wsError(req, res, info);
		} else if(!object || !object.colors) {
			info = "公司信息出现错误，联系管理员";
			Err.wsError(req, res, info);
		} else {
			object.colors.remove(color)
			object.save(function(err, objSave) {
				if(err) {
					res.json({success: 0, info: 'bsColorDelAjax, object.save, Error!'})
				} else {
					res.json({success: 1})
				}
			})
		}
	});
}
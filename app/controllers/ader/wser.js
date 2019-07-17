let Index = require('./index')
let ObjDB = require('../../models/user/wser')
let Group = require('../../models/user/wsgp')
let _ = require('underscore')


exports.adWsersFilter = function(req, res, next) {
	ObjDB.find()
	.populate('group')
	.sort({'group': 1})
	.exec(function(err, objects) {
		if(err) {
			info = "查找批发商用户，数据库查找时错误, 请联系管理员";
			Index.adOptionWrong(req, res, info);
		} else {
			let objBody = new Object();

			objBody.crAder = req.session.crAder;
			objBody.objects = objects;
			objBody.thisAct = "/adWser";
			objBody.thisTit = "批发商用户"

			req.body.objBody = objBody;
			next();
		}
	})
}
exports.adWsers = function(req, res) {
	let objBody = req.body.objBody;
	objBody.title = "批发商用户列表";
	res.render('./ader/wser/list', objBody);
}



exports.adWserFilter = function(req, res, next) {
	let id = req.params.id;
	ObjDB.findOne({_id: id})
	.populate('group')
	.exec(function(err, object) {
		if(err) {
			info = "查看批发商用户详情，数据库查找时错误, 请联系管理员";
			Index.adOptionWrong(req, res, info);
		}else if(!object) {
			info = "此帐号已经被删除";
			Index.adOptionWrong(req, res, info);
		} else {
			req.body.object = object;
			next();
		}
	})
}
exports.adWserDel = function(req, res) {
	let object = req.body.object;
	ObjDB.deleteOne({_id: object.id}, function(err, objRm) {
		if(err) {
			info = "删除批发商用户时，数据删除错误, 请联系管理员";
			Index.adOptionWrong(req, res, info);
		} else {
			res.redirect("/adWsers");
		}
	})
		
}
exports.adWser = function(req, res) {
	let objBody = new Object();
	objBody.object = req.body.object;
	objBody.title = "批发商用户:"+objBody.object.code;
	objBody.crAder = req.session.crAder;
	objBody.thisAct = "/adWser";
	objBody.thisTit = "批发商用户";
	res.render('./ader/wser/detail', objBody);
}



exports.adWserUp = function(req, res) {
	let obj = req.body.obj
	if(obj.code) {
		obj.code = obj.code.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
	}
	if(obj.cd) {
		obj.cd = obj.cd.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
	}
	ObjDB.findOne({_id: obj._id}, function(err, object) {
		if(err) {
			info = "更新批发商用户，批发商用户数据库查找时错误, 请联系管理员";
			Index.adOptionWrong(req, res, info);
		} else if(!object) {
			info = "此用户名已经被删除";
			Index.adOptionWrong(req, res, info);
		} else {
			if(obj.code && obj.code != object.code) {
				adPrWserCode(req, res, obj, object);
			} else if(obj.cd && obj.cd != object.cd) {
				adPrWserCd(req, res, obj, object);
			} else {
				adSaveWser(req, res, obj, object);
			}
		}
	})
}
adPrWserCode = function(req, res, obj, object) {
	ObjDB.findOne({code: obj.code})
	.where('_id').ne(obj._id)
	.exec(function(err, objSame) {
		if(err) {
			info = "更新批发商用户，批发商用户数据库查找相同时错误, 请联系管理员";
			Index.adOptionWrong(req, res, info);
		} else if(objSame) {
			info = "此用户名已经存在";
			Index.adOptionWrong(req, res, info);
		} else {
			if(obj.cd && obj.cd != object.cd) {
				adPrWserCd(req, res, obj, object);
			} else {
				adSaveWser(req, res, obj, object);
			}
		}
	})
}
adPrWserCd = function(req, res, obj, object) {
	if(obj.cd.length != 2) {
		info = "员工代码必须是两位字符，最好是两个字母";
		Index.adOptionWrong(req, res, info);
	} else {
		ObjDB.findOne({cd: obj.cd})
		.where('group').eq(obj.group)
		.exec(function(err, objSame) {
			if(err) {
				info = "更新批发商用户，批发商用户数据库查找相同时错误, 请联系管理员";
				Index.adOptionWrong(req, res, info);
			} else if(objSame) {
				info = "公司员工代号已经存在";
				Index.adOptionWrong(req, res, info);
			} else {
				adSaveWser(req, res, obj, object);
			}
		})
	}
}
adSaveWser = function(req, res, obj, object) {
	let _object = _.extend(object, obj)
	_object.save(function(err, objSave) {
		if(err) {
			info = "更新批发商用户时数据库保存数据时出现错误, 请联系管理员"
			Index.adOptionWrong(req, res, info);
		} else {
			res.redirect("/adWser/"+objSave._id)
		}
	})
}



exports.adWserAdd =function(req, res) {
	Group.find(function(err, groups) {
		if(err) {
			info = "添加批发商用户页面时，数据库批发商公司查找错误, 请联系管理员";
			Index.adOptionWrong(req, res, info);
		} else if(groups && groups.length > 0) {
			res.render('./ader/wser/add', {
				title: 'Add 批发商用户',
				crAder : req.session.crAder,
				thisAct : "/adWser",
				thisTit : "批发商用户",
				groups: groups,
			})
		} else {
			info = "请先添加批发商公司";
			Index.adOptionWrong(req, res, info);
		}
	})
}


exports.adWserNew = function(req, res) {
	let obj = req.body.obj;
	let info;
	if(obj.cd) {
		obj.cd = obj.cd.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
		if(obj.cd.length != 2) {info = "员工代码必须是两位字符，最好是两位字母";}
	} else {
		info = "员工代码必须是两位字符，最好是两位字母";
	}
	if(obj.code) {
		obj.code = obj.code.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
		if(obj.code.length < 2) {info = "用户帐号必须大于2个字符";}
	} else {
		info = "用户帐号必须大于2个字符";
	}
	if(info && info.length > 0) {
		Index.adOptionWrong(req, res, info);
	} else {
		ObjDB.findOne({code: obj.code}, function(err, objSame) {
			if(err) {
				info = "添加批发商用户时，数据库查找错误, 请联系管理员";
				Index.adOptionWrong(req, res, info);
			} else if(objSame) {
				info = "此帐号已经被注册，请重新注册";
				Index.adOptionWrong(req, res, info);
			} else {
				ObjDB.findOne({group: obj.group, cd: obj.cd}, function(err, objSame) {
					if(err) {
						info = "添加批发商用户时，数据库查找错误, 请联系管理员";
						Index.adOptionWrong(req, res, info);
					} else if(objSame) {
						info = "公司员工代号已经存在";
						Index.adOptionWrong(req, res, info);
					} else {
						let _object = new ObjDB(obj)
						_object.save(function(err, objSave){
							if(err) {
								info = "添加批发商用户时，数据库保存错误, 请联系管理员";
								Index.adOptionWrong(req, res, info);
							} else {
								res.redirect('/adWsers')
							}
						})
					}
				})
			}
		})
	}
}



exports.adWserDelAjax = function(req, res) {
	let id = req.query.id;
	ObjDB.findOne({_id: id}, function(err, object){
		if(err) {
			res.json({success: 0, info: "删除批发商用户时，数据库查找错误, 请联系管理员"});
		} else if(!object){
			res.json({success: 0, info: "已被删除，按F5刷新页面查看"});
		} else {
			ObjDB.deleteOne({_id: id}, function(err, objRm) {
				if(err) {
					res.json({success: 0, info: "删除批发商用户时，数据删除错误, 请联系管理员"});
				} else {
					res.json({success: 1});
				}
			})
		}
	})
}

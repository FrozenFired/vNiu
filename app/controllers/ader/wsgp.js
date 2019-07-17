let Index = require('./index')
let ObjDB = require('../../models/user/wsgp')
let User = require('../../models/user/wser')
let _ = require('underscore')



exports.adWsgpsFilter = function(req, res, next) {
	ObjDB.find()
	.exec(function(err, objects) {
		if(err) {
			info = "admin查找批发公司列表时数据库错误, 请联系管理员";
			Index.adOptionWrong(req, res, info);
		} else {
			let objBody = new Object();

			objBody.crAder = req.session.crAder;
			objBody.objects = objects;
			objBody.thisAct = "/adWsgp";
			objBody.thisTit = "批发商公司"

			req.body.objBody = objBody;
			next();
		}
	})
}
exports.adWsgps = function(req, res) {
	let objBody = req.body.objBody;
	objBody.title = "批发公司列表"
	res.render('./ader/wsgp/list', objBody);
}



exports.adWsgpFilter = function(req, res, next) {
	let id = req.params.id;
	ObjDB.findOne({_id: id}, function(err, object) {
		if(err) {
			info = "ad查找批发公司详情时, 数据库错误, 请联系管理员";
			Index.adOptionWrong(req, res, info);
		} else if(!object) {
			info = "这个批发商公司已经被删除";
			Index.adOptionWrong(req, res, info);
		} else {
			

			req.body.object = object;
			next();
		}
	})
}
exports.adWsgpDel = function(req, res) {
	let object = req.body.object;
	let id = object._id;
	User.find({group: id}, function(err, users) {
		if(err) {
			info = "删除批发商公司时，批发商用户查找错误, 请联系管理员";
			Index.adOptionWrong(req, res, info);
		} else if(users && users.length > 0) {
			info = "此公司中还有员工，请先删除此公司的员工";
			Index.adOptionWrong(req, res, info);
		} else {
			ObjDB.deleteOne({_id: id}, function(err, objRm) {
				if(err) {
					info = "删除公司时数据库保存出现错误, 请联系管理员";
					Index.adOptionWrong(req, res, info);
				} else {
					res.redirect("/adWsgps");
				}
			})
		}
	})
}
exports.adWsgp = function(req, res) {
	let object = req.body.object;

	let objBody = new Object();

	objBody.crAder = req.session.crAder;
	objBody.object = object;
	objBody.title = "批发商公司";
	objBody.thisAct = "/adWsgp";
	objBody.thisTit = "批发商公司";

	User.find({group: object._id}, function(err, users) {
		if(err) {
			info = "查看批发商公司时，批发商用户查找错误, 请联系管理员"
			Index.adOptionWrong(req, res, info);
		} else {
			objBody.users = users;
			objBody.userAct = "/adWser"
			res.render('./ader/wsgp/detail', objBody)
		}
	})
}



exports.adWsgpUp = function(req, res) {
	let obj = req.body.obj
	obj.code = obj.code.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
	ObjDB.findOne({_id: obj._id}, function(err, object) {
		if(err) {
			info = "更新批发商公司时数据库查找出现错误, 请联系管理员"
			Index.adOptionWrong(req, res, info);
		} else if(!object) {
			info = "此公司已经被删除，请刷新查看";
			Index.adOptionWrong(req, res, info);
		} else {
			ObjDB.findOne({code: obj.code})
			.where('_id').ne(obj._id)
			.exec(function(err, objSame) {
				if(err) {
					info = "更新批发商公司时数据库查找相同名称时出现错误, 请联系管理员"
					Index.adOptionWrong(req, res, info);
				} else if(objSame) {
					info = "已经有这个名字的批发商公司"
					Index.adOptionWrong(req, res, info);
				} else {
					let _object = _.extend(object, obj)
					_object.save(function(err, objSave) {
						if(err) {
							info = "更新批发商公司时数据库保存数据时出现错误, 请联系管理员"
							Index.adOptionWrong(req, res, info);
						} else {
							res.redirect("/adWsgp/"+objSave._id)
						}
					})
				}
			})
		}
	})
}



exports.adWsgpAdd =function(req, res) {
	res.render('./ader/wsgp/add', {
		title: 'Add 批发商公司',
		crAder : req.session.crAder,
		thisAct : "/adWsgp",
		thisTit : "批发商公司",
	})
}


exports.adWsgpNew = function(req, res) {
	let obj = req.body.obj;
	obj.code = obj.code.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
	ObjDB.findOne({code: obj.code}, function(err, objSame) {
		if(err) {
			info = "添加批发商公司时 数据库查找错误, 请联系管理员";
			Index.adOptionWrong(req, res, info);
		} else if(objSame) {
			info = "此公司帐号已经存在";
			Index.adOptionWrong(req, res, info);
		} else {
			let _object = new ObjDB(obj)
			_object.save(function(err, objSave){
				if(err) {
					info = "添加批发商公司时 数据库保存错误, 请联系管理员";
					Index.adOptionWrong(req, res, info);
				} else {
					res.redirect('/adWsgps')
				}
			})
		}
	})
}



exports.adWsgpDelAjax = function(req, res) {
	let id = req.query.id;
	ObjDB.findOne({_id: id}, function(err, object){
		if(err) {
			res.json({success: 0, info: "删除公司时数据库查找出现错误, 请联系管理员"});
		} else if(!object){
			res.json({success: 0, info: "已被删除，按F5刷新页面查看"});
		} else {
			User.find({group: id}, function(err, users) {
				if(err) {
					res.json({success: 0, info: "删除公司时数据库批发商员工查找出现错误, 请联系管理员"});
				} else if(users && users.length > 0) {
					res.json({success: 0, info: "此公司中还有员工，请先删除此公司的员工"});
				} else {
					ObjDB.deleteOne({_id: id}, function(err, objRm) {
						if(err) {
							res.json({success: 0, info: "删除公司时数据库保存出现错误, 请联系管理员"});
						} else {
							res.json({success: 1});
						}
					})
				}
			})
		}
	})
}

let Err = require('../aaIndex/err');
let Language = require('../aaIndex/language');

let MdPicture = require('../../../middle/middlePicture');
let Conf = require('../../../confile/conf');

let Arrear = require('../../../models/matter/arrear');
let Fter = require('../../../models/user/fter');

let _ = require('underscore');


exports.bsArrears = function(req, res) {
	let crWser = req.session.crWser;
	let Lang = Language.wsLanguage('/wser', '/arrears', crWser);

	let sortCond = req.query.sortCond || 'fter';
	let sortVal = req.query.sortVal || 1;
	Arrear.countDocuments({'group': crWser.group})
	.exec(function(err, count) {
		if(err) console.log("bsArrears, Arrear.countDocuments, Error!");

		let objBody = new Object()

		objBody.title = Lang.title+'('+count+')'; 
		objBody.Lang = Lang; 
		objBody.crWser = req.session.crWser;
		objBody.count = count;

		objBody.thisAct = "/bsArrear";
		objBody.sortCond = sortCond;
		objBody.sortVal = sortVal;
		objBody.skip = 0;

		res.render('./wser/bser/arrear/list', objBody);
	})
}

exports.bsArrearsAjax = function(req, res) {
	let crWser = req.session.crWser;
	let sortCond = 'code';
	if(req.query.sortCond) sortCond = req.query.sortCond;

	let sortVal = 1;
	if(req.query.sortVal && !isNaN(parseInt(req.query.sortVal))) {
		sortVal = parseInt(req.query.sortVal);
	}

	let skip = 0;
	if(req.query.skip && !isNaN(parseInt(req.query.skip))) {
		skip = parseInt(req.query.skip)
	}
	
	Arrear.countDocuments({'group': crWser.group}, function(err, keyCount) {
		if(err) {
			res.json({success: 0, info: "bsArrearsAjax, Arrear.countDocuments, Error"})
		} else {
			Arrear.find({'group': crWser.group})
			.populate('fter', 'nome')
			.sort({[sortCond]: sortVal})
			.skip(skip)
			.limit(6)
			.exec(function(err, objects) { if(err) {
				res.json({success: 0, info: "bs查找订单时, 订单数据库错误, 请联系管理员"})
			} else {
				res.json({success: 1, objects: objects, keyCount: keyCount})
			} })
		}
	})
}



exports.bsArrearFilter = function(req, res, next) {
	let crWser = req.session.crWser;
	let id = req.params.id
	Arrear.findOne({_id: id, 'group': crWser.group})
	.populate('fter')
	.exec(function(err, object) { if(err) {
		info = "bs查看欠款时, 欠款数据库查找错误, 请联系管理员";
		Err.wsError(req, res, info);
	} else if(!object) {
		info = "此欠款已经被删除";
		Err.wsError(req, res, info);
	} else {
		req.body.object = object;
		next();
	} })
}
exports.bsArrear = function(req, res) {
	let crWser = req.session.crWser;
	let Lang = Language.wsLanguage('/wser', '/arrear', crWser);
	let objBody = new Object();
	objBody.object = req.body.object;
	objBody.title = Lang.title;
	objBody.Lang = Lang;
	objBody.crWser = crWser;
	objBody.thisAct = "/bsArrear";

	res.render('./wser/bser/arrear/detail', objBody);
}
exports.bsArrearDel = function(req, res) {
	let object = req.body.object;
	let arrearId = object._id;
	let fterId = object.fter;
	let orgPhoto = object.photo;
	MdPicture.deleteOldPhoto(orgPhoto, Conf.photoPath.arrPhoto)
	Arrear.deleteOne({_id: object._id}, function(err, objRm) { if(err) {
		info = "bs删除欠款时, 欠款数据库删除错误, 请联系管理员";
		Err.wsError(req, res, info);
	} else {
		if(fterId) {
			Fter.findOne({_id: fterId}, function(err, fter) {
				if(err) console.log(err);
				if(fter && fter.arrears) {
					fter.arrears.remove(arrearId);
					fter.save(function(err, fterSave) {
						if(err) console.log(err);
					})
				}
			})
		}
		res.redirect('/bsArrears')
	} })
}




exports.bsArrearUpd = function(req, res) {
	let crWser = req.session.crWser;
	let obj = req.body.obj
	if(obj.code) obj.code= obj.code.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
	if(obj.unpaidFloat) {
		if(!isNaN(parseFloat(obj.unpaidFloat)) ){
			obj.unpaid= parseFloat(obj.unpaidFloat);
		} else {
			obj.unpaid = 0;
		}
	}
	// 如果没有修改，系统肯定判断到有这个名字，所以要加上 -id != this._id
	Arrear.findOne({_id: obj._id, 'group': crWser.group}, function(err, object) { if(err) {
		info = "bs更新欠款时, 欠款数据库查看错误, 请联系管理员";
		Err.wsError(req, res, info);
	} else if(!object) {
		info = "此欠款已经被删除";
		Err.wsError(req, res, info);
	} else {
		let _object
		_object = _.extend(object, obj)
		_object.save(function(err, objSave){
			if(err) console.log(err);
			if(req.body.backUrl) {
				res.redirect(req.body.backUrl)
			} else {
				res.redirect('/bsArrear/'+objSave._id)
			}
		})
	} })
}



exports.bsArrearAdd =function(req, res) {
	let crWser = req.session.crWser;
	let Lang = Language.wsLanguage('/wser', '/arrearAdd', crWser);
	let fterId = req.query.fter;

	Fter.findOne({_id: fterId}, function(err, fter) { if(err) {
		info = "bs创建欠款Add时, 客户信息查找错误, 请联系管理员";
		Err.wsError(req, res, info);
	} else {
		res.render('./wser/bser/arrear/add', {
			title: Lang.title,
			Lang: Lang,
			crWser : crWser,
			thisAct: "/bsArrear",

			fter: fter,
		});
	} })
}


exports.bsArrearNew = function(req, res) {
	let crWser = req.session.crWser;
	let obj = req.body.obj
	obj.group = crWser.group;

	if(obj.unpaid && !isNaN(parseFloat(obj.unpaid))) {
		obj.unpaid = parseFloat(obj.unpaid);
	}
	if(obj.creation) {
		obj.creation = new Date(obj.creation);
	}
	let _arrear = new Arrear(obj);
	_arrear.save(function(err, arrearSave) { if(err) {
		info = "bs创建欠款New时, 欠款保存错误, 请联系管理员";
		Err.wsError(req, res, info);
	} else {
		Fter.findOne({_id: obj.fter}, function(err, fter) { if(err) {
			info = "bs创建欠款New时, 客户查找数据库错误, 请联系管理员";
			Err.wsError(req, res, info);
		} else if(!fter) {
			info = "bs创建欠款New时, 客户查找错误, 请联系管理员";
			Err.wsError(req, res, info);
		} else {
			fter.arrears.push(_arrear._id);
			fter.save(function(err, fterSave) { if(err) {
				info = "bs创建欠款New时, 客户保存错误, 请联系管理员";
				Err.wsError(req, res, info);
			} else {
				res.redirect('/bsFter/'+fterSave._id)
			} })
		} })
	} })
		
}






exports.bsArrearDelAjax = function(req, res) {
	let crWser = req.session.crWser;
	let id = req.query.id
	Arrear.findOne({_id: id, 'group': crWser.group}, function(err, object){
		if(err) console.log(err);
		if(object){
			let arrearId = object._id;
			let fterId = object.fter;
			let orgPhoto = object.photo;
			Arrear.deleteOne({_id: arrearId}, function(err, objRm) { if(err) {
				res.json({success: 0, info: "bs删除欠款时, 欠款数据库删除错误, 请联系管理员"})
			} else {
				MdPicture.deleteOldPhoto(orgPhoto, Conf.photoPath.arrPhoto)
				if(fterId) {
					Fter.findOne({_id: fterId}, function(err, fter) {
						if(err) console.log(err);
						if(fter && fter.arrears) {
							fter.arrears.remove(arrearId);
							fter.save(function(err, fterSave) {
								if(err) console.log(err);
							})
						}
					})
				}
				res.json({success: 1});
			} })
		} else {
			res.json({success: 0, info: "已被删除，按F5刷新页面查看"})
		}
	})
}
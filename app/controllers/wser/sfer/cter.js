let Err = require('../aaIndex/err');
let Language = require('../aaIndex/language');

let Cter = require('../../../models/user/cter');
let Order = require('../../../models/matter/order');

let _ = require('underscore');

exports.sfCters = function(req, res) {
	let crWser = req.session.crWser;
	let Lang = Language.wsLanguage('/wser', '/cters', crWser);

	let sortCond = req.query.sortCond || 'code';
	let sortVal = req.query.sortVal || 1;
	Cter.countDocuments({'group': crWser.group})
	.exec(function(err, count) {
		if(err) console.log("sfCters, Cter.countDocuments, Error!");

		let objBody = new Object()

		objBody.title = Lang.title+'('+count+')'; 
		objBody.Lang = Lang; 
		objBody.crWser = req.session.crWser;
		objBody.count = count;

		objBody.thisAct = "/sfCter";
		objBody.sortCond = sortCond;
		objBody.sortVal = sortVal;
		objBody.skip = 0;

		res.render('./wser/sfer/cter/list', objBody);
	})
}

exports.sfCtersAjax = function(req, res) {
	let crWser = req.session.crWser;

	let keySymb = '$ne';
	let keyword = ' x '
	if(req.query.keyword) {
		keySymb = '$in';
		keyword = String(req.query.keyword);
		keyword = keyword.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
		keyword = new RegExp(keyword + '.*');
	}
	
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
	
	Cter.countDocuments({
		'group': crWser.group,
		$or:[
			{'code': {[keySymb]: keyword}},
			{'nome': {[keySymb]: keyword}},
		],
	}, function(err, keyCount) {
		if(err) {
			res.json({success: 0, info: "sfCtersAjax, ObjDB.countDocuments, Error"})
		} else {
			Cter.find({
				'group': crWser.group,
				$or:[
					{'code': {[keySymb]: keyword}},
					{'nome': {[keySymb]: keyword}},
				],
			})
			.sort({[sortCond]: sortVal})
			.skip(skip)
			.limit(12)
			.exec(function(err, objects) { if(err) {
				res.json({success: 0, info: "sfCtersAjax, ObjDB.find, Error"})
			} else {
				res.json({success: 1, objects: objects, keyCount: keyCount})
			} })
		}
	})
}



exports.sfCterFilter = function(req, res, next) {
	let crWser = req.session.crWser;
	let id = req.params.id
	Cter.findOne({_id: id, 'group': crWser.group})
	.populate({path:'bills', populate: {path: 'order'} })
	.exec(function(err, object) { if(err) {
		info = "sfCterFilter, Cter.findOne, Error!";
		Err.wsError(req, res, info);
	} else if(!object) {
		info = "此客户已经被删除";
		Err.wsError(req, res, info);
	} else {
		req.body.object = object;
		next();
	} })
}
exports.sfCter = function(req, res) {
	let crWser = req.session.crWser;
	let Lang = Language.wsLanguage('/wser', '/cter', crWser);

	let objBody = new Object();
	objBody.object = req.body.object;
	// console.log(objBody.object)
	objBody.title = Lang.title;
	objBody.Lang = Lang;
	objBody.crWser = crWser;
	objBody.thisAct = "/sfCter";

	res.render('./wser/sfer/cter/detail', objBody);
}




exports.sfCterAdd =function(req, res) {
	let crWser = req.session.crWser;
	let Lang = Language.wsLanguage('/wser', '/cterAdd', crWser);

	Cter.countDocuments({'group': crWser.group}, function(err, count) { if(err) {
		info = "sfCterAdd, Cter.countDocuments, Error!";
		Err.wsError(req, res, info);
	} else {
		count = count +1;
		for(let len = (count + "").length; len < 4; len = count.length) { // 序列号补0
			count = "0" + count;            
		}
		let code = count;
		let orderId = req.query.order;
		res.render('./wser/sfer/cter/add', {
			title: Lang.title,
			Lang: Lang,
			crWser : req.session.crWser,
			code: code,
			orderId: orderId,
			thisAct: "/sfCter",
		});
	} })
}


exports.sfCterNew = function(req, res) {
	let crWser = req.session.crWser;
	let obj = req.body.obj

	if(obj.code) {
		obj.code= obj.code.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
	} else {
		obj.code = 'NON';
	}
	if(obj.nome) obj.nome = obj.nome.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
	if(obj.iva) obj.iva= obj.iva.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();

	obj.group = crWser.group;
	Cter.findOne({'group': crWser.group, nome: obj.nome}, function(err, objSm) {
		if(err) {
			info = "sfCterNew, Cter.findOne, Error!";
			Err.wsError(req, res, info);
		} else if(objSm) {
			info = "已经有了此名字, 请换个名字！";
			Err.wsError(req, res, info);
		} else {
			let _cter = new Cter(obj);
			_cter.save(function(err, cterSave) { if(err) {
				info = "sfCterNew, _cter.save, Error!";
				Err.wsError(req, res, info);
			} else {
				if(obj.order) {
					let orderId = obj.order;
					Order.findOne({_id: orderId}, function(err, order) { if(err) {
						info = "sfCterNew, Order.findOne, Error!";
						Err.wsError(req, res, info);
					} else if(!order) {
						info = "相应订单已被删除，请重新操作";
						Err.wsError(req, res, info);
					} else {
						order.cter = cterSave._id;
						order.save(function(err, orderSave) {
							if(err) console.log(err);
							res.redirect('/sfOrder/'+orderId)
						})
					} })
					
				} else {
					res.redirect('/sfCter/'+cterSave._id)
				}
			} })
		}
	})
		
}

exports.sfCterUpd = function(req, res) {
	let crWser = req.session.crWser;
	let obj = req.body.obj
	if(obj.code) obj.code= obj.code.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
	if(obj.nome) obj.nome= obj.nome.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();

	Cter.findOne({_id: obj._id, 'group': crWser.group})
	.exec(function(err, object) {
		if(err) {
			info = "sfCterUpd, Cter.findOne, Error!";
			Err.wsError(req, res, info);
		} else if(!object) {
			info = "deleted! refresh Page!";
			Err.wsError(req, res, info);
		} else {
			Cter.findOne({'nome': obj.nome, 'group': crWser.group})
			.where('_id').ne(obj._id)
			.exec(function(err, objExist) {
				if(err) {
					info = "sfCterUpd, Cter.findOne, Error!";
					Err.wsError(req, res, info);
				} else if(objExist) {
					info = "已经有了此名字！";
					Err.wsError(req, res, info);
				} else {
					let _object
					_object = _.extend(object, obj)
					_object.save(function(err, objSave){
						if(err) console.log(err);
						res.redirect('/sfCter/'+objSave._id);
					})
				}
			})
		} 
	})
}


exports.ajaxSfCterAdd = function(req, res) {
	let crWser = req.session.crWser;
	let keytype = req.query.keytype
	let keyword = req.query.keyword
	keyword = String(keyword).replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
	Cter.findOne({
		'group': crWser.group,
		[keytype]: keyword
	})
	.exec(function(err, object){
		if(err) {
			res.json({success: 0, info: "ajaxSfCterAdd, Cter.findOne, Error!"});
		} else if(object){
			res.json({ success: 1, object: object})
		} else {
			res.json({success: 0})
		}
	})
}
exports.ajaxSfCterUp = function(req, res) {
	let crWser = req.session.crWser;
	let id = req.query.id
	let keytype = req.query.keytype
	let keyword = req.query.keyword
	keyword = String(keyword).replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
	Cter.findOne({
		'group': crWser.group,
		[keytype]: keyword
	})
	.where('_id').ne(id)
	.exec(function(err, object){
		if(err) {
			res.json({success: 0, info: "ajaxSfCterUp, Cter.findOne, Error!"});
		} else if(object){
			res.json({ success: 1, object: object})
		} else {
			res.json({success: 0})
		}
	})
}

exports.ajaxSfCters = function(req, res) {
	let crWser = req.session.crWser;
	let keytype = req.query.keytype
	let keyword = req.query.keyword
	keyword = String(keyword).replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
	Cter.find({
		'group': crWser.group,
		$or:[
			{'code': new RegExp(keyword + '.*')},
			{'nome': new RegExp(keyword + '.*')},
		]
	})
	.limit(20)
	.exec(function(err, cters){
		if(err) {
			res.json({success: 0, info: "sf获取客户列表时，数据库查找错误, 请联系管理员"});
		} else if(cters){
			res.json({ success: 1, cters: cters})
		} else {
			res.json({success: 0})
		}
	})
}

exports.ajaxSfCterAll = function(req, res) {
	let crWser = req.session.crWser;
	Cter.find({'group': crWser.group})
	.limit(20)					// 防止客户太多 添加订单时 初始化所有客户时堵塞，并且客户太多必须精准查询
	.exec(function(err, cters){
		if(err) console.log(err);
		if(cters){
			res.json({ success: 1, cters: cters})
		} else {
			res.json({success: 0})
		}
	})
}
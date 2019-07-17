let Err = require('../aaIndex/err')
let Language = require('../aaIndex/language')

let ObjDB = require('../../../models/matter/road');
let Order = require('../../../models/matter/order');
let Wser = require('../../../models/user/wser');

let _ = require('underscore')

let moment = require('moment')

exports.bsRoads = function(req, res) {
	let crWser = req.session.crWser;
	let Lang = Language.wsLanguage('/wser', '/roads', crWser);

	ObjDB.countDocuments({'group': crWser.group})
	.exec(function(err, count) {
		if(err) console.log("bsRoads, ObjDB.countDocuments, Error");

		let objBody = new Object()

		objBody.title = Lang.title+ '('+count+')'; 
		objBody.Lang = Lang; 
		objBody.crWser = req.session.crWser;
		objBody.count = count;

		objBody.thisAct = "/bsRoad";
		objBody.skip = 0;

		res.render('./wser/bser/road/list', objBody);
	})
}

exports.bsRoadsAjax = function(req, res) {
	let crWser = req.session.crWser;

	let keySymb = '$ne';
	let keyword = null
	if(req.query.keyword) {
		keySymb = '$eq';
		keyword = parseInt(req.query.keyword);
		if(isNaN(keyword)) keyword = null;
	}

	let skip = 0;
	if(req.query.skip && !isNaN(parseInt(req.query.skip))) {
		skip = parseInt(req.query.skip)
	}
	ObjDB.countDocuments({
		'group': crWser.group,
		'code': {[keySymb]: keyword},
	}, function(err, keyCount) {
		if(err) {
			res.json({success: 0, info: "bsProdsAjax, ObjDB.countDocuments, Error"})
		} else {
			// console.log(keyCount)
			ObjDB.find({
				'group': crWser.group,
				'code': {[keySymb]: keyword},
			})
			.sort({'ctAt': -1})
			.skip(skip)
			.limit(6)
			.exec(function(err, roads) { if(err) {
				res.json({success: 0, info: "bsProdsAjax, ObjDB.find, Error"})
			} else {
				// console.log(roads)
				res.json({success: 1, roads: roads, keyCount: keyCount})
			} })
		}
	})
}



exports.bsRoadFilter = function(req, res, next) {
	let id = req.params.id
	ObjDB.findOne({_id: id})
	.populate('group')
	.populate('order')
	.exec(function(err, object) { if(err) {
		info = "bs查看路单时, 路单数据库错误, 请联系管理员";
		Err.wsError(req, res, info);
	} else if(!object) {
		info = "数据已经被删除，请刷新查看";
		Err.wsError(req, res, info);
	} else if(!object.group){
		info = "bs查看路单时, 本公司数据不存在, 请联系管理员";
		Err.wsError(req, res, info);
	} else {
		req.body.object = object;
		next()
	} })
}

exports.bsRoad = function(req, res) {
	let crWser = req.session.crWser;
	let Lang = Language.wsLanguage('/wser', '/road', crWser);

	let object = req.body.object;
	// console.log(object)
	let objBody = new Object();
	objBody.object = object;
	objBody.group = object.group;
	objBody.title = Lang.title;
	objBody.Lang = Lang;
	objBody.crWser = crWser;
	objBody.thisAct = "/bsRoad";

	res.render('./wser/bser/road/detail', objBody);
}

exports.bsRoadUp = function(req, res) {
	let crWser = req.session.crWser;
	let Lang = Language.wsLanguage('/wser', '/roadUp', crWser);
	let object = req.body.object;

	let objBody = new Object();
	objBody.object = object;
	objBody.group = object.group;
	objBody.title = Lang.title;
	objBody.Lang = Lang;
	objBody.crWser = crWser;
	objBody.thisAct = "/bsRoad";
	objBody.thisUrl = "/bsRoadUp";

	res.render('./wser/bser/road/update', objBody);
}


exports.bsRoadDel = function(req, res) {
	let crWser = req.session.crWser;

	let object = req.body.object;
	ObjDB.deleteOne({_id: object._id}, function(err, roadRm) { if(err) {
		info = "删除路单时, 数据删除错误, 请联系管理员";
		Err.wsError(req, res, info);
	} else {
		res.redirect("/bsRoads");
	} })
}
exports.bsRoadUpd = function(req, res) {
	let crWser = req.session.crWser;
	let obj = req.body.obj;

	ObjDB.findOne({_id: obj._id}, function(err, road) { if(err) {
		info = "更新路单时, 查找数据库错误, 请联系管理员";
		Err.wsError(req, res, info);
	} else if(!road) {
		info = "此路单已经被删除，返回销售记录查看";
		Err.wsError(req, res, info);
	} else if(road.group != crWser.group) {
		info = "您不可以更改非本公司路单, 请联系管理员";
		Err.wsError(req, res, info);
	} else {
		let _road = _.extend(road, obj)
		_road.save(function(err, objSave) {
			if(err) {
				// console.log(err)
				info = "更新路单时, 数据保存错误, 请联系管理员";
				Err.wsError(req, res, info);
			} else {
				res.redirect('/bsRoad/'+objSave._id);
			}
		})
	} })

}



exports.bsRoadAdd =function(req, res) {
	let crWser = req.session.crWser;
	let Lang = Language.wsLanguage('/wser', '/roadAdd', crWser);

	let orderId = req.query.orderId;
	if(!orderId) orderId = null;	// 路单中的订单为空（这个没关系）
	
	Order.findOne({_id: orderId})
	.populate('cter')
	.exec(function(err, objOrder) {
		if(err) {
			console.log(err);
			info = "bsRoadAdd Order.findOne Error, 您做了不正确的操作，请重试，或者联系管理员";
			Err.wsError(req, res, info);
		} else {
			let order = new Object(), cter = new Object();
			if(objOrder) {
				order = objOrder;
				if(order.cter) {
					cter = order.cter;
				}
			}

			ObjDB.find()
			.sort({"ctAt": -1})
			.limit(1)
			.exec(function(err, roads) {
				if(err) console.log(err);
				let code = 1;
				if(roads && roads.length == 1) {
					code = roads[0].code + 1;
				}
				res.render('./wser/bser/road/add', {
					title: Lang.title,
					Lang: Lang,
					crWser : req.session.crWser,
					code: code,
					order: order,

					cter: cter,
					thisUrl: "/bsRoadAdd",
					thisAct: "/bsRoad",
				})
			})
		}
	} )

}
exports.bsRoadNew = function(req, res) {
	let crWser = req.session.crWser;
	let obj = req.body.obj;
	obj.group = crWser.group;
	let _road = new ObjDB(obj)
	_road.save(function(err, objSave) {
		if(err) {
			console.log(err);
			info = "bsRoadNew, _road.save, Error";
			Err.wsError(req, res, info);
		} else {
			res.redirect('/bsRoad/'+objSave._id);
		}
	})	
}



exports.bsRoadDelAjax = function(req, res) {
	let crWser = req.session.crWser;

	let id = req.query.id;
	ObjDB.findOne({_id: id}, function(err, road){ if(err) {
		res.json({success: 0, info: "删除路单时, 查找数据库错误, 请联系管理员"})
	} else if(!road){
		res.json({success: 0, info: "此路单已经被删除"})
	} else if(road.group != crWser.group){
		res.json({success: 0, info: "您不可以删除非本公司路单, 请联系管理员"})
	} else {
		ObjDB.deleteOne({_id: road._id}, function(err, roadRm) { if(err) {
			res.json({success: 0, info: "删除路单时, 数据删除错误, 请联系管理员"})
		} else {
			res.json({success: 1})
		} })
	} })
}


exports.bsRoadPrinting = function(req, res) {
	let id = req.query.id
	let newPrint = req.query.newPrint;
	ObjDB.findOne({_id: id}, function(err, object){
		if(err) console.log(err);
		if(object){
			object.printing = parseInt(newPrint);
			object.save(function(err,objSave) {
				if(err) console.log(err);
				res.json({success: 1, info: "已经更改"});
			})
		} else {
			res.json({success: 0, info: "已被删除，按F5刷新页面查看"});
		}
	})
}
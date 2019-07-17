let Err = require('../aaIndex/err');
let Language = require('../aaIndex/language');

let ObjDB = require('../../../models/matter/order');
let Mber = require('../../../models/user/wser');

let _ = require('underscore')

let moment = require('moment')

exports.ptAutoPr = function(req, res, next) {
	let crWser = req.session.crWser;
	// 第一步 找到需要打印的订单
	ObjDB.find({'group': crWser.group})
	.where('printing').eq(true)
	.populate('group')
	.populate('cter')
	.sort({"ctAt": 1})
	.exec(function(err, printings) { if(err) {
		info = "pt自动打印时, 数据库错误, 请联系管理员";
		Err.wsError(req, res, info);
	} else {
		// 如果找到打印的订单
		if(printings.length > 0) {
			req.body.object = printings[0];
			next();
		} 

		// 如果没有找到打印的订单
		else {
			// 第二步 查找最新订单
			ObjDB.find({'group': crWser.group})
			.populate('group')
			.populate('cter')
			.populate('bill')
			.sort({"ctAt": -1})
			.limit(1)
			.exec(function(err, objects) { if(err) {
				info = "pt自动打印时, 数据库错误, 请联系管理员";
				Err.wsError(req, res, info);
			} else {
				// 如果找到最新订单
				if(objects.length > 0) {
					req.body.object = objects[0];
					next();
				} 
				// 如果没有订单
				else {
					info = "您还没有订单， 请先添加订单";
					Err.wsError(req, res, info);
				}
			} })
		}
	} })
}
exports.ptPrint = function(req, res) {
	let object = req.body.object;
	res.render('./wser/print/order/ptPrint', {
		title: '自动打印',
		crWser: req.session.crWser,
		group: object.group,
		object: object,
	});
}

exports.ptAutoTk = function(req, res, next) {
	let crWser = req.session.crWser;
	// 第一步 找到需要打印的订单
	ObjDB.find({'group': crWser.group})
	.where('ticketing').eq(true)
	.populate('group')
	.populate('cter')
	.sort({"ctAt": 1})
	.exec(function(err, printings) { if(err) {
		info = "pt自动打印时, 数据库错误, 请联系管理员";
		Err.wsError(req, res, info);
	} else {
		// 如果找到打印的订单
		if(printings.length > 0) {
			req.body.object = printings[0];
			next();
		} 

		// 如果没有找到打印的订单
		else {
			// 第二步 查找最新订单
			ObjDB.find({'group': crWser.group})
			.populate('group')
			.populate('cter')
			.sort({"ctAt": -1})
			.limit(1)
			.exec(function(err, objects) { if(err) {
				info = "pt自动打印时, 数据库错误, 请联系管理员";
				Err.wsError(req, res, info);
			} else {
				// 如果找到最新订单
				if(objects.length > 0) {
					req.body.object = objects[0];
					next();
				} 
				// 如果没有订单
				else {
					info = "您还没有订单， 请先添加订单";
					Err.wsError(req, res, info);
				}
			} })
		}
	} })
}
exports.ptTicket = function(req, res) {
	let object = req.body.object;
	res.render('./wser/print/order/ptTicket', {
		title: '小票打印',
		crWser: req.session.crWser,
		group: object.group,
		object: object,
	});
}

slipPage = function(reqentry, initEntry) {
	let entry = parseInt(reqentry);
	if(isNaN(entry)) {
		entry = initEntry;
	} else if(entry != initEntry) {
		if(entry < 0) entry = -entry;
		// 如果每页显示条目数不是默认值，则query条件要加上
	}
	
	return entry;
};

exports.ptOrdersFilter = function(req, res, next) {
	let crWser = req.session.crWser;
	let title = '订单列表';
	let url = "/ptOrders";

	// 分页
	let slipCond = ""; // 分页时用到的其他条件
	let page = parseInt(req.query.page) || 0, entry = 10;
	if(req.query.entry) {
		entry = slipPage(req.query.entry, entry)
		slipCond += "&entry="+entry;
	}
	let index = page * entry;


	ObjDB.countDocuments({
		'group': crWser.group,
	})
	.exec(function(err, count) { if(err) {
		info = "pt查找订单时, 订单数量数据库错误, 请联系管理员";
		Err.wsError(req, res, info);
	} else {
		ObjDB.find({
			'group': crWser.group,
		})
		.populate('payment')
		.skip(index)
		.limit(entry)
		.sort({"ctAt": -1})
		.exec(function(err, objects) { if(err) {
			info = "pt查找订单时, 订单数据库错误, 请联系管理员";
			Err.wsError(req, res, info);
		} else {
			let objBody = new Object()

			objBody.title = title;
			objBody.url = url;
			objBody.thisAct = "/ptOrder";
			objBody.crWser = req.session.crWser,

			objBody.count = count;
			objBody.objects = objects;

			objBody.currentPage = (page + 1);
			objBody.entry = entry;
			objBody.totalPage = Math.ceil(count / entry);

			objBody.slipCond = slipCond;

			req.body.objBody = objBody;
			next();
		} })
	} })
}

exports.ptOrders = function(req, res) {
	let crWser = req.session.crWser;
	Mber.find({'group': crWser.group})
	.where('role').ne(1)
	.exec(function(err, members) { if(err) {
		info = "ptOrders Mber find 错误, 请联系管理员";
		Err.wsError(req, res, info);
	} else {
		members.unshift(crWser)
		let objBody = req.body.objBody;
		objBody.members = members;
		res.render('./wser/print/order/list', objBody);
	}
	})
}



exports.ptOrderFilter = function(req, res, next) {
	let crWser = req.session.crWser;

	let id = req.params.id
	ObjDB.findOne({_id: id})
	.populate('group')
	.populate('cter')
	.exec(function(err, object) { if(err) {
		info = "pt查看订单时, 订单数据库错误, 请联系管理员";
		Err.wsError(req, res, info);
	} else if(!object) {
		info = "数据已经被删除，请刷新查看";
		Err.wsError(req, res, info);
	} else if(!object.group){
		info = "pt查看订单时, 本公司数据不存在, 请联系管理员";
		Err.wsError(req, res, info);
	} else if(object.group._id != crWser.group){
		info = "pt您无权查看其他公司的订单信息, 请联系管理员";
		Err.wsError(req, res, info);
	} else {
		req.body.object = object;
		next()
	} })
}
exports.ptOrder = function(req, res) {
	let crWser = req.session.crWser;
	let object = req.body.object;

	let objBody = new Object();
	objBody.object = object;
	objBody.group = object.group;
	objBody.title = "订单详情";
	objBody.crWser = crWser;
	objBody.thisAct = "/ptOrder";

	res.render('./wser/print/order/detail', objBody);
}






exports.ptOrderPrinting = function(req, res) {
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

exports.ptOrderTicket = function(req, res) {
	let id = req.query.id
	let newTicket = req.query.newTicket;
	ObjDB.findOne({_id: id}, function(err, object){
		if(err) console.log(err);
		if(object){
			object.ticketing = parseInt(newTicket);
			object.save(function(err,objSave) {
				if(err) console.log(err);
				res.json({success: 1, info: "已经更改"});
			})
		} else {
			res.json({success: 0, info: "已被删除，按F5刷新页面查看"});
		}
	})
}
let Index = require('./index');
let ObjDB = require('../../models/matter/order');
let Wsgp = require('../../models/user/wsgp');

exports.adOrders = function(req, res) {
	let crAder = req.session.crAder;
	Wsgp.find()
	.exec(function(err, wsgps) {
		if(err) {
			info = "adOrders Wsgp find 错误, 请联系管理员";
			Index.adOptionWrong(req, res, info);
		} else {
			res.render('./ader/order/list', {
				title : "出售记录",
				crAder: crAder,
				wsgps : wsgps,
				selWsgpId: req.query.selWsgpId,
			});
		}
	})
}

exports.adOrdersAjax = function(req, res) {
	let symGrp = '$ne';
	let condGrp = null;
	// 在这的作用是 老板选择查看某人的出售订单使用
	if(req.query.selWsgpId && req.query.selWsgpId !=0 ) {
		symGrp = '$eq';
		condGrp = req.query.selWsgpId;
	}

	let condWord = "";
	if(req.query.keyword) {
		condWord = req.query.keyword.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
	}

	// 根据创建时间筛选
	let begin = parseInt(req.query.begin);
	symCreatS = "$gte"; condCreatS = begin;
	symCreatF = "$lt"; condCreatF = begin + 24*60*60*1000;

	ObjDB.find({
		'code': new RegExp(condWord + '.*'),
		'ctAt': {[symCreatS]: condCreatS, [symCreatF]: condCreatF},
		'group': {[symGrp]: condGrp},
	})
	.populate('cter')
	.sort({"ctAt": -1})
	.exec(function(err, orders) { if(err) {
		res.json({success: 0, info: "ad查找订单时, 订单数据库错误, 请联系管理员"})
	} else {
		res.json({success: 1, orders: orders, keyword: req.query.keyword})
	} })
}

exports.adOrdersMonth = function(req, res) {
	let crAder = req.session.crAder;

	let months = new Array();

	let now = new Date();
	let tMonth = now.getMonth();
	let tyear = now.getFullYear();
	let tFirst = new Date(tyear, tMonth, 1);
	let timestamps = tFirst.setHours(0, 0, 0, 0);
	let timestampf = now.setHours(23, 59, 59, 999);

	let month = new Object();
	month.key = String(tyear).slice(2,4)+'年'+(tMonth+1)+'月';
	month.vals = timestamps
	month.valf = timestampf

	months.push(month)
	for(let i=1; i< 24; i++) {
		tMonth = tMonth-1;
		if(tMonth < 0) {
			tyear = tyear -1;
			tMonth = 11;
		}
		tFirst = new Date(tyear, tMonth, 1);
		timestamps = tFirst.setHours(0, 0, 0, 0);
		tFirst.setMonth(tFirst.getMonth() + 1);
		tFirst.setDate(tFirst.getDate() - 1)
		timestampf = tFirst.setHours(23, 59, 59, 999);
		months[i] = new Object();
		months[i].key = String(tyear).slice(2,4)+'年'+(tMonth+1)+'月';
		months[i].vals = timestamps
		months[i].valf = timestampf
	}


	Wsgp.find()
	.exec(function(err, wsgps) {
		if(err) {
			info = "adOrders Wsgp find 错误, 请联系管理员";
			Index.adOptionWrong(req, res, info);
		} else {
			res.render('./ader/order/listMonth', {
				title : "出售月统计",
				crAder: crAder,
				wsgps : wsgps,
				selWsgpId: req.query.selWsgpId,
				months: months
			});
		}
	})
}
exports.adOrdersMonthAjax = function(req, res) {
	let crAder = req.session.crAder;

	let symGrp = '$ne';
	let condGrp = null;
	// 在这的作用是 老板选择查看某人的出售订单使用
	if(req.query.selWsgpId && req.query.selWsgpId !=0 ) {
		symGrp = '$eq';
		condGrp = req.query.selWsgpId;
	}

	let condWord = "";
	if(req.query.keyword) {
		condWord = req.query.keyword.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
	}

	// 根据创建时间筛选
	let begin = parseInt(req.query.begin);
	let ended = parseInt(req.query.ended);
	symCreatS = "$gte"; condCreatS = begin;
	symCreatF = "$lt"; condCreatF = ended;

	ObjDB.find({
		'code': new RegExp(condWord + '.*'),
		'ctAt': {[symCreatS]: condCreatS, [symCreatF]: condCreatF},
		'group': {[symGrp]: condGrp},
	})
	.populate('cter')
	.sort({"ctAt": -1})
	.exec(function(err, orders) { if(err) {
		res.json({success: 0, info: "ad查找订单时, 订单数据库错误, 请联系管理员"})
	} else {
		res.json({success: 1, orders: orders, keyword: req.query.keyword})
	} })
}
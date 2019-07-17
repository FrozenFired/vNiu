let Index = require('./index');
let ObjDB = require('../../models/material/product');
let Wsgp = require('../../models/user/wsgp');

exports.adProdsFilter = function(req, res, next) {
	let crAder = req.session.crAder;

	let title = '库存';

	// 分页
	let slipCond = ""; // 分页时用到的其他条件
	let page = parseInt(req.query.page) || 0, entry = 5;

	let index = page * entry;

	let symGrp = '$ne';
	let condGrp = null;
	if(req.query.selWsgpId) {
		symGrp = '$eq';
		condGrp = req.query.selWsgpId;
	}
	let symWord = "code";
	let condWord = "";
	if(req.query.keyword) {
		symWord = req.query.keytype;
		slipCond += "&keytype="+symWord;
		let str = req.query.keyword.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
		slipCond += "&keyword="+str;
		str = str.split(" ");
		for(let i=0; i<str.length; i++) {
			condWord += str[i] + '.*';
		}
	}

	ObjDB.countDocuments({
		'group': {[symGrp]: condGrp},
		[symWord]: new RegExp(condWord + '.*')
	})
	.exec(function(err, count) {
		if(err) { console.log("查找产品数量时，数据库查找数量"); console.log(err); }
		ObjDB.find({
			'group': {[symGrp]: condGrp},
			[symWord]: new RegExp(condWord + '.*')
		})
		.sort({"stock": 1})
		.skip(index)
		.limit(entry)
		.exec(function(err, objects) { if(err) {
			info = "查找产品时，数据库查找出错, 请联系管理员";
			Index.adOptionWrong(req, res, info);
		} else {
			let objBody = new Object()

			objBody.title = title;
			objBody.thisAct = "/adProd";
			objBody.thisTit = "仓库";
			objBody.crAder = crAder;

			objBody.count = count;
			objBody.objects = objects;

			objBody.keytype = req.query.keytype;
			objBody.keyword = req.query.keyword;

			objBody.selWsgpId = req.query.selWsgpId;

			objBody.currentPage = (page + 1);
			objBody.entry = entry;
			objBody.totalPage = Math.ceil(count / entry);

			objBody.slipCond = slipCond;

			req.body.objBody = objBody;
			next();
		} }) 
	})
}
exports.adProds = function(req, res) {
	let objBody = req.body.objBody
	objBody.url = "/adProds";
	Wsgp.find(function(err, wsgps) {
		if(err) console.log(err);
		objBody.wsgps = wsgps
		res.render('./ader/product/list', objBody);
	})
}










exports.ajaxAdProds = function(req, res) {
	let crAder = req.session.crAder;
	let keytype = req.query.keytype
	let keyword = req.query.keyword
	keyword = String(keyword).replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
	// console.log(keytype)
	// console.log(keyword)
	// console.log("--------------")
	ObjDB.find({[keytype]: new RegExp(keyword + '.*'), 'group': crAder.group}, function(err, objects){
		if(err) {
			res.json({success: 0, info: "ad获取产品列表时，数据库查找错误, 请联系管理员"});
		} else if(objects){
			res.json({ success: 1, products: objects});
		} else {
			res.json({success: 0})
		}
	})
}

exports.ajaxAdProd = function(req, res) {
	let crAder = req.session.crAder;
	let keytype = req.query.keytype
	let keyword = req.query.keyword
	keyword = String(keyword).replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
	ObjDB.findOne({[keytype]: keyword, 'group': crAder.group}, function(err, object){
		if(err) {
			res.json({success: 0, info: "ad获取产品时，数据库查找错误, 请联系管理员"});
		} else if(object){
			res.json({ success: 1, product: object})
		} else {
			res.json({success: 0})
		}
	})
}
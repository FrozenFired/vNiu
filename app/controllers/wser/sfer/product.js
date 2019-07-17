let Err = require('../aaIndex/err')
let Language = require('../aaIndex/language')

let ObjDB = require('../../../models/material/product');

let _ = require('underscore');

exports.sfProds = function(req, res) {
	let crWser = req.session.crWser;
	let Lang = Language.wsLanguage('/wser', '/prods', crWser);

	let sortCond = req.query.sortCond || 'sellQuot';
	let sortVal = req.query.sortVal || -1;
	ObjDB.countDocuments({'group': crWser.group})
	.exec(function(err, count) {
		if(err) {
			info = "sfProds, ObjDB.countDocuments, Error!";
			Err.wsError(req, res, info);
		} else {
			let objBody = new Object()

			objBody.title = Lang.title+'('+count+')'; 
			objBody.Lang = Lang; 
			objBody.crWser = crWser;
			objBody.count = count;
			objBody.thisAct = "/sfProd";
			objBody.sortCond = sortCond;
			objBody.sortVal = sortVal;
			objBody.skip = 0;

			res.render('./wser/sfer/product/list', objBody);
		}
	})
}

exports.sfProdsAjax = function(req, res) {
	let crWser = req.session.crWser;

	let keySymb = '$ne';
	let keyword = ' x '
	if(req.query.keyword) {
		keySymb = '$in';
		keyword = String(req.query.keyword);
		keyword = keyword.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
		keyword = new RegExp(keyword + '.*');
	}

	let sortCond = 'sellQuot';
	if(req.query.sortCond) sortCond = req.query.sortCond;

	let sortVal = 1;
	if(req.query.sortVal && !isNaN(parseInt(req.query.sortVal))) {
		sortVal = parseInt(req.query.sortVal);
	}

	let skip = 0;
	if(req.query.skip && !isNaN(parseInt(req.query.skip))) {
		skip = parseInt(req.query.skip)
	}
	
	ObjDB.countDocuments({
		'group': crWser.group,
		$or:[
			{'code': {[keySymb]: keyword}},
			{'nome': {[keySymb]: keyword}},
		],
	}, function(err, keyCount) {
		if(err) {
			res.json({success: 0, info: "sfProdsAjax, ObjDB.countDocuments, Error"})
		} else {
			// console.log(keyCount)
			ObjDB.find({
				'group': crWser.group,
				$or:[
					{'code': {[keySymb]: keyword}},
					{'nome': {[keySymb]: keyword}},
				],
			})
			.sort({[sortCond]: sortVal})
			.skip(skip)
			.limit(6)
			.exec(function(err, objects) { if(err) {
				res.json({success: 0, info: "sfProdsAjax, ObjDB.find, Error"})
			} else {
				// console.log(objects)
				res.json({success: 1, objects: objects, keyCount: keyCount})
			} })
		}
	})
}



exports.sfProdFilter = function(req, res, next) {
	let crWser = req.session.crWser;
	let id = req.params.id;
	ObjDB.findOne({_id: id, group: crWser.group})
	.populate('sells.order', 'code')
	// .populate({
	// 	path: 'sells.order',
	// 	select: 'code',
	// 	model: 'Order',
	// 	options: {
	// 		limit: 2
	// 		// sort: {ctAt: -1},
	// 	}
	// })
	.exec(function(err, object) {
		if(err) {
			console.log(err);
			info = "查看产品信息时，数据库查找出错, 请联系管理员";
			Err.wsError(req, res, info);
		} else if(!object) {
			info = "此产品已经被删除"
			Err.wsError(req, res, info)
		} else if(object.group != crWser.group) {
			info = "您只能查看自己公司的产品"
			Err.wsError(req, res, info)
		} else {
			req.body.object = object
			next()
		}
	})
}

exports.sfProd = function(req, res) {
	let object = req.body.object;

	let objBody = new Object();

	objBody.crWser = req.session.crWser;
	objBody.object = object;
	objBody.thisAct = "/sfProd";
	objBody.title = '产品信息';

	res.render('./wser/sfer/product/detail', objBody);
}





exports.orderAjaxSfProds = function(req, res) {
	let crWser = req.session.crWser;
	let keytype = req.query.keytype
	let keyword = req.query.keyword
	keyword = String(keyword).replace(/(\s*$)/g, "").replace( /^\s*/, '');

	ObjDB.findOne({[keytype]: keyword, 'group': crWser.group}, {sells:0})
	.exec(function(err, object){
		if(err) {
			res.json({success: 0, info: "sf获取产品时，数据库查找错误, 请联系管理员"});
		} else if(object){
			res.json({ success: 1, product: object})
		} else {
			ObjDB.find({
				[keytype]: new RegExp(keyword + '.*'), 'group': crWser.group
			}, {sells:0})
			.exec(function(err, objects){
				if(err) {
					res.json({success: 0, info: "sf获取产品列表时，数据库查找错误, 请联系管理员"});
				} else if(objects && objects.length > 0){
					res.json({ success: 2, products: objects});
				} else {
					res.json({success: 0})
				}
			})
		}
	})
	
}

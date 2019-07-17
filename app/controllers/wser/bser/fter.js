let Err = require('../aaIndex/err');
let Language = require('../aaIndex/language');

let Fter = require('../../../models/user/fter');// 工厂
let Order = require('../../../models/matter/order');

let _ = require('underscore');


exports.bsFters = function(req, res) {
	let crWser = req.session.crWser;
	let Lang = Language.wsLanguage('/wser', '/fters', crWser);

	let sortCond = req.query.sortCond || 'code';
	let sortVal = req.query.sortVal || 1;
	Fter.countDocuments({'group': crWser.group})
	.exec(function(err, count) {
		if(err) console.log("查找产品数量时，数据库查找数量");

		let objBody = new Object()

		objBody.title = Lang.title+'('+count+')'; 
		objBody.Lang = Lang; 
		objBody.crWser = req.session.crWser;
		objBody.count = count;

		objBody.thisAct = "/bsFter";
		objBody.sortCond = sortCond;
		objBody.sortVal = sortVal;
		objBody.skip = 0;

		res.render('./wser/bser/fter/list', objBody);
	})
}

exports.bsFtersAjax = function(req, res) {
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

	Fter.countDocuments({
		'group': crWser.group,
		$or:[
			{'code': {[keySymb]: keyword}},
			{'nome': {[keySymb]: keyword}},
		],
	}, function(err, keyCount) {
		if(err) {
			res.json({success: 0, info: "bsFtersAjax, ObjDB.countDocuments, Error"})
		} else {
			Fter.find({
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
				res.json({success: 0, info: "bsFtersAjax, ObjDB.find, Error"})
			} else {
				res.json({success: 1, objects: objects, keyCount: keyCount})
			} })
		}
	})
}



exports.bsFterFilter = function(req, res, next) {
	let crWser = req.session.crWser;
	let id = req.params.id
	Fter.findOne({_id: id, 'group': crWser.group})
	.populate('arrears')
	.exec(function(err, object) { if(err) {
		info = "bsFterFilter 查看工厂时, 工厂数据库查找错误, 请联系管理员";
		Err.wsError(req, res, info);
	} else if(!object) {
		info = "此工厂已经被删除";
		Err.wsError(req, res, info);
	} else {
		req.body.object = object;
		next();
	} })
}
exports.bsFter = function(req, res) {
	let crWser = req.session.crWser;
	let Lang = Language.wsLanguage('/wser', '/fter', crWser);

	let objBody = new Object();
	objBody.object = req.body.object;
	// console.log(objBody.object)
	objBody.title = Lang.title;
	objBody.Lang = Lang;
	objBody.crWser = crWser;
	objBody.thisAct = "/bsFter";
	res.render('./wser/bser/fter/detail', objBody);
}
exports.bsFterDel = function(req, res) {
	let object = req.body.object;
	if(object.arrears && object.arrears.length > 0) {
		info = "此工厂还有未付清的账款,不可以删除";
		Err.wsError(req, res, info);
	} else {
		Fter.deleteOne({_id: object._id}, function(err, objRm) { if(err) {
			info = "bs删除工厂时, 工厂数据库删除错误, 请联系管理员";
			Err.wsError(req, res, info);
		} else {
			res.redirect('/bsFters')
		} })
	}
}

exports.bsFterDelAjax = function(req, res) {
	let crWser = req.session.crWser;

	let id = req.query.id;
	Fter.findOne({_id: id}, function(err, object){ if(err) {
		res.json({success: 0, info: "bsFterDelAjax, Fter.findOne, Error"})
	} else if(!object){
		res.json({success: 0, info: "此工厂已经被删除"})
	} else if(object.group != crWser.group){
		res.json({success: 0, info: "操作错误,请联系管理员! bsFterDelAjax, object.group != crWser.group"})
	} else {
		if(object.arrears && object.arrears.length > 0) {
			res.json({success: 0, info: "此工厂还有未付清的账款,不可以删除"})
		} else {
			Fter.deleteOne({_id: object._id}, function(err, objRm) { if(err) {
				res.json({success: 0, info: "bsFterDelAjax, Fter.deleteOne,Error!"})
			} else {
				res.json({success: 1})
			} })
		}
	} })
}




exports.bsFterUpd = function(req, res) {
	let crWser = req.session.crWser;
	let obj = req.body.obj
	if(obj.code) obj.code= obj.code.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
	// 如果没有修改，系统肯定判断到有这个名字，所以要加上 -id != this._id
	Fter.findOne({_id: obj._id, 'group': crWser.group}, function(err, object) { if(err) {
		info = "bs更新工厂时, 工厂数据库查看错误, 请联系管理员";
		Err.wsError(req, res, info);
	} else if(!object) {
		info = "此工厂已经被删除";
		Err.wsError(req, res, info);
	} else {
		let _object
		_object = _.extend(object, obj)
		_object.save(function(err, objSave){
			if(err) console.log(err);
			if(req.body.backUrl) {
				res.redirect(req.body.backUrl)
			} else {
				res.redirect('/bsFter/'+objSave._id)
			}
		})
	} })
}



exports.bsFterAdd =function(req, res) {
	let crWser = req.session.crWser;
	let Lang = Language.wsLanguage('/wser', '/fterAdd', crWser);

	Fter.countDocuments({'group': crWser.group}, function(err, count) { if(err) {
		info = "bser添加工厂时, 订单count数据库错误, 请联系管理员";
		Err.wsError(req, res, info);
	} else {
		count = count +1;
		for(let len = (count + "").length; len < 3; len = count.length) { // 序列号补0
			count = "0" + count;            
		}
		let code = 'F'+count;
		res.render('./wser/bser/fter/add', {
			title: Lang.title,
			Lang: Lang,
			crWser : req.session.crWser,
			thisAct: "/bsFter",
			code: code,
		});
	} })
}


exports.bsFterNew = function(req, res) {
	let crWser = req.session.crWser;
	let obj = req.body.obj
	obj.group = crWser.group;
	if(obj.code) {
		obj.code= obj.code.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
	}
	Fter.findOne({code: obj.code, 'group': crWser.group}, function(err, ojbSame) { if(err) {
		info = "bsFterNew, ojbSame错误, 请联系管理员";
		Err.wsError(req, res, info);
	} else if(ojbSame) {
		info = "工厂帐号已经存在, 请重新输入工厂号";
		Err.wsError(req, res, info);
	} else {
		if(obj.nome) obj.nome = obj.nome.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
		if(obj.iva) obj.iva= obj.iva.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();

		let _fter = new Fter(obj);
		_fter.save(function(err, fterSave) { if(err) {
			info = "bs创建新用户New时, 用户保存错误, 请联系管理员";
			Err.wsError(req, res, info);
		} else {
			res.redirect('/bsFter/'+fterSave._id)
		} })
	} })		
}






exports.ajaxBsFters = function(req, res) {
	let crWser = req.session.crWser;
	let keytype = req.query.keytype
	let keyword = req.query.keyword
	keyword = String(keyword).replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
	Fter.find({
		'group': crWser.group,
		$or:[
			{'code': new RegExp(keyword + '.*')},
			{'nome': new RegExp(keyword + '.*')},
		]
	})
	.limit(20)
	.exec (function(err, fters){
		if(err) {
			res.json({success: 0, info: "bs获取工厂列表时，数据库查找错误, 请联系管理员"});
		} else if(fters){
			res.json({ success: 1, fters: fters})
		} else {
			res.json({success: 0})
		}
	})
}

exports.ajaxBsFterAll = function(req, res) {
	let crWser = req.session.crWser;
	// .find({code: new RegExp(code + '.*')})
	Fter.find({'group': crWser.group}, function(err, fters){
		if(err) console.log(err);
		if(fters){
			res.json({ success: 1, fters: fters})
		} else {
			res.json({success: 0})
		}
	})
}
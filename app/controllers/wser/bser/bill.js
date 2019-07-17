let Err = require('../aaIndex/err');
let Language = require('../aaIndex/language');

let Bill = require('../../../models/matter/bill');
let Order = require('../../../models/matter/order');
let Cter = require('../../../models/user/cter');

let _ = require('underscore');


exports.bsBills = function(req, res) {
	let crWser = req.session.crWser;
	let Lang = Language.wsLanguage('/wser', '/bills', crWser);

	let sortCond = req.query.sortCond || 'cter';
	let sortVal = req.query.sortVal || 1;
	Bill.countDocuments({'group': crWser.group})
	.exec(function(err, count) {
		if(err) console.log("查找产品数量时，数据库查找数量");

		let objBody = new Object()

		objBody.title = Lang.title+'('+count+')'; 
		objBody.Lang = Lang; 
		objBody.crWser = req.session.crWser;
		objBody.count = count;

		objBody.thisAct = "/bsBill";
		objBody.sortCond = sortCond;
		objBody.sortVal = sortVal;
		objBody.skip = 0;

		res.render('./wser/bser/bill/list', objBody);
	})
}

exports.bsBillsAjax = function(req, res) {
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
	
	Bill.countDocuments({'group': crWser.group}, function(err, keyCount) {
		if(err) {
			res.json({success: 0, info: "bsBillsAjax, Bill.countDocuments, Error"})
		} else {
			Bill.find({'group': crWser.group})
			.populate('cter', 'nome')
			.populate('order', 'code')
			.sort({[sortCond]: sortVal})
			.skip(skip)
			.limit(12)
			.exec(function(err, objects) { if(err) {
				res.json({success: 0, info: "bs查找订单时, 订单数据库错误, 请联系管理员"})
			} else {
				res.json({success: 1, objects: objects, keyCount: keyCount})
			} })
		}
	})
}



exports.bsBillFilter = function(req, res, next) {
	let crWser = req.session.crWser;
	let id = req.params.id
	Bill.findOne({_id: id, 'group': crWser.group})
	.populate('cter')
	.populate('order')
	.exec(function(err, object) { if(err) {
		info = "bs查看账单时, 账单数据库查找错误, 请联系管理员";
		Err.wsError(req, res, info);
	} else if(!object) {
		info = "此账单已经被删除";
		Err.wsError(req, res, info);
	} else {
		req.body.object = object;
		next();
	} })
}
exports.bsBill = function(req, res) {
	let crWser = req.session.crWser;
	let Lang = Language.wsLanguage('/wser', '/bill', crWser);
	let objBody = new Object();
	objBody.object = req.body.object;
	objBody.title = Lang.title;
	objBody.Lang = Lang;
	objBody.crWser = crWser;
	objBody.thisAct = "/bsBill";

	res.render('./wser/bser/bill/detail', objBody);
}
exports.bsBillDel = function(req, res) {
	let object = req.body.object;
	let billId = object._id;
	let cterId = object.cter;
	let orderId = object.order;
	Bill.deleteOne({_id: object._id}, function(err, objRm) { if(err) {
		info = "bs删除账单时, 账单数据库删除错误, 请联系管理员";
		Err.wsError(req, res, info);
	} else {
		if(cterId) {
			Cter.findOne({_id: cterId}, function(err, cter) {
				if(err) console.log(err);
				if(cter && cter.bills) {
					cter.bills.remove(billId);
					cter.save(function(err, cterSave) {
						if(err) console.log(err);
					})
				}
			})
		}
		if(orderId) {
			Order.findOne({_id: orderId}, function(err, order) {
				if(err) console.log(err);
				if(order) {
					order.bill = null;
					order.save(function(err, orderSave) {
						if(err) console.log(err);
					})
				}
			})
		}
		res.redirect('/bsBills')
	} })
}




exports.bsBillUpd = function(req, res) {
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
	Bill.findOne({_id: obj._id, 'group': crWser.group}, function(err, object) { if(err) {
		info = "bs更新账单时, 账单数据库查看错误, 请联系管理员";
		Err.wsError(req, res, info);
	} else if(!object) {
		info = "此账单已经被删除";
		Err.wsError(req, res, info);
	} else {
		let _object
		_object = _.extend(object, obj)
		_object.save(function(err, objSave){
			if(err) console.log(err);
			if(req.body.backUrl) {
				res.redirect(req.body.backUrl)
			} else {
				res.redirect('/bsBill/'+objSave._id)
			}
		})
	} })
}



exports.bsBillAdd =function(req, res) {
	let crWser = req.session.crWser;
	let Lang = Language.wsLanguage('/wser', '/billAdd', crWser);

	let cterId = req.query.cter;
	let orderId = req.query.order;
	let unpaid = req.query.unpaid;

	Cter.findOne({_id: cterId}, function(err, cter) { if(err) {
		info = "bs创建账单Add时, 客户信息查找错误, 请联系管理员";
		Err.wsError(req, res, info);
	} else {
		res.render('./wser/bser/bill/add', {
			title: Lang.title,
			Lang: Lang,
			crWser : crWser,
			thisAct: "/bsBill",

			cter: cter,
			orderId: orderId,
			unpaid: unpaid,
		});
	} })
}


exports.bsBillNew = function(req, res) {
	let crWser = req.session.crWser;
	let obj = req.body.obj
	obj.group = crWser.group;

	if(obj.unpaid && !isNaN(parseFloat(obj.unpaid))) {
		obj.unpaid = parseFloat(obj.unpaid);
	}
	let _bill = new Bill(obj);
	_bill.save(function(err, billSave) { if(err) {
		info = "bs创建账单New时, 账单保存错误, 请联系管理员";
		Err.wsError(req, res, info);
	} else {
		Cter.findOne({_id: obj.cter}, function(err, cter) { if(err) {
			info = "bs创建账单New时, 客户查找数据库错误, 请联系管理员";
			Err.wsError(req, res, info);
		} else if(!cter) {
			info = "bs创建账单New时, 客户查找错误, 请联系管理员";
			Err.wsError(req, res, info);
		} else {
			cter.bills.push(_bill._id);
			cter.save(function(err, cterSave) { if(err) {
				info = "bs创建账单New时, 客户保存错误, 请联系管理员";
				Err.wsError(req, res, info);
			} else {
				if(obj.order) {
					Order.findOne({_id: obj.order}, function(err, order) {
						if(err) console.log(err);
						if(order) {
							order.bill = _bill._id;
							order.save(function(err, orderSave) {
								if(err) console.log(err);
							})
						}
					})
				}
				res.redirect('/bsCter/'+cterSave._id)
			} })
		} })
	} })
		
}






exports.bsBillDelAjax = function(req, res) {
	let crWser = req.session.crWser;
	let id = req.query.id
	Bill.findOne({_id: id, 'group': crWser.group}, function(err, object){
		if(err) console.log(err);
		if(object){
			let billId = object._id;
			let cterId = object.cter;
			let orderId = object.order;
			Bill.deleteOne({_id: billId}, function(err, objRm) { if(err) {
				res.json({success: 0, info: "bs删除账单时, 账单数据库删除错误, 请联系管理员"})
			} else {
				if(cterId) {
					Cter.findOne({_id: cterId}, function(err, cter) {
						if(err) console.log(err);
						if(cter && cter.bills) {
							cter.bills.remove(billId);
							cter.save(function(err, cterSave) {
								if(err) console.log(err);
							})
						}
					})
				}
				if(orderId) {
					Order.findOne({_id: orderId}, function(err, order) {
						if(err) console.log(err);
						if(order) {
							order.bill = null;
							order.save(function(err, orderSave) {
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
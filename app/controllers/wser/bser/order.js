let Err = require('../aaIndex/err')
let Language = require('../aaIndex/language')

let Order = require('../../../models/matter/order');
let Product = require('../../../models/material/product');
let Wser = require('../../../models/user/wser');
let Cter = require('../../../models/user/cter');

let _ = require('underscore')
let moment = require('moment')


exports.bsOrderAddPre =function(req, res) {
	let crWser = req.session.crWser;
	let Lang = Language.wsLanguage('/wser', '/orderAdd', crWser);

	Order.find({'creater': crWser._id, 'status': 1})	// 查找是否有未完成的订单
	.populate('sells')
	.sort({"ctAt": -1})
	.exec(function(err, objects) { 
		if(err) {
			console.log(err);
			info = "bsOrderAdd, Order.find, Error!";
			Err.wsError(req, res, info);
		} else if(objects && objects.length > 0) { //如果有未完成的订单 页面会显示这些订单列表
			res.render('./wser/bser/order/addPre', {
				title: Lang.title,
				Lang: Lang,
				crWser : req.session.crWser,
				orders : objects,
			})
		}
		else {					//否则查看是否有0状态的订单
			res.redirect('/bsOrderAdd');
		}
	})
}
exports.bsOrderAdd =function(req, res) {
	let crWser = req.session.crWser;
	let Lang = Language.wsLanguage('/wser', '/orderAdd', crWser);
	let orderId = req.query.orderId;
	if(orderId && orderId.length>15) {
		Order.findOne({_id: orderId, 'group': crWser.group})
		.populate('cter')
		.exec(function(err, order) {
			if(err) {
				console.log(err);
				info = "bsOrderAdd, Order.findOne, Error!";
				Err.wsError(req, res, info);
			} else if(!order) {
				res.redirect('/bsOrderAddPre');
			} else {
				bsOrderAddShowPage(req, res, order);
			}
		})
	} else {
		bsOrderAddCrtdb(req, res);
	}
}

let bsOrderAddCrtdb = function(req, res) {
	let crWser = req.session.crWser;
	Order.findOne({'creater': crWser._id, 'status': 0})
	// .populate('sells')
	.sort({"ctAt": -1})
	.exec(function(err, object) { 
		if(err) {
			console.log(err);
			info = "bsOrderAdd, Order.find, Error!";
			Err.wsError(req, res, info);
		} else if(object){							// 如果存在0状态订单，直接编辑此订单
			res.redirect('/bsOrderAdd?orderId='+object._id)
		} else {									// 如果不存在0状态订单，新建订单再编辑
			let today = new Date();
			let begin = today.setHours(0, 0, 0, 0);
			Order.findOne({	// 找出本人开出的今天最后一单
				'ctAt': {'$gte': begin},
				'creater': crWser._id,
			})
			.sort({"ctAt": -1})
			.limit(1)
			.exec(function(err, order) { if(err) {
				info = "bsOrderAdd, Order.findOne, Error!";
				Err.wsError(req, res, info);
			} else {
				let code = bsOrderGetCode(order, crWser.cd); // 为此单创建code
				let orderObj = new Object();
				orderObj.group = crWser.group;
				orderObj.creater = crWser._id;
				orderObj.code = code;
				orderObj.status = 0;
				let _order = new Order(orderObj);
				bsOrderLoopSave(req, res, orderObj)
			}})
		}
	})
}
let bsOrderLoopSave = function(req, res, obj) {
	let crWser = req.session.crWser;
	Order.findOne({'code': obj.code, 'group': crWser.group})
	.exec(function(err, order) { if(err) {
		info = "bsOrderLoopSave, Order.findOne, Error!";
		Err.wsError(req, res, info);
	} else if(order) {
		if(order.code) {
			precode = obj.code.slice(0,8)
			dayNum = parseInt(obj.code.slice(8,12)) +1
		} else {
			precode = (moment(Date.now()).format('YYMMDD')) + crWser.cd
			dayNum = 1
		}
		for(let len = (dayNum + "").length; len < 4; len = dayNum.length) { // 序列号补0
			dayNum = "0" + dayNum;            
		}
		obj.code = precode + String(dayNum)
		bsOrderLoopSave(req, res, obj);
	} else {
		if(!obj.cter || obj.cter.length <20) obj.cter = null;
		let _order = new Order(obj)
		_order.save(function(err, objSave) {
			if(err) {
				console.log(err);
				info = "bsOrderLoopSave, _order.save, Error!";
				Err.wsError(req, res, info);
			} else {
				res.redirect('/bsOrderAdd?orderId='+objSave._id)
			}
		})
	} })
}

let bsOrderAddShowPage = function(req, res, order) {
	let crWser = req.session.crWser;
	let Lang = Language.wsLanguage('/wser', '/orderAdd', crWser);
	// console.log('bsOrderAddShowPage')
	// console.log(order)
	// console.log('bsOrderAddShowPage')
	// console.log('-------------------')
	res.render('./wser/bser/order/add', {
		title: Lang.title,
		Lang: Lang,
		crWser : crWser,
		order : order,
	})
}


// YYMMDDXXNUM   190205KL0012
let bsOrderGetCode = function(order, userCd) {
	let today =parseInt(moment(Date.now()).format('YYMMDD')) // 计算今天的日期
	let preDate = 0, dayNum = 0;

	if(order && order.code){ // 找出上个订单的日期和序列号
		preDate = parseInt(order.code.slice(0,6))
		dayNum = parseInt(order.code.slice(8,12))
	}
	if(today == preDate) {	// 判断上个订单的日期是否是今天
		dayNum = dayNum+1
	} else {					// 如果不是则从1开始
		dayNum = 1
	}
	for(let len = (dayNum + "").length; len < 4; len = dayNum.length) { // 序列号补0
		dayNum = "0" + dayNum;            
	}
	let code = String(today)+ userCd + String(dayNum);
	return code;
}



exports.bsOrderProdsAjax = function(req, res) {
	let crWser = req.session.crWser;
	let keyword = ' x x x ';
	if(req.query.keyword) {
		keyword = String(req.query.keyword);
		keyword = keyword.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
		keyword = new RegExp(keyword + '.*');
	}

	Product.find({
		'group': crWser.group,
		'layer': 1,
		'code':  keyword,
	})
	.populate('prodcls')
	.limit(6)
	.exec(function(err, objects) { if(err) {
		res.json({success: 0, info: "bsProdsAjax, Order.find, Error"})
	} else {
		// console.log(objects)
		res.json({success: 1, objects: objects})
	} })
}

exports.bsOrderProdIdAjax = function(req, res) {
	let crWser = req.session.crWser;
	let id = req.query.id;
	Product.findOne({
		'group': crWser.group,
		'layer': 1,
		'_id':  id,
	})
	.populate({path: 'prodcls', populate: {path: 'prodszs'}})
	.exec(function(err, object) { if(err) {
		res.json({success: 0, info: "bsProdsAjax, Order.find, Error"})
	} else {
		// console.log(object)
		res.json({success: 1, object: object})
	} })
}

exports.bsOrderPlusPdAjax = function(req, res) {
	let crWser = req.session.crWser;
	let orderId = req.query.orderId;
	let thrId = req.query.thrId;
	let quot = req.query.quot;

	Order.findOne({'_id': orderId, 'group': crWser.group})
	.exec(function(err, order) {
		if(err) {
			console.log(err);
			res.json({success: 0, info: "bsOrderPlusPdAjax, orderId, Order.findOne, Error!"})
		} else if(!order) {
			res.json({success: 0, info: "操作错误, 请刷新重试!"})
		} else {
			Product.findOne({'_id': thrId, 'group': crWser.group, 'layer': 3})
			.populate('prodcl')
			.populate('product')
			.exec(function(err, prodThr) {
				if(err) {
					console.log(err);
					res.json({success: 0, info: "bsOrderPlusPdAjax, orderId, Product.findOne, Error!"})
				} else if(!prodThr) {
					res.json({success: 0, info: "操作错误, 请刷新重试!"})
				} else {
					let flag = 1;
					for(i=0; i<order.sells.length;i++){
						if(String(order.sells[i].prodThr) == String(prodThr._id)) {
							if(quot == 0) {
								// 删除 order sells pd
								order.sells.remove(order.sells[i])
								flag = 2;
								break;
							} else {
								// 更新 order sells pd
								order.sells[i].quot = quot;
								flag = 3;
								break;
							}
						}
					}
					// 添加 order sells pd
					if(flag == 1) {
						let sell = new Object();
						sell.quot = quot;
						sell.prodFir = prodThr.product._id
						sell.prodSec = prodThr.prodcl._id
						sell.prodThr = prodThr._id
						sell.code = prodThr.product.code
						sell.nome = prodThr.product.nome
						sell.material = prodThr.product.material
						sell.width = prodThr.product.width
						sell.color = prodThr.prodcl.color
						sell.size = parseInt(prodThr.size)
						sell.price = parseFloat(prodThr.product.price)

						order.sells.push(sell);
						order.status = 1;
					} else if(flag == 2) {	// 如果是删除操作
						// 判断订单中是否还有产品
						if(order.sells.length == 0) {
							order.status = 0;
						}
					}

					// console.log(order)
					order.save(function(err, orderSave) {
						if(err) console.log(err);
						res.json({success: 1, order: orderSave})
					})
				}
			})
		}
	})
}

exports.bsOrderConnCterAjax = function(req, res) {
	let crWser = req.session.crWser;
	let orderId = req.query.orderId;
	let cterId = req.query.cterId;

	Order.findOne({'_id': orderId, 'group': crWser.group})
	.exec(function(err, order) {
		if(err) {
			console.log(err);
			res.json({success: 0, info: "bsOrderPlusPdAjax, orderId, Order.findOne, Error!"})
		} else if(!order) {
			res.json({success: 0, info: "操作错误, 请刷新重试!"})
		} else {
			if(cterId && cterId.length > 20) {
				Cter.findOne({'_id': cterId, 'group': crWser.group})
				.exec(function(err, cter) {
					if(err) {
						console.log(err);
						res.json({success: 0, info: "bsOrderPlusPdAjax, orderId, Product.findOne, Error!"})
					} else if(!cter) {
						res.json({success: 0, info: "操作错误, 请刷新重试!"})
					} else {
						order.cter = cter._id;
						// console.log(order)
						order.save(function(err, orderSave) {
							if(err) console.log(err);
							orderSave.cter = cter
							res.json({success: 1, order: orderSave})
						})
					}
				})
			} else {
				order.cter = null;
				order.save(function(err, orderSave) {
					if(err) console.log(err);
					res.json({success: 1, order: orderSave})
				})
			}
		}
	})
}

// 结帐
exports.bsOrderSettle = function(req, res) {
	let crWser = req.session.crWser;
	let id = req.params.id
	Order.findOne({_id: id, 'group': crWser.group})
	.exec(function(err, object){
		if(err){
			console.log(err);
			info = "bsOrderSettle, Order.findOne, Error!";
			Err.wsError(req, res, info);
		} else if(!object){
			info = "已被删除，按F5刷新页面查看";
			Err.wsError(req, res, info);
		} else {
			object.arts = object.sells.length;
			let pieces = 0, imp=0;
			for(i=0;i<object.arts;i++){
				let sell = object.sells[i];
				if(!isNaN(sell.size) && !isNaN(sell.quot) && !isNaN(sell.price) ) {
					pieces += sell.quot;
					imp += sell.size * sell.quot * sell.price;
				}
			}
			object.pieces = pieces;
			object.imp = imp;
			object.status = 2
			object.save(function(err,objSave) {
				if(err) console.log(err);
				res.redirect('/bsOrder/'+id)
			})
		}
	})
}









exports.bsOrderFilter = function(req, res, next) {
	let id = req.params.id
	Order.findOne({_id: id})
	.populate('group')
	.populate('cter')
	.exec(function(err, object) { if(err) {
		info = "bs查看订单时, 订单数据库错误, 请联系管理员";
		Err.wsError(req, res, info);
	} else if(!object) {
		info = "数据已经被删除，请刷新查看";
		Err.wsError(req, res, info);
	} else if(!object.group){
		info = "bs查看订单时, 本公司数据不存在, 请联系管理员";
		Err.wsError(req, res, info);
	} else {
		req.body.object = object;
		next()
	} })
}

exports.bsOrder = function(req, res) {
	let crWser = req.session.crWser;
	let Lang = Language.wsLanguage('/wser', '/order', crWser)

	let object = req.body.object;
	let objBody = new Object();
	objBody.object = object;
	objBody.group = object.group;
	objBody.title = Lang.title;
	objBody.Lang = Lang;
	objBody.crWser = crWser;
	objBody.thisAct = "/bsOrder";

	res.render('./wser/bser/order/detail', objBody);
}






















exports.bsOrderUp = function(req, res) {
	let crWser = req.session.crWser;
	let Lang = Language.wsLanguage('/wser', '/orderUp', crWser);

	let object = req.body.object;
	let objBody = new Object();
	objBody.object = object;
	objBody.group = object.group;
	objBody.title = Lang.title;
	objBody.Lang = Lang;
	objBody.crWser = crWser;
	objBody.thisAct = "/bsOrder";
	objBody.thisUrl = "/bsOrderUp";

	res.render('./wser/bser/order/update', objBody);
}

exports.bsOrderCp = function(req, res) {
	let crWser = req.session.crWser;
	let Lang = Language.wsLanguage('/wser', '/orderCp', crWser);

	let object = req.body.object;
	let objBody = new Object();
	objBody.object = object;
	objBody.group = object.group;
	objBody.title = Lang.title;
	objBody.Lang = Lang;
	objBody.crWser = crWser;
	objBody.thisAct = "/bsOrder";
	objBody.thisUrl = "/bsOrderCp";

	let today = new Date();
	let begin = today.setHours(0, 0, 0, 0);
	Order.findOne({
		'ctAt': {'$gte': begin},
		'operater': req.session.crWser.code,
	})
	.sort({"ctAt": -1})
	.limit(1)
	.exec(function(err, order) { if(err) {
		info = "销售订单数据库中的数据错误, 请联系管理员";
		Err.wsError(req, res, info);
	} else {
		objBody.code = bsOrderGetCode(order, crWser.cd);
		res.render('./wser/bser/order/copy', objBody);
	}})
}


exports.bsOrderDel = function(req, res) {
	let crWser = req.session.crWser;

	let object = req.body.object;
	Order.deleteOne({_id: object._id}, function(err, orderRm) { if(err) {
		info = "删除订单时, 数据删除错误, 请联系管理员";
		Err.wsError(req, res, info);
	} else {
		res.redirect("/bsOrders");
	} })
}
exports.bsOrderUpd = function(req, res) {
	let crWser = req.session.crWser;
	let obj = req.body.obj;
	
	if(obj.products) {
		// obj.imp = parseFloat(obj.imp);
		obj.rlp = parseFloat(obj.imp);

		obj.imp = 0;
		obj.pieces = 0;
		obj.arts = 0;

		let products = new Array();
		for(i in obj.products) {
			if(obj.products[i].code){
				if(obj.products[i] && obj.products[i].code instanceof Array) {
					for(let j=0; j<obj.products[i].code.length; j++){
						let product = new Object();
						product.code = obj.products[i].code[j]
						product.nome = obj.products[i].nome[j]
						product.photo = obj.products[i].photo[j]
						product.quot = parseInt(obj.products[i].quot[j])
						product.price = parseFloat(obj.products[i].price[j])
						product.total = parseFloat(obj.products[i].total[j])
						products.push(product)
						obj.pieces += product.quot;
						obj.arts++;
						obj.imp += product.total;
					}
				} else {
					let product = obj.products[i]
					product.quot = parseInt(product.quot)
					product.price = parseFloat(product.price)
					product.total = parseFloat(product.total)
					products.push(product)

					obj.pieces += product.quot;
					obj.arts++;
					obj.imp += product.total;
				}
			}
		}
		if(isNaN(obj.rlp)){
			obj.rlp = obj.imp;
		}
		obj.products = products
		
		if(!obj.cter) obj.cter = null;
	}


	Order.findOne({_id: obj._id}, function(err, order) { if(err) {
			info = "更新订单时, 查找数据库错误, 请联系管理员";
			Err.wsError(req, res, info);
	} else if(!order) {
		info = "此订单已经被删除，返回销售记录查看";
		Err.wsError(req, res, info);
	} else if(order.group != crWser.group) {
		info = "您不可以更改非本公司订单, 请联系管理员";
		Err.wsError(req, res, info);
	} else {
		let _order = _.extend(order, obj)
		_order.save(function(err, objSave) {
			if(err) {
				// console.log(err)
				info = "更新订单时, 数据保存错误, 请联系管理员";
				Err.wsError(req, res, info);
			} else {
				res.redirect('/bsOrder/'+objSave._id);
			}
		})
	} })

}




exports.bsOrderStatus = function(req, res) {
	let id = req.query.id
	let newStatus = req.query.newStatus
	Order.findOne({_id: id}, function(err, object){
		if(err) console.log(err);
		if(object){
			object.status = parseInt(newStatus)
			object.save(function(err,objSave) {
				if(err) console.log(err);
				res.json({success: 1, info: "已经更改"});
			})
		} else {
			res.json({success: 0, info: "已被删除，按F5刷新页面查看"});
		}
	})
}




exports.bsOrderDelAjax = function(req, res) {
	let crWser = req.session.crWser;

	let id = req.query.id;
	Order.findOne({_id: id}, function(err, order){ if(err) {
		res.json({success: 0, info: "删除订单时, 查找数据库错误, 请联系管理员"})
	} else if(!order){
		res.json({success: 0, info: "此订单已经被删除"})
	} else if(order.group != crWser.group){
		res.json({success: 0, info: "您不可以删除非本公司订单, 请联系管理员"})
	} else {
		Order.deleteOne({_id: order._id}, function(err, orderRm) { if(err) {
			res.json({success: 0, info: "删除订单时, 数据删除错误, 请联系管理员"})
		} else {
			res.json({success: 1})
		} })
	} })
}




exports.bsOrderPrinting = function(req, res) {
	let id = req.query.id
	let newPrint = req.query.newPrint;
	Order.findOne({_id: id}, function(err, object){
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
exports.bsOrderTicket = function(req, res) {
	let id = req.query.id
	let newTicket = req.query.newTicket;
	Order.findOne({_id: id}, function(err, object){
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

exports.bsOrderRelCter = function(req, res) {
	let crWser = req.session.crWser;

	let orderId = req.query.orderId;
	let cterId = req.query.cterId;

	Order.findOne({_id: orderId, 'group': crWser.group}, function(err, order) { if(err) {
		res.json({success: 0, info: "订单关联老客户时, 订单查找数据库错误, 请联系管理员"})
	} else if(!order) {
		res.json({success: 0, info: "此订单被删除，请确认"})
	} else {
		Cter.findOne({_id: cterId, 'group': crWser.group}, function(err, cter) { if(err) {
			res.json({success: 0, info: "订单关联老客户时, 客户查找数据库错误, 请联系管理员"})
		} else if (!cter) {
			res.json({success: 0, info: "此客户信息被删除"})
		} else {
			order.cter = cter._id;
			order.save(function(err, orderSave) {
				if(err) console.log(err);
				res.json({success: 1})
			})
		} })
	} })
}

exports.bsOrderAjaxPds = function(req, res) {
	let crWser = req.session.crWser;
	let id = req.query.id
	Order.findOne({_id: id}, function(err, order) { if(err) {
		res.json({success: 0, info: "更新订单时, 订单数据库查找错误, 请联系管理员"})
	} else if(!order) {
		res.json({success: 0, info: "没找到此订单，请刷新订单列表查看"})
	} else if(!order.products || order.products.length < 1){
		res.json({success: 0, info: "此订单中的产品数量为0，请联系管理员"})
	} else {
		res.json({success: 1, products: order.products})
	} })
}






































exports.bsOrders = function(req, res) {
	let crWser = req.session.crWser;
	let Lang = Language.wsLanguage('/wser', '/orders', crWser)

	Wser.find({'group': crWser.group})
	.where('role').ne(3)
	.exec(function(err, wsers) {
		if(err) {
			info = "bsOrders, Wser.find, Error";
			Err.wsError(req, res, info);
		} else {
			res.render('./wser/bser/order/list', {
				title : Lang.title,
				Lang: Lang,
				crWser: crWser,
				wsers : wsers,
				selWserCode: req.query.selWserCode,
			});
		}
	})
}

exports.bsOrdersAjax = function(req, res) {
	let crWser = req.session.crWser;

	let symOper = '$ne';
	let condOper = " ";
	// 在这的作用是 老板选择查看某人的出售订单使用
	if(req.query.selWserCode && req.query.selWserCode !=0 ) {
		symOper = '$eq';
		condOper = req.query.selWserCode;
	}

	let condWord = "";
	if(req.query.keyword) {
		condWord = req.query.keyword.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
	}

	// 根据创建时间筛选
	let begin = parseInt(req.query.begin);
	symCreatS = "$gte"; condCreatS = begin;
	symCreatF = "$lt"; condCreatF = begin + 24*60*60*1000;

	Order.find({
		'status': 2,
		'group': crWser.group,
		'code': new RegExp(condWord + '.*'),
		'ctAt': {[symCreatS]: condCreatS, [symCreatF]: condCreatF},
		'operater': {[symOper]: condOper},
	}, {products:0})
	.populate('cter', 'nome')
	.sort({"ctAt": -1})
	.exec(function(err, orders) { if(err) {
		res.json({success: 0, info: "bs查找订单时, 订单数据库错误, 请联系管理员"})
	} else {
		res.json({success: 1, orders: orders, keyword: req.query.keyword})
	} })
}

exports.bsOrdersMonth = function(req, res) {
	let crWser = req.session.crWser;
	let Lang = Language.wsLanguage('/wser', '/ordersMonth', crWser)

	ctAt = Date.parse(crWser.ctAt);
	let months = new Array();

	let now = new Date();
	let tMonth = now.getMonth();
	let tyear = now.getFullYear();
	let tFirst = new Date(tyear, tMonth, 1);
	let timestamps = tFirst.setHours(0, 0, 0, 0);
	let timestampf = now.setHours(23, 59, 59, 999);

	let month = new Object();
	month.key = String(tyear).slice(2,4)+Lang.year+(tMonth+1)+Lang.month;
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
		months[i].key = String(tyear).slice(2,4)+Lang.year+(tMonth+1)+Lang.month;
		months[i].vals = timestamps
		months[i].valf = timestampf
		if(timestampf < ctAt) break;
	}


	Wser.find({'group': crWser.group})
	.where('role').ne(3)
	.exec(function(err, wsers) {
		if(err) {
			info = "bsOrdersMonth, Wser.find, Error!";
			Err.wsError(req, res, info);
		} else {
			res.render('./wser/bser/order/listMonth', {
				title : Lang.title,
				Lang: Lang,
				crWser: crWser,
				wsers : wsers,
				selWserCode: req.query.selWserCode,
				months: months
			});
		}
	})
}
exports.bsOrdersMonthAjax = function(req, res) {
	let crWser = req.session.crWser;

	let symOper = '$ne';
	let condOper = " ";
	// 在这的作用是 老板选择查看某人的出售订单使用
	if(req.query.selWserCode && req.query.selWserCode !=0 ) {
		symOper = '$eq';
		condOper = req.query.selWserCode;
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

	Order.find({
		'status': 2,
		'group': crWser.group,
		'code': new RegExp(condWord + '.*'),
		'ctAt': {[symCreatS]: condCreatS, [symCreatF]: condCreatF},
		'operater': {[symOper]: condOper},
	}, {products:0})
	.populate('cter')
	.sort({"ctAt": -1})
	.exec(function(err, orders) { if(err) {
		res.json({success: 0, info: "bsOrdersMonthAjax, Order.find, Error!"})
	} else {
		res.json({success: 1, orders: orders, keyword: req.query.keyword})
	} })
}


exports.bsOrderExcel = function(req, res) {
	let order = req.body.object;

	let cter = new Object();
	if(order.cter) cter = order.cter;
	let group = new Object();
	if(order.group) group = order.group;

	let xl = require('excel4node');
	let wb = new xl.Workbook({
		defaultFont: {
			size: 12,
			color: '333333'
		},
		dateFormat: 'yyyy-mm-dd hh:mm:ss'
	});
	
	let ws = wb.addWorksheet('Sheet 1');
	ws.column(1).setWidth(10);
	ws.column(2).setWidth(15);
	ws.column(3).setWidth(15);
	ws.column(4).setWidth(10);
	ws.column(5).setWidth(10);
	ws.column(6).setWidth(15);

	let rw = 1;

	ws.row(rw).setHeight(35);
	style = wb.createStyle({
		font: {color: '#228B22', size: 18,},
		alignment: { 
			horizontal: ['center'],
		},
	})
	ws.cell(rw, 1, rw, 6, true).string(group.code).style(style)
	rw++;

	ws.row(rw).setHeight(20);
	style = wb.createStyle({
		font: {color: '#808080', size: 15,},
		alignment: { 
			horizontal: ['center'],
			vertical: ['top']
		},
	})
	ws.cell(rw, 1, rw, 6, true).string('PREVENTIVO').style(style)
	rw++;

	ws.cell(rw,1).string('地址');
	if(group && group.addr) ws.cell(rw,2).string(String(group.addr));
	ws.cell(rw, 3, rw, 4, true).string(' ')
	ws.cell(rw,5).string('No:');
	if(order.code) ws.cell(rw,6).string(String(order.code));
	rw++;

	ws.cell(rw,1).string('电话');
	if(group && group.tel) ws.cell(rw,2).string(String(group.tel));
	ws.cell(rw, 3, rw, 4, true).string(' ')
	ws.cell(rw,5).string('Date:');
	if(order.code) ws.cell(rw,6).string(moment(order.ctAt).format('MM/DD/YYYY'));
	rw++;

	ws.cell(rw, 1, rw, 6, true).string(' ')
	rw++;
	// header
	ws.cell(rw,1).string('NB.');
	ws.cell(rw,2).string('CODICE');
	ws.cell(rw,3).string('DESC.');
	ws.cell(rw,4).string('QNT');
	ws.cell(rw,5).string('PREZZO');
	ws.cell(rw,6).string('TOTAL');

	rw++;

	if(order.products) {
		let len = order.products.length;
		for(let i=0; i<len; i++){
			let product = order.products[i];
			ws.row(rw).setHeight(25);
			ws.cell((rw), 1).string(String(i+1));
			if(product.code) ws.cell((rw), 2).string(String(product.code));
			if(product.nome) ws.cell((rw), 3).string(String(product.nome));
			if(!isNaN(parseInt(product.quot))) {
				ws.cell((rw), 4).string(String(product.quot));
			}
			if(!isNaN(parseFloat(product.price))) {
				ws.cell((rw), 5).string((product.price).toFixed(2) + ' €');
			}
			if(!isNaN(parseFloat(product.total))) {
				ws.cell((rw), 6).string((product.total).toFixed(2) + ' €');
			}

			rw++;
		}

		ws.row(rw).setHeight(30);
		ws.cell((rw), 2).string('T.Art: '+ len);
		ws.cell((rw), 4).string('Tot: '+ order.pieces +'pz');
		ws.cell((rw), 6).string('IMP: '+ Math.round(order.imp * 100)/100);
		rw++;

		ws.cell((rw), 6).string('实收: '+ Math.round(order.imp * 100)/100);
		rw++;
	}

	if(order.note) {
		ws.row(rw).setHeight(30);
		ws.cell(rw, 1, rw, 6, true).string('Note: ' + order.note)
	}

	wb.write(order.code + '.xlsx', res);
}



exports.bsOrderPDF = function(req, res) {
	let bsRoot = require('path').join(__dirname, "../../../");
	let order = req.body.object;
	let cter = new Object();
	if(order.cter) cter = order.cter;
	let group = new Object();
	if(order.group) group = order.group;

	let pug = require('pug');
	let hc = require('pug').renderFile(bsRoot + 'views/zzPdf/order/aaPdf.pug', {
		static: "file://"+bsRoot + 'static',
		moment : require('moment'),
		// title: 'order PDF',

		order: order,
		group: group,
		cter: cter,
	});
	res.pdfFromHTML({
		filename: order.code + '.pdf',
		htmlContent: hc
	});
}
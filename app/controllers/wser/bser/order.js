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
		else {					//否则查看是否有0状态的订单 , 因为没有参数，所以进行判断
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
			bsOrderCrt(req, res);
		}
	})
}
let bsOrderCrt = function(req, res, cpOrder) {
	let crWser = req.session.crWser;
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
		if(cpOrder) {
			orderObj.status = 2;
			orderObj.sells = cpOrder.sells;
			orderObj.cter = cpOrder.cter;

			orderObj.arts = cpOrder.arts;
			orderObj.pieces = cpOrder.pieces;
			orderObj.imp = cpOrder.imp;
		}
		let _order = new Order(orderObj);
		bsOrderLoopSave(req, res, orderObj, cpOrder);
	}})
}
let bsOrderLoopSave = function(req, res, obj, cpOrder) {
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
		bsOrderLoopSave(req, res, obj, cpOrder);
	} else {
		if(!obj.cter || obj.cter.length <20) obj.cter = null;
		let _order = new Order(obj)
		_order.save(function(err, objSave) {
			if(err) {
				console.log(err);
				info = "bsOrderLoopSave, _order.save, Error!";
				Err.wsError(req, res, info);
			} else if(cpOrder) {
				bsOrderSellsChange(req, objSave._id, obj.sells, 0, 1);
				res.redirect('/bsOrder/'+objSave._id)
			} else {
				res.redirect('/bsOrderAdd?orderId='+objSave._id)
			}
		})
	} })
}

let bsOrderAddShowPage = function(req, res, order) {
	let crWser = req.session.crWser;
	let Lang = Language.wsLanguage('/wser', '/orderAdd', crWser);
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


// 模糊查找出产品
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
// 选择唯一的产品操作
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

// orderAdd 操作 order中的 pd
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
					let flag = 1;	// flag是判断 增 删 改 的标记
					// 循环order中的sells 找出对应的 product
					for(i=0; i<order.sells.length;i++){
						// 找出与prodThr相对应的 order中的sell
						if(String(order.sells[i].prodThr) == String(prodThr._id)) {
							// 循环prodThr中的sells 找出对应的 product
							for(j=0;j<prodThr.sells.length;j++) {
								// 找出与order相对应的 prodThr中的sell
								if(String(prodThr.sells[j].order) == String(order._id)) {

									prodThr.stock = parseInt(prodThr.stock) - (parseInt(quot) - parseInt(order.sells[i].quot)); // 库存
									prodThr.sellQuot = parseInt(prodThr.sellQuot) + (parseInt(quot) - parseInt(order.sells[i].quot)); // 销量
									if(quot == 0) {
										// 删除 order.sells 和 prodThr.sells
										prodThr.sells.remove(prodThr.sells[j])
										order.sells.remove(order.sells[i])
										flag = 2;
									} else {
										// 更新 order.sells 和 prodThr.sells
										prodThr.sells[j].quot = parseInt(quot);
										order.sells[i].quot = parseInt(quot);
										flag = 3;
									}
									break;
								}
							}
							break;
						}
					}
					// 添加 order sells pd
					if(flag == 1 && quot != 0) {
						let pdSell = new Object();
						pdSell.order = order._id;
						pdSell.quot = parseInt(quot);
						prodThr.sells.push(pdSell);
						prodThr.stock = parseInt(prodThr.stock) - parseInt(quot);
						prodThr.sellQuot = parseInt(prodThr.sellQuot) + parseInt(quot);

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
					prodThr.save(function(err, prodThrSave) {
						if(err) console.log(err);
					})
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

// orderAdd 点击选择客户
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
			object.pieces = parseFloat(pieces);
			object.imp = parseFloat(imp);
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
	res.redirect('/bsOrderAdd?orderId='+object._id)
}







exports.bsOrderCp = function(req, res) {
	let crWser = req.session.crWser;
	let Lang = Language.wsLanguage('/wser', '/orderCp', crWser);
	let object = req.body.object;
	bsOrderCrt(req, res, object);
}


let bsOrderSellsChange = function(req, orderId, sells, m, sym) {
	if(m == sells.length) {
		return;
	}
	let crWser = req.session.crWser;
	let sell = sells[m];
	Product.findOne({_id: sell.prodThr, 'group': crWser.group, 'layer': 3})
	.exec(function(err, prodThr) {
		if(err) {
			console.log(err);
			bsOrderSellsChange(req, orderId, sells, m+1, sym);
		} else if(!prodThr) {
			bsOrderSellsChange(req, orderId, sells, m+1, sym);
		} else {
			prodThr.stock = prodThr.stock - sym*sell.quot;
			prodThr.sellQuot = prodThr.sellQuot + sym*sell.quot;
			if(sym == 1) {
				let pdSell = new Object();
				pdSell.order = orderId,
				pdSell.quot = sell.quot;
				prodThr.sells.push(pdSell)
			} else if(sym == -1) {
				let len = prodThr.sells.length;
				for(i=0;i<len;i++) {
					if(prodThr.sells[i].order == orderId) {
						console.log(1)
						prodThr.sells.remove(prodThr.sells[i]);
						break;
					}
				}
			}
			prodThr.save(function(err, prodThrSave) {
				if(err) console.log(err);
				// console.log(prodThrSave)
				bsOrderSellsChange(req, orderId, sells, m+1, sym);
			})
		}
	})
}



exports.bsOrderDel = function(req, res) {
	let crWser = req.session.crWser;

	let object = req.body.object;
	Order.findOne({_id: object._id, 'group': crWser.group})
	.exec(function(err, order) {
		if(err) {
			console.log(err);
			info = "bsOrderDel, Order.findOne, Error!";
			Err.wsError(req, res, info);
		} else if(!order) {
			info = "订单已经不存在, 请刷新查看!";
			Err.wsError(req, res, info);
		} else if(order.bill) {
			info = "此订单还有未付款, 请先清除付款!";
			Err.wsError(req, res, info);
		} else {
			Order.deleteOne({_id: object._id}, function(err, orderRm) {
				if(err) {
					info = "bsOrderDel, Order.deleteOne, Error!";
					Err.wsError(req, res, info);
				} else {
					bsOrderSellsChange(req, order._id, order.sells, 0, -1);
					res.redirect("/bsOrders");
				}
			})
		}
	})
}


exports.bsOrderDelAjax = function(req, res) {
	let crWser = req.session.crWser;

	let id = req.query.id;
	Order.findOne({_id: id, 'group': crWser.group})
	.exec(function(err, order){ 
		if(err) {
			res.json({success: 0, info: "bsOrderDelAjax, Order.findOne, 请联系管理员"})
		} else if(!order){
			res.json({success: 0, info: "此订单已经被删除"})
		} else if(order.bill){
			res.json({success: 0, info: "此订单还有未付款, 请先清除付款!"})
		} else {
			Order.deleteOne({_id: order._id}, function(err, orderRm) { if(err) {
				res.json({success: 0, info: "删除订单时, 数据删除错误, 请联系管理员"})
			} else {
				res.json({success: 1})
			} })
		}
	})
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

// order Detail 关联 客户
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
	}, {sells:0})
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
	}, {sells:0})
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
	ws.column(1).setWidth(8);
	ws.column(2).setWidth(12);
	ws.column(3).setWidth(12);
	ws.column(4).setWidth(12);
	ws.column(5).setWidth(10);
	ws.column(6).setWidth(10);
	ws.column(7).setWidth(10);
	ws.column(8).setWidth(10);
	ws.column(9).setWidth(15);

	// 第一行： 表头 自己的公司名称
	let rw = 1;
	ws.row(rw).setHeight(35);
	style = wb.createStyle({
		font: {color: '#228B22', size: 18,},
		alignment: { 
			horizontal: ['center'],
		},
	})
	ws.cell(rw, 1, rw, 9, true).string(group.code).style(style)
	// 第二行 副标题
	rw++;
	ws.row(rw).setHeight(20);
	style = wb.createStyle({
		font: {color: '#808080', size: 15,},
		alignment: { 
			horizontal: ['center'],
			vertical: ['top']
		},
	})
	ws.cell(rw, 1, rw, 9, true).string('PREVENTIVO').style(style)
	// 第三行 地址和订单号
	rw++;
	ws.cell(rw,1).string('地址');
	if(group && group.addr) ws.cell(rw,2, rw,3, true).string(String(group.addr));
	ws.cell(rw, 4, rw, 6, true).string(' ')
	ws.cell(rw,7).string('No:');
	if(order.code) ws.cell(rw,8, rw,9, true).string(String(order.code));
	// 第四行 电话和日期
	rw++;
	ws.cell(rw,1).string('电话');
	if(group && group.tel) ws.cell(rw,2, rw,3, true).string(String(group.tel));
	ws.cell(rw, 4, rw, 6, true).string(' ')
	ws.cell(rw,7).string('Date:');
	if(order.code) ws.cell(rw,8, rw,9, true).string(moment(order.ctAt).format('MM/DD/YYYY'));
	// 第五行 空一行
	rw++;
	ws.cell(rw, 1, rw, 9, true).string(' ')
	// 第六行 table header
	rw++;
	ws.cell(rw,1).string('NB.');
	ws.cell(rw,2).string('CODICE');
	ws.cell(rw,3).string('DESC.');
	ws.cell(rw,4).string('材质');
	ws.cell(rw,5).string('门幅');
	ws.cell(rw,6).string('长度');
	ws.cell(rw,7).string('QNT');
	ws.cell(rw,8).string('PREZZO');
	ws.cell(rw,9).string('TOTAL');

	rw++;

	if(order.sells) {
		let len = order.sells.length;
		for(let i=0; i<len; i++){
			let sell = order.sells[i];
			let tot = sell.size * sell.quot * sell.price
			ws.row(rw).setHeight(25);
			ws.cell((rw), 1).string(String(i+1));
			if(sell.code) ws.cell((rw), 2).string(String(sell.code));
			if(sell.nome) ws.cell((rw), 3).string(String(sell.nome));
			if(sell.material) ws.cell((rw), 4).string(String(sell.material));
			if(sell.width) ws.cell((rw), 5).string(String(sell.width));
			if(!isNaN(parseInt(sell.size))) {
				ws.cell((rw), 6).string(String(sell.size));
			}
			if(!isNaN(parseInt(sell.quot))) {
				ws.cell((rw), 7).string(String(sell.quot));
			}
			if(!isNaN(parseFloat(sell.price))) {
				ws.cell((rw), 8).string((sell.price).toFixed(2) + ' €');
			}
			if(!isNaN(parseFloat(sell.total))) {
				ws.cell((rw), 9).string((tot).toFixed(2) + ' €');
			}

			rw++;
		}

		ws.row(rw).setHeight(30);
		ws.cell((rw), 2).string('T.Art: '+ len);
		ws.cell((rw), 7).string('Tot: '+ order.pieces +'pz');
		ws.cell((rw), 9).string('IMP: '+ Math.round(order.imp * 100)/100);
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
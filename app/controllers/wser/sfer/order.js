let Err = require('../aaIndex/err')
let Language = require('../aaIndex/language')

let ObjDB = require('../../../models/matter/order');
let Product = require('../../../models/material/product');
let Cter = require('../../../models/user/cter');

let _ = require('underscore')

let moment = require('moment')

exports.sfOrders = function(req, res) {
	let crWser = req.session.crWser;
	let Lang = Language.wsLanguage('/wser', '/orders', crWser)

	res.render('./wser/sfer/order/list', {
		title : Lang.title,
		Lang: Lang,
		crWser: crWser,
	});
}

exports.sfOrdersAjax = function(req, res) {
	let crWser = req.session.crWser;

	let symOper = '$ne';
	let condOper = " ";
	// 为了员工只能看到自己的出售记录
	if(crWser.role != 1) {
		symOper = '$eq';
		condOper = crWser.code;
	}
	// 在这的作用是 老板选择查看某人的出售订单使用
	else if(req.query.selSferCode && req.query.selSferCode !=0 ) {
		symOper = '$eq';
		condOper = req.query.selSferCode;
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
		'group': crWser.group,
		'code': new RegExp(condWord + '.*'),
		'ctAt': {[symCreatS]: condCreatS, [symCreatF]: condCreatF},
		'operater': {[symOper]: condOper},
	}, {products: 0})
	.populate('cter')
	.sort({"ctAt": -1})
	.exec(function(err, orders) { if(err) {
		res.json({success: 0, info: "sf查找订单时, 订单数据库错误, 请联系管理员"})
	} else {
		res.json({success: 1, orders: orders, keyword: req.query.keyword})
	} })
}

exports.sfOrdersMonth = function(req, res) {
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



	res.render('./wser/sfer/order/listMonth', {
		title : Lang.title,
		Lang: Lang,
		crWser: crWser,
		selSferCode: req.query.selSferCode,
		months: months
	});
		
}
exports.sfOrdersMonthAjax = function(req, res) {
	let crWser = req.session.crWser;

	let symOper = '$ne';
	let condOper = " ";
	// 为了员工只能看到自己的出售记录
	if(crWser.role != 1) {
		symOper = '$eq';
		condOper = crWser.code;
	}
	// 在这的作用是 老板选择查看某人的出售订单使用
	else if(req.query.selSferCode && req.query.selSferCode !=0 ) {
		symOper = '$eq';
		condOper = req.query.selSferCode;
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
		'group': crWser.group,
		'code': new RegExp(condWord + '.*'),
		'ctAt': {[symCreatS]: condCreatS, [symCreatF]: condCreatF},
		'operater': {[symOper]: condOper},
	}, {products:0})
	.populate('cter')
	.sort({"ctAt": -1})
	.exec(function(err, orders) { if(err) {
		res.json({success: 0, info: "sfOrdersMonthAjax, ObjDB.find, Error!"})
	} else {
		res.json({success: 1, orders: orders, keyword: req.query.keyword})
	} })
}


exports.sfOrderFilter = function(req, res, next) {
	let id = req.params.id
	ObjDB.findOne({_id: id})
	.populate('group')
	.populate('cter')
	.exec(function(err, object) { if(err) {
		info = "sf查看订单时, 订单数据库错误, 请联系管理员";
		Err.wsError(req, res, info);
	} else if(!object) {
		info = "数据已经被删除，请刷新查看";
		Err.wsError(req, res, info);
	} else if(!object.group){
		info = "sf查看订单时, 本公司数据不存在, 请联系管理员";
		Err.wsError(req, res, info);
	} else {
		req.body.object = object;
		next()
	} })
}

exports.sfOrder = function(req, res) {
	let crWser = req.session.crWser;
	let Lang = Language.wsLanguage('/wser', '/order', crWser)

	let object = req.body.object;
	let objBody = new Object();
	objBody.object = object;
	objBody.group = object.group;
	objBody.title = Lang.title;
	objBody.Lang = Lang;
	objBody.crWser = crWser;
	objBody.thisAct = "/sfOrder";

	res.render('./wser/sfer/order/detail', objBody);
}

exports.sfOrderUp = function(req, res) {
	let crWser = req.session.crWser;
	let Lang = Language.wsLanguage('/wser', '/orderUp', crWser);

	let object = req.body.object;
	let objBody = new Object();
	objBody.object = object;
	objBody.group = object.group;
	objBody.title = Lang.title;
	objBody.Lang = Lang;
	objBody.crWser = crWser;
	objBody.thisAct = "/sfOrder";
	objBody.thisUrl = "/sfOrderUp";

	res.render('./wser/sfer/order/update', objBody);
}
exports.sfOrderCp = function(req, res) {
	let crWser = req.session.crWser;
	let Lang = Language.wsLanguage('/wser', '/orderCp', crWser);

	let object = req.body.object;
	let objBody = new Object();
	objBody.object = object;
	objBody.group = object.group;
	objBody.title = Lang.title;
	objBody.Lang = Lang;
	objBody.crWser = crWser;
	objBody.thisAct = "/sfOrder";
	objBody.thisUrl = "/sfOrderCp";

	let today = new Date();
	let begin = today.setHours(0, 0, 0, 0);
	ObjDB.findOne({
		'ctAt': {'$gte': begin},
		'operater': req.session.crWser.code,
	})
	.sort({"ctAt": -1})
	.limit(1)
	.exec(function(err, order) { if(err) {
		info = "销售订单数据库中的数据错误, 请联系管理员";
		Err.wsError(req, res, info);
	} else {
		objBody.code = getBsCode(order, crWser.cd);
		res.render('./wser/sfer/order/copy', objBody);
	}})
}


exports.sfOrderUpd = function(req, res) {
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


	ObjDB.findOne({_id: obj._id}, function(err, order) { if(err) {
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
				res.redirect('/sfOrder/'+objSave._id);
			}
		})
	} })

}



exports.sfOrderAdd =function(req, res) {
	let crWser = req.session.crWser;
	let Lang = Language.wsLanguage('/wser', '/orderAdd', crWser);

	let today = new Date();
	let begin = today.setHours(0, 0, 0, 0);
	ObjDB.findOne({
		'ctAt': {'$gte': begin},
		'operater': req.session.crWser.code,
	})
	.sort({"ctAt": -1})
	.limit(1)
	.exec(function(err, order) { if(err) {
		info = "bsOrderAdd, ObjDB.findOne, Error!";
		Err.wsError(req, res, info);
	} else {
		let code = getSfCode(order, crWser.cd);
		res.render('./wser/sfer/order/add', {
			title: Lang.title,
			Lang: Lang,
			crWser : req.session.crWser,
			code: code,
			thisUrl: "/sfOrderAdd",
			thisAct: "/sfOrder",
		})
	}})
}

// YYMMDDXXNUM   190205XD0012
getSfCode = function(order, userCd) {
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

exports.sfOrderNew = function(req, res) {
	let crWser = req.session.crWser;

	let obj = req.body.obj;
	let products = new Array();

	obj.operater = req.session.crWser.code;

	// obj.imp = parseFloat(obj.imp);
	obj.rlp = parseFloat(obj.imp);

	obj.imp = 0;
	obj.pieces = 0;
	obj.arts = 0;
	// console.log(obj.products[2])
	for(i in obj.products) {
		if(obj.products[i].code){
			// 防止前端的一个错误 清除一个产品后数组标记错误
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
					obj.arts ++;
					obj.imp += product.total;
				}
			} else {
				let product = obj.products[i]
				product.quot = parseInt(product.quot)
				product.price = parseFloat(product.price)
				product.total = parseFloat(product.total)
				products.push(product)

				obj.pieces += product.quot;
				obj.arts ++;
				obj.imp += product.total;
			}
		}
	}
	if(isNaN(obj.rlp)){
		obj.rlp = obj.imp;
	}
	obj.products = products
	if(products.length < 1) {
		info = "订单中产品不能为空";
		Err.wsError(req, res, info);
	} else {
		obj.group = crWser.group;
		sfOrderSave(req, res, obj, products);
	}
}
sfOrderSave = function(req, res, obj, products) {
	let crWser = req.session.crWser;
	ObjDB.findOne({'code': obj.code, 'group': crWser.group})
	.exec(function(err, order) { if(err) {
		info = "sf添加订单时, 查找数据库错误, 请联系管理员";
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
		sfOrderSave(req, res, obj, products);
	} else {
		if(!obj.cter || obj.cter.length <20) obj.cter = null;
		let _order = new ObjDB(obj)
		_order.save(function(err, objSave) {
			if(err) {
				console.log(err);
				info = "sf添加订单时, 订单保存错误, 请联系管理员";
				Err.wsError(req, res, info);
			} else {
				sfProdSave(products, 0, objSave._id, crWser.group);
				res.redirect('/sfOrder/'+objSave._id);
			}
		})
	} })
}
sfProdSave = function(products, i, orderId, group){
	if(i == products.length){ return; }
	
	// console.log(products[i].numb)
	Product.findOne({code: products[i].code, group: group})
	.exec(function(err, product) { if(err) {
		info = "sf添加订单时, 产品查找错误, 请联系管理员";
		Err.wsError(req, res, info);
	} else {
		let sell = new Object();
		sell.order = orderId;
		sell.quot = products[i].quot;
		sell.tmAt = Date.now();
		product.sells.unshift(sell);
		if(!product.sellQuot) product.sellQuot = 0;
		product.sellQuot += products[i].quot;

		product.stock -= products[i].quot;
		product.save(function(err, productSave) { if(err) {
			info = "sf添加订单时, 产品保存错误, 请联系管理员";
			Err.wsError(req, res, info);
		} else {
			sfProdSave(products, i+1, orderId, group)
		} })
	} })
}





exports.sfOrderStatus = function(req, res) {
	let id = req.query.id
	let newStatus = req.query.newStatus
	ObjDB.findOne({_id: id}, function(err, object){
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

exports.sfOrderPrinting = function(req, res) {
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
exports.sfOrderTicket = function(req, res) {
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

exports.sfOrderRelCter = function(req, res) {
	let crWser = req.session.crWser;

	let orderId = req.query.orderId;
	let cterId = req.query.cterId;

	ObjDB.findOne({_id: orderId, 'group': crWser.group}, function(err, order) { if(err) {
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

exports.sfOrderAjaxPds = function(req, res) {
	let crWser = req.session.crWser;
	let id = req.query.id
	ObjDB.findOne({_id: id}, function(err, order) { if(err) {
		res.json({success: 0, info: "更新订单时, 订单数据库查找错误, 请联系管理员"})
	} else if(!order) {
		res.json({success: 0, info: "没找到此订单，请刷新订单列表查看"})
	} else if(!order.products || order.products.length < 1){
		res.json({success: 0, info: "此订单中的产品数量为0，请联系管理员"})
	} else {
		res.json({success: 1, products: order.products})
	} })
}





exports.sfOrderExcel = function(req, res) {
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



exports.sfOrderPDF = function(req, res) {
	let sfRoot = require('path').join(__dirname, "../../../");
	let order = req.body.object;
	let cter = new Object();
	if(order.cter) cter = order.cter;
	let group = new Object();
	if(order.group) group = order.group;

	let pug = require('pug');
	let hc = require('pug').renderFile(sfRoot + 'views/zzPdf/order/aaPdf.pug', {
		static: "file://"+sfRoot + 'static',
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
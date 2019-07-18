let Err = require('../aaIndex/err')
let Language = require('../aaIndex/language')

let MdPicture = require('../../../middle/middlePicture');
let Conf = require('../../../confile/conf');

let ObjDB = require('../../../models/material/product');
let Pdname = require('../../../models/material/pdname');
let Group = require('../../../models/user/wsgp');

let _ = require('underscore');

exports.bsProds = function(req, res) {
	let crWser = req.session.crWser;
	let Lang = Language.wsLanguage('/wser', '/prods', crWser);

	let sortCond = req.query.sortCond || 'sellQuot';
	let sortVal = req.query.sortVal || -1;
	ObjDB.countDocuments({'group': crWser.group, layer: 1})
	.exec(function(err, count) {
		if(err) {
			info = "bsProds, ObjDB.countDocuments, Error!";
			Err.wsError(req, res, info);
		} else {
			let objBody = new Object()

			objBody.title = Lang.title+'('+count+')'; 
			objBody.Lang = Lang; 
			objBody.crWser = crWser;
			objBody.count = count;
			objBody.thisAct = "/bsProd";
			objBody.sortCond = sortCond;
			objBody.sortVal = sortVal;
			objBody.skip = 0;

			res.render('./wser/bser/product/list', objBody);
		}
	})
}

exports.bsProdsAjax = function(req, res) {
	let crWser = req.session.crWser;

	let keySymb = '$ne';
	let keyword = ' x ';
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
		skip = parseInt(req.query.skip);
	}

	ObjDB.countDocuments({
		'group': crWser.group,
		'layer': 1,
		$or:[
			{'code': {[keySymb]: keyword}},
			{'nome': {[keySymb]: keyword}},
		],
	}, function(err, keyCount) {
		if(err) {
			res.json({success: 0, info: "bsProdsAjax, ObjDB.countDocuments, Error"})
		} else {
			// console.log(keyCount)
			ObjDB.find({
				'group': crWser.group,
				'layer': 1,
				$or:[
					{'code': {[keySymb]: keyword}},
					{'nome': {[keySymb]: keyword}},
				],
			})
			.populate('prodcls')
			.sort({[sortCond]: sortVal})
			.skip(skip)
			.limit(6)
			.exec(function(err, objects) { if(err) {
				res.json({success: 0, info: "bsProdsAjax, ObjDB.find, Error"})
			} else {
				// console.log(objects)
				res.json({success: 1, objects: objects, keyCount: keyCount})
			} })
		}
	})
}



exports.bsProdFilter = function(req, res, next) {
	let crWser = req.session.crWser;
	let id = req.params.id;
	ObjDB.findOne({_id: id, 'group': crWser.group, 'layer': 1,})
	.populate('sells.order', 'code')
	.populate({path: 'prodcls', populate: {path: 'prodszs'}})
	.exec(function(err, object) {
		if(err) {
			console.log(err);
			info = "查看产品信息时，数据库查找出错, 请联系管理员";
			Err.wsError(req, res, info);
		} else if(!object) {
			info = "此产品已经被删除";
			Err.wsError(req, res, info);
		} else if(object.group != crWser.group) {
			info = "您只能查看自己公司的产品";
			Err.wsError(req, res, info);
		} else {
			req.body.object = object;
			next();
		}
	})
}

exports.bsProd = function(req, res) {
	let crWser = req.session.crWser;
	Group.findOne({_id: crWser.group}, function(err, company) {
		if(err) console.log(err);

		let Lang = Language.wsLanguage('/wser', '/prod', crWser);

		let object = req.body.object;
		// console.log(object);
		let objBody = new Object();
		objBody.colors = company.colors;
		objBody.crWser = crWser;
		objBody.object = object;
		objBody.thisAct = "/bsProd";
		objBody.title = Lang.title;
		objBody.Lang = Lang;
		// console.log(object.prodcls)
		res.render('./wser/bser/product/detail', objBody);
	})
}





exports.bsProdUpd = function(req, res) {
	let crWser = req.session.crWser;
	let obj = req.body.obj;
	if(obj.code) obj.code= obj.code.replace(/\s+/g,"").toUpperCase();
	if(obj.nome) obj.nome= obj.nome.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();

	if(obj.price) obj.price = parseFloat(obj.price);
	if(obj.priceIn) {
		obj.priceIn = parseFloat(obj.priceIn);
		if(isNaN(obj.priceIn)) obj.priceIn = 0;
	}

	if(obj.stock && !isNaN(parseInt(obj.stock))) {
		obj.stock = parseInt(obj.stock);
	}

	ObjDB.findOne({_id: obj._id, 'group': crWser.group, 'layer': 1})
	.exec(function(err, object) {
		if(err) {
			info = "修改产品信息时，数据库查找出错, 请联系管理员";
			Err.wsError(req, res, info);
		} else if(!object) {
			info = "此产品已经被删除";
			Err.wsError(req, res, info);
		} else if(object.group != crWser.group) {
			info = "您只能修改自己公司的产品";
			Err.wsError(req, res, info);
		} else {
			ObjDB.findOne({code: obj.code, 'group': crWser.group, 'layer': 1})
			.where('_id').ne(obj._id)
			.exec(function(err, objSame) {
				if(err) console.log(err);
				if(objSame) {
					info = "已经存在此编号，请重新输入编号";
					Err.wsError(req, res, info);
				} else {
					if(object.nome != obj.nome) {
						bsPdRelNome(crWser.group, object.nome, -1);
						bsPdRelNome(crWser.group, obj.nome, 1);
					}
					let _object = _.extend(object, obj);
					_object.save(function(err, objSave){
						if(err) {
							console.log(err);
							info = "修改产品信息时，数据库保存出错, 请联系管理员";
							Err.wsError(req, res, info);
						} else {
							res.redirect('/bsProd/'+objSave._id);
						}
					})
				}
			})
		}
	})
}


exports.bsProdDel = function(req, res) {
	let crWser = req.session.crWser;
	let id = req.params.id;
	ObjDB.findOne({_id: id, 'group': crWser.group, 'layer': 1})
	.populate({path: 'prodcls', populate: {path: 'prodszs'}})
	.exec(function(err, object){
		if(object.layer == 1 && object.prodcls.length == 0) {
			let orgPhoto = object.photo;
			MdPicture.deleteOldPhoto(orgPhoto, Conf.photoPath.proPhoto);
			bsPdRelNome(crWser.group, object.nome, -1);
			ObjDB.deleteOne({_id: object._id}, function(err, objRm) {
				if(err) {
					info = "删除产品时，数据库删除出错, 请联系管理员";
					Err.wsError(req, res, info);
				} else {
					res.redirect('/bsProds');
				}
			})
		} else {
			info = "bsProdDel, 先删除所有颜色子元素, 请联系管理员";
			Err.wsError(req, res, info);
		}
	})
}


exports.bsProdAdd =function(req, res) {
	let crWser = req.session.crWser;
	let Lang = Language.wsLanguage('/wser', '/prodAdd', crWser);

	Pdname.find({'group': crWser.group})
	.sort({'freq': -1})
	.limit(20)
	.exec(function(err, pdnames) {
		Group.findOne({_id: crWser.group}, function(err, company) {
			if(err) console.log(err);
			res.render('./wser/bser/product/add', {
				title: Lang.title,
				Lang: Lang,
				crWser : crWser,
				thisAct: "/bsProd",
				pdnames: pdnames,
				colors: company.colors
			})
		})
	})
}


exports.bsProdNew = function(req, res) {
	let crWser = req.session.crWser;
	let obj = req.body.obj;
	obj.layer = 1;
	obj.group = crWser.group;

	if(obj.price) obj.price = parseFloat(obj.price);
	if(obj.priceIn) obj.priceIn = parseFloat(obj.priceIn);

	if(!obj.code || !obj.nome || isNaN(obj.price) || isNaN(obj.priceIn)) {
		info = "bsProdNew, The input data is Error";
		Err.wsError(req, res, info);
	} else {
		obj.code = obj.code.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
		obj.nome = obj.nome.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();

		let sizes = new Array();
		if(obj.sizes) {
			if(obj.sizes instanceof Array) {
				for(i=0; i<obj.sizes.length; i++) {
					sizes.push(parseInt(obj.sizes[i]));
				}
			} else {
				sizes.push(obj.sizes);
			}
		} else {
			sizes.push('1');
		}
		obj.sizes = sizes;

		let colors = new Array();
		if(obj.colors) {
			if(obj.colors instanceof Array) {
				for(i=0; i<obj.colors.length; i++) {
					if(obj.colors[i].length > 0) {
						colors.push(obj.colors[i].toUpperCase());
					}
				}
			} else {
				if(obj.colors.length>0) {
					colors.push(obj.colors.toUpperCase());
				} else {
					colors.push('CL');
				}
			}
		}
		// console.log(obj)
		ObjDB.findOne({code: obj.code, 'group': crWser.group, 'layer': 1})
		.exec(function(err, objSame) {
			if(err) console.log(err);
			if(objSame) {
				info = "此产品号已经存在，请重新填写";
				Err.wsError(req, res, info);
			} else {
				let _object = new ObjDB(obj)
				_object.save(function(err, objSave) {
					if(err) {
						console.log(err);
						info = "添加新产品时，数据库保存出错, 请联系管理员";
						Err.wsError(req, res, info);
					} else {
						bsPdRelNome(crWser.group, objSave.nome, 1);
						bsProdSecSave(objSave, colors, 0, crWser.group);
						res.redirect('/bsProd/'+objSave._id);
					}
				})
			}
		})
	}
}
let bsProdSecSave = function(prodFir, colors, n, group) {
	// console.log("n = " + n)
	if(n==colors.length) {
		prodFir.save(function(err, prodFirSave) {
			if(err) console.log(err);
		});
		return;
	}
	let prodSec = new Object();
	prodSec.group = group;
	prodSec.layer = 2;
	prodSec.color = colors[n];
	prodSec.product = prodFir._id;
	let _objSec = new ObjDB(prodSec);
	prodFir.prodcls.push(_objSec._id);	// 第一层pd链接第二层pd
	_objSec.save(function(err, prodSecSave) {
		if(err) console.log(err);
		bsProdThrSave(prodFir, colors, n, prodSecSave, 0, group);
	})
}
let bsProdThrSave = function(prodFir, colors, n, prodSec, m, group) {
	// console.log("m = " + m)
	if(m == prodFir.sizes.length) {
		prodSec.save(function(err, prodSecSave) {
			if(err) console.log(err);
		})
		bsProdSecSave(prodFir, colors, n+1, group)
		return;
	}
	let prodThr = new Object();
	prodThr.group = group;
	prodThr.layer = 3;
	prodThr.size = prodFir.sizes[m];
	prodThr.stock = 0;
	prodThr.product = prodFir._id;
	prodThr.prodcl = prodSec._id;
	let _objThr = new ObjDB(prodThr);
	prodSec.prodszs.push(_objThr._id);
	_objThr.save(function(err, prodThrSave) {
		if(err) console.log(err);
		bsProdThrSave(prodFir, colors, n, prodSec, m+1, group);
	})
}

let bsPdRelNome = function(group, nome, sym) {
	sym = parseInt(sym);
	if(sym == 1) {
		Pdname.findOne({'group': group, 'nome': nome})
		.exec(function(err, pdnameUp) {
			if(err) console.log(err);
			if(pdnameUp) {
				pdnameUp.freq++;
				pdnameUp.save(function(err, pdnameSave) {
					if(err) console.log(err);
				})
			} else {
				let pdnObj = new Object();
				pdnObj.group = group;
				pdnObj.nome = nome;
				pdnObj.freq = 1;
				let _pdname = new Pdname(pdnObj);
				_pdname.save(function(err, objSave) {
					if(err) console.log(err);
				})
			}
		})
	} else if(sym == -1) {
		Pdname.findOne({'group': group, 'nome': nome})
		.exec(function(err, pdnameUp) {
			if(err) console.log(err);
			if(pdnameUp) {
				pdnameUp.freq -= 1;
				if(pdnameUp.freq == 0) {
					Pdname.deleteOne({_id: pdnameUp._id}, function(err, pdnameDel) {
						if(err) console.log(err);
					})
				} else {
					pdnameUp.save(function(err, pdnameSave) {
						if(err) console.log(err);
					})
				}
			}
		})
	}
}



exports.bsProdDelAjax = function(req, res) {
	let crWser = req.session.crWser;
	let id = req.query.id
	ObjDB.findOne({_id: id, 'group': crWser.group, 'layer': 1})
	.populate('prodcls')
	.exec(function(err, object){
		if(err) {
			info = "bsProdDelAjax, ObjDB.findOne Error!";
			Err.wsError(req, res, info);
		} else if(!object){
			res.json({success: 0, info: "已被删除，按F5刷新页面查看"})
		} else if(object.prodcls && object.prodcls.length > 0){
			res.json({success: 0, info: "请先删除颜色, 再删除产品"})
		} else {
			MdPicture.deleteOldPhoto(object.photo, Conf.photoPath.proPhoto)
			bsPdRelNome(crWser.group, object.nome, -1)
			ObjDB.deleteOne({_id: object._id}, function(err, objRm) {
				if(err) {
					res.json({success: 0, info: "删除产品时，数据库删除出错, 请联系管理员"})
				} else {
					res.json({success: 1})
				}
			})
		}
	})
}





exports.orderAjaxBsProds = function(req, res) {
	let crWser = req.session.crWser;
	let keytype = req.query.keytype
	let keyword = req.query.keyword
	keyword = String(keyword).replace(/(\s*$)/g, "").replace( /^\s*/, '');

	ObjDB.findOne({[keytype]: keyword, 'group': crWser.group, 'layer': 1})
	.exec(function(err, object){
		if(err) {
			res.json({success: 0, info: "bs获取产品时，数据库查找错误, 请联系管理员"});
		} else if(object){
			res.json({ success: 1, product: object})
		} else {
			ObjDB.find({
				'group': crWser.group,
				'layer': 1,
				[keytype]: new RegExp(keyword + '.*')
			})
			.exec(function(err, objects){
				if(err) {
					res.json({success: 0, info: "bs获取产品列表时，数据库查找错误, 请联系管理员"});
				} else if(objects && objects.length > 0){
					res.json({ success: 2, products: objects});
				} else {
					res.json({success: 0})
				}
			})
		}
	})
}


exports.ajaxBsProd = function(req, res) {
	let crWser = req.session.crWser;
	let keytype = req.query.keytype
	let keyword = req.query.keyword
	keyword = String(keyword).replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
	ObjDB.findOne({[keytype]: keyword, 'group': crWser.group, 'layer': 1})
	.exec(function(err, object){
		if(err) {
			res.json({success: 0, info: "bs获取产品时，数据库查找错误, 请联系管理员"});
		} else if(object){
			res.json({ success: 1, product: object})
		} else {
			res.json({success: 0})
		}
	})
}
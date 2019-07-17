let Err = require('../aaIndex/err')
let Language = require('../aaIndex/language')

let MdPicture = require('../../../middle/middlePicture');
let Conf = require('../../../confile/conf');

let ObjDB = require('../../../models/material/product');
let Pdname = require('../../../models/material/pdname');

let _ = require('underscore');

exports.bsProdclFilter = function(req, res, next) {
	let crWser = req.session.crWser;
	let id = req.params.id;
	ObjDB.findOne({_id: id, 'group': crWser.group, 'layer': 2})
	.populate('product')
	.populate('prodszs')
	.exec(function(err, object) {
		if(err) {
			console.log(err);
			info = "查看产品信息时，数据库查找出错, 请联系管理员";
			Err.wsError(req, res, info);
		} else if(!object) {
			info = "此产品已经被删除"
			Err.wsError(req, res, info)
		} else {
			req.body.object = object
			next()
		}
	})
}

exports.bsProdcl = function(req, res) {
	let crWser = req.session.crWser;
	let Lang = Language.wsLanguage('/wser', '/prod', crWser)

	let object = req.body.object;
	// console.log(object)
	let objBody = new Object();

	objBody.crWser = crWser;
	objBody.object = object;
	objBody.thisAct = "/bsProd";
	objBody.title = Lang.title;
	objBody.Lang = Lang;

	res.render('./wser/bser/product/pdColor', objBody);
}


exports.bsProdclDel = function(req, res) {
	let crWser = req.session.crWser;
	let object = req.body.object;
	let colorId = object._id;
	let prodFir = object.product;

	bsProdSecRmThr(object, 0);
	prodFir.prodcls.remove(colorId);
	prodFir.save(function(err, prodFirSave) {
		if(err) console.log(err);
		res.redirect('/bsprod/'+prodFir._id)
	})
}
let bsProdSecRmThr = function(prodSec, m) {
	if(m == prodSec.prodszs.length) {
		MdPicture.deleteOldPhoto(prodSec.photo, Conf.photoPath.proPhoto)
		ObjDB.deleteOne({_id: prodSec._id}, function(err, prodSecRm) {
			if(err) console.log(err);
		})
		return;
	}
	let prodsz = prodSec.prodszs[m];
	if(prodsz && prodsz._id){
		ObjDB.deleteOne({_id: prodsz._id}, function(err, prodThrRm){
			if(err) console.log(err);
		})
	}
	bsProdSecRmThr(prodSec, m+1);
}

exports.bsProdclUpd = function(req, res) {
	let crWser = req.session.crWser;
	let obj = req.body.obj
	if(!obj.color) {
		info = "颜色不能为空";
		Err.wsError(req, res, info);
	} else {
		obj.code = "";
		obj.color = obj.color.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
		ObjDB.findOne({_id: obj._id, 'group': crWser.group, 'layer': 2})
		.exec(function(err, object) {
			if(err) {
				info = "修改产品信息时，数据库查找出错, 请联系管理员";
				Err.wsError(req, res, info);
			} else if(!object) {
				info = "此产品已经被删除";
				Err.wsError(req, res, info);
			} else {
				let _object
				_object = _.extend(object, obj)
				// _object.attribs = obj.attribs;
				_object.save(function(err, objSave){
					if(err) {
						console.log(err);
						info = "修改产品信息时，数据库保存出错, 请联系管理员";
						Err.wsError(req, res, info);
					} else {
						res.redirect('/bsProdcl/'+objSave._id)
					}
				})
			}
		})
	}
}

exports.bsProdclStockAjax = function(req, res) {
	let crWser = req.session.crWser;
	let obj = req.body.obj
	if(obj.stock && !isNaN(parseInt(obj.stock))) {
		obj.stock = parseInt(obj.stock);
		ObjDB.findOne({_id: obj._id, 'group': crWser.group, 'layer': 2})
		.populate('prodszs')
		.exec(function(err, object) {
			if(err) {
				console.log(err);
				res.json({success: 0, info: "bsProdclStockAjax, ObjDB.findOne, Error!"});
			} else if(!object) {
				res.json({success: 0, info: "此产品已经被删除"});
			} else if(!object.prodszs) {
				res.json({success: 0, info: "请先添加长度尺寸"});
			} else if(object.prodszs.length < 1) {
				res.json({success: 0, info: "请先添加长度尺寸"});
			} else {
				bsProdSecSaveThrStock(req, res, obj.stock, object.prodszs, 0)
			}
		})
	} else {
		res.json({success: 0, info: "输入正确的数字!"});
	}
}
let bsProdSecSaveThrStock = function(req, res, newstock, prodszs, m) {
	if(m == prodszs.length) {
		res.json({success: 0});
	}
	let prodsz = prodszs[m];
	console.log(m)
	console.log(prodsz)
	console.log('-----------------')
	prodsz.stock = parseInt(newstock);
	prodsz.save(function(err, prodThrSave) {
		if(err) console.log(err);
		bsProdSecSaveThrStock(req, res, newstock, prodszs, m+1)
	})
}

exports.bsProdclNew = function(req, res) {
	let crWser = req.session.crWser;
	let obj = req.body.obj;
	obj.layer = 2;
	obj.group = crWser.group;
	if(!obj.color) {
		info = "请先进入公司页面添加颜色";
		Err.wsError(req, res, info);
	} else {
		ObjDB.findOne({_id: obj.product, 'group': crWser.group, 'layer': 1})
		.exec(function(err, prodFir) {
			if(err) {
				console.log(err);
				info = "bsProdclNew, ObjDB.findOne, Error!";
				Err.wsError(req, res, info);
			} else if(!prodFir) {
				info = "此产品号已不经存在, 请刷新查看";
				Err.wsError(req, res, info);
			} else {
				obj.color = obj.color.replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
				let _object = new ObjDB(obj)
				_object.save(function(err, objSave) {
					if(err) {
						console.log(err);
						info = "bsProdclNew, _object.save, Error!";
						Err.wsError(req, res, info);
					} else {
						prodFir.prodcls.push(objSave._id);
						prodFir.save(function(err, prodFirSave) {
							if(err) console.log(err);
							bsProdSecSaveThr(prodFir, objSave, 0, crWser.group);
							res.redirect('/bsProd/'+prodFir._id)
						})
					}
				})
			}
		})
	}
}
let bsProdSecSaveThr = function(prodFir, prodSec, m, group) {
	// console.log("m = " + m)
	if(m == prodFir.sizes.length) {
		prodSec.save(function(err, prodSecSave) {
			if(err) console.log(err);
		})
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
		bsProdSecSaveThr(prodFir, prodSec, m+1, group);
	})
}
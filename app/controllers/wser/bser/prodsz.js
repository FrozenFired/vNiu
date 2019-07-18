let Err = require('../aaIndex/err')
let Language = require('../aaIndex/language')

let MdPicture = require('../../../middle/middlePicture');
let Conf = require('../../../confile/conf');

let ObjDB = require('../../../models/material/product');
let Pdname = require('../../../models/material/pdname');

let _ = require('underscore');

exports.bsProdszFilter = function(req, res, next) {
	let crWser = req.session.crWser;
	let id = req.params.id;
	ObjDB.findOne({_id: id, 'group': crWser.group, 'layer': 3})
	.populate('product')
	.populate('prodcl')
	.populate('sells.order')
	.exec(function(err, object) {
		if(err) {
			console.log(err);
			info = "查看产品信息时，数据库查找出错, 请联系管理员";
			Err.wsError(req, res, info);
		} else if(!object) {
			info = "此产品已经被删除"
			Err.wsError(req, res, info)
		} else {
			req.body.object = object;
			next();
		}
	})
}

exports.bsProdsz = function(req, res) {
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

	res.render('./wser/bser/product/pdSize', objBody);
}





exports.bsProdszUpdAjax = function(req, res) {
	let crWser = req.session.crWser;
	let obj = req.body.obj
	if(obj.stock && !isNaN(parseInt(obj.stock))) {
		obj.stock = parseInt(obj.stock);
	}
	// console.log(obj)
	ObjDB.findOne({_id: obj._id, 'group': crWser.group, 'layer': 3})
	.exec(function(err, object) {
		if(err) {
			console.log(err);
			res.json({success: 0, info: "bsProdszUpdAjax, ObjDB.findOne, Error!"});
		} else if(!object) {
			res.json({success: 0, info: "此产品已经被删除"});
		} else {
			let _object
			_object = _.extend(object, obj)
			_object.save(function(err, objSave){
				if(err) {
					console.log(err);
					res.json({success: 0, info: "bsProdszUpdAjax, _object.save, Error!"});
				} else {
					res.json({success: 1, stock: objSave.stock});
				}
			})
		}
	})
}




exports.bsProdszProof = function(req, res) {
	let object = req.body.object;

	let sellQuot = 0;
	if(object.sells) {
		let sells = new Array();
		let len = object.sells.length
		for(i=0; i<len; i++){
			if(object.sells[i].order) {
				sellQuot += object.sells[i].quot;
				sells.push(object.sells[i]);
			}
		}
		object.sells = sells;
	}
	object.sellQuot = sellQuot;
	object.save(function(err, objSave) {
		if(err) {
			console.log(err);
			info = 'bsProdProof, object.save, Error!';
			Err.wsError(req, res, info);
		} else {
			res.redirect('/bsProd/'+object._id)
		}
	})
}

exports.bsProdszDelSell = function(req, res) {
	let crWser = req.session.crWser;
	let prodId = req.query.prodId
	let sellId = req.query.sellId
	// console.log(prodId)
	// console.log(sellId)
	ObjDB.findOne({_id: prodId, 'group': crWser.group}, function(err, object){
		if(err) {
			console.log(err);
			res.json({success: 0, info: "bsProdDelSell，数据库错误，请联系管理员"});
		} else if(!object.sells) {
			res.json({success: 0, info: "没有找到产品出售记录，请联系管理员"});
		} else {
			object.sells.remove(sellId);
			object.save(function(err, objSave) {
				if(err) {
					res.json({success: 0, info: "bsProdDelSell objSave，数据库错误，请联系管理员"});
				} else {
					res.json({success: 1});
				}
			})
		}
	})
}






exports.bsProdszNew = function(req, res) {
	let crWser = req.session.crWser;
	let id = req.query.id;
	let sizes = req.query.sizes;
	if(!sizes) {
		info = "请添加 Size";
		Err.wsError(req, res, info);
	} else {
		ObjDB.findOne({_id: id, 'group': crWser.group})
		.populate('prodcls')
		.exec(function(err, prodFir) {
			if(err) {
				console.log(err);
				info = "bsProdszNew, ObjDB.findOne, Error!";
				Err.wsError(req, res, info);
			} else if(!prodFir) {
				info = "此产品号已经不存在, 请刷新查看";
				Err.wsError(req, res, info);
			} else {
				let newSizes = bsProdsSetAddSize(sizes, prodFir.sizes)
				// console.log(newSizes.length)
				// console.log(newSizes)
				if(newSizes.length > 0) {
					for(let i=0;i<newSizes.length;i++) {
						prodFir.sizes.push(newSizes[i]);
					}
					prodFir.sizes.sort();
					// console.log(prodFir.sizes)
					prodFir.save(function(err, prodFirSave) {
						if(err) {
							console.log(err);
							info = "bsProdszNew, prodFir.save, Error!";
							Err.wsError(req, res, info);
						} else {
							bsProdThrSaveSec(prodFirSave, 0, newSizes, crWser.group);
							res.redirect('/bsProd/'+prodFirSave._id)
						}
					})
				} else {
					info = "添加 Size 错误!";
					Err.wsError(req, res, info);
				}
			}
		})
	}
}
let bsProdsSetAddSize = function(sizes, orgSizes) {
	let reSizes = new Array();
	if(sizes instanceof Array) {
		for(i=0; i<sizes.length; i++) {
			let j = 0;
			for(;j<orgSizes.length;j++) {
				if(sizes[i] == orgSizes[j]) break;
			}
			if(j==orgSizes.length) {
				reSizes.push(parseInt(sizes[i]))
			}
		}
	} else {
		let j = 0;
		for(;j<orgSizes.length;j++) {
			if(sizes == orgSizes[j]) break;
		}
		if(j==orgSizes.length) {
			reSizes.push(sizes)
		}
	}
	return reSizes;
}
let bsProdThrSaveSec = function(prodFir, n, newSizes, group) {
	// console.log("n = " + n)
	if(n==prodFir.prodcls.length) {
		return;
	}
	let prodSec = prodFir.prodcls[n];
	bsProdThrSaveThr(prodFir, n, newSizes, prodSec, 0, group);
}
let bsProdThrSaveThr = function(prodFir, n, newSizes, prodSec, m, group) {
	// console.log("m = " + m)
	if(m == newSizes.length) {
		prodSec.save(function(err, prodSecSave) {
			if(err) console.log(err);
		})
		bsProdThrSaveSec(prodFir, n+1, newSizes, group)
		return;
	}

	let prodThr = new Object();
	prodThr.layer = 3;
	prodThr.group = group;
	prodThr.size = newSizes[m];
	prodThr.stock = 0;
	prodThr.product = prodFir._id;
	prodThr.prodcl = prodSec._id;
	let _objThr = new ObjDB(prodThr);
	prodSec.prodszs.push(_objThr._id);
	_objThr.save(function(err, prodThrSave) {
		if(err) console.log(err);
		bsProdThrSaveThr(prodFir, n, newSizes, prodSec, m+1, group);
	})
}




exports.bsProdszDel = function(req, res) {
	let crWser = req.session.crWser;
	let id = req.query.id;
	let sizes = req.query.sizes;
	if(!sizes) {
		info = "请选择 Size";
		Err.wsError(req, res, info);
	} else {
		ObjDB.findOne({_id: id, 'group': crWser.group})
		.populate({path: 'prodcls', populate: {path: 'prodszs'}})
		.exec(function(err, prodFir) {
			if(err) {
				console.log(err);
				info = "bsProdszNew, ObjDB.findOne, Error!";
				Err.wsError(req, res, info);
			} else if(!prodFir) {
				info = "此产品号已经不存在, 请刷新查看";
				Err.wsError(req, res, info);
			} else {
				// console.log(prodFir)
				let minusSizes = bsProdsSetMinusSize(sizes, prodFir.sizes)
				// console.log(minusSizes.length)
				// console.log(minusSizes)
				if(minusSizes.length > 0) {
					for(let i=0;i<minusSizes.length;i++) {
						prodFir.sizes.remove(minusSizes[i]);
					}
					// console.log(prodFir.sizes)
					prodFir.save(function(err, prodFirSave) {
						if(err) {
							console.log(err);
							info = "bsProdszNew, prodFir.save, Error!";
							Err.wsError(req, res, info);
						} else {
							bsProdThrRmSec(prodFirSave, 0, minusSizes);
							res.redirect('/bsProd/'+prodFirSave._id)
						}
					})
				} else {
					info = "删除 Size 错误!";
					Err.wsError(req, res, info);
				}
			}
		})
	}
}
let bsProdsSetMinusSize = function(sizes, orgSizes) {
	let reSizes = new Array();
	if(sizes instanceof Array) {
		for(i=0; i<sizes.length; i++) {
			let j = 0;
			for(;j<orgSizes.length;j++) {
				if(sizes[i] == orgSizes[j]) break;
			}
			if(j!=orgSizes.length) {
				reSizes.push(parseInt(sizes[i]))
			}
		}
	} else {
		let j = 0;
		for(;j<orgSizes.length;j++) {
			if(sizes == orgSizes[j]) break;
		}
		if(j!=orgSizes.length) {
			reSizes.push(sizes)
		}
	}
	return reSizes;
}
let bsProdThrRmSec = function(prodFir, n, minusSizes) {
	// console.log("n = " + n)
	if(n==prodFir.prodcls.length) {
		return;
	}
	let prodSec = prodFir.prodcls[n];
	bsProdThrRmThr(prodFir, n, minusSizes, prodSec, 0);
}

let bsProdThrRmThr = function(prodFir, n, minusSizes, prodSec, m) {
	// console.log("m = " + m)
	if(m == minusSizes.length) {
		prodSec.save(function(err, prodSecSave) {
			if(err) console.log(err);
		})
		bsProdThrRmSec(prodFir, n+1, minusSizes)
		return;
	}
	let prodsz = new Object();
	for(i=0;i<prodSec.prodszs.length;i++){
		let prodThr = prodSec.prodszs[i];
		if(prodThr.size == minusSizes[m]){
			prodsz = prodThr;
			break;
		}
	}
	if(i<prodSec.prodszs.length) {
		prodSec.prodszs.remove(prodsz);
		ObjDB.deleteOne({_id: prodsz._id}, function(err, prodThrRm) {
			if(err) console.log(err);
		})
	}
	bsProdThrRmThr(prodFir, n, minusSizes, prodSec, m+1)
}
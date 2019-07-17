let Err = require('../aaIndex/err')
let Language = require('../aaIndex/language')

let Pdname = require('../../../models/material/pdname');
let Product = require('../../../models/material/product');

let _ = require('underscore');

exports.bsPdnames = function(req, res) {
	Pdname.find()
	.sort({'freq': -1})
	.exec(function(err, pdnames) {
		if(err) console.log(err);
		// console.log(pdnames)
		res.render('./wser/bser/pdname/list', {
			title: '商品名字列表',
			crWser : req.session.crWser,
			pdnames: pdnames,
		})
	})
}



exports.bsPdAjaxNome = function(req, res) {
	let crWser = req.session.crWser;
	let nome = req.query.nome
	nome = String(nome).replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
	// console.log(nome)
	Pdname.find({
		'group': crWser.group,
		'nome' : new RegExp(nome + '.*')
	}, {nome: 1})
	.sort({'freq': -1})
	.exec(function(err, pdns){
		if(err) {
			res.json({success: 0, info: "bsPdAjaxNome时，数据库查找错误, 请联系管理员"});
		} else {
			res.json({ success: 1, pdns: pdns});
		}
	})
}











exports.bsPdnameInit = function(req, res) {
	let crWser = req.session.crWser;
	Product.find({group: crWser.group}, function(err, products) {
		if(err) console.log(err);
		let len = products.length;
		let nome;
		let pdns = new Array();

		for(i=0; i<len; i++){
			let product = products[i];
			let j=0;
			for(; j<pdns.length; j++) {
				if(pdns[j].nome == product.nome) {
					pdns[j].freq++;
					break;
				}
			}
			if(j == pdns.length) {
				let pdn = new Object();
				pdn.nome = product.nome;
				pdn.freq = 1;
				pdns.push(pdn);
			}
		}
		bsPdnamesSave(pdns, 0, crWser);
	})
	res.redirect('/')
}
bsPdnamesSave = function(pdns, i, crWser) {
	if(i == pdns.length) {
		let nomes = new Array();
		for(j=0; j<i; j++) {
			nomes[j] = pdns[j].nome
		}
		Pdname.deleteMany({
			group: crWser.group, 
			nome: {$nin: nomes}
		}, function(err, pdnsRm) {
			if(err) console.log(err);
		})
	} else {
		let pdn = pdns[i];
		pdn.group = crWser.group;

		Pdname.findOne({group: crWser.group, nome: pdn.nome})
		.exec(function(err, pdname) {
			if(err) console.log(err);
			// console.log(pdname)
			if(pdname) {
				let _object = _.extend(pdname, pdn)
				// _object.attribs = obj.attribs;
				_object.save(function(err, objSave){
					if(err) {
						console.log(err);
					} else {
						console.log(i + ' Up')
					}
					bsPdnamesSave(pdns, i+1, crWser)
				})
			} else {
				let _object = new Pdname(pdn)
				_object.save(function(err, objSave) {
					if(err) {
						console.log(err)
					} else {
						console.log(i+ ' New')
					}
					bsPdnamesSave(pdns, i+1, crWser)
				})
			}
		})
	}
}


exports.bsPdnameCheck = function(req, res) {
	let crWser = req.session.crWser;
	Product.find({group: crWser.group}, function(err, products) {
		if(err) console.log(err);
		let len = products.length;
		let nome;
		let pdns = new Array();

		for(i=0; i<len; i++){
			let product = products[i];
			let j=0;
			for(; j<pdns.length; j++) {
				if(pdns[j].nome == product.nome) {
					pdns[j].freq++;
					break;
				}
			}
			if(j == pdns.length) {
				let pdn = new Object();
				pdn.nome = product.nome;
				pdn.freq = 1;
				pdns.push(pdn);
			}
		}
		Pdname.find({group: crWser.group},function(err, pdnames) {
			if(err) console.log(err);
			res.render('./wser/bser/pdname/check', {
				title: '对照表',
				crWser : req.session.crWser,
				pdnames: pdnames,
				pdns: pdns,
			})
		})
	})
}

let Err = require('../aaIndex/err');
let Language = require('../aaIndex/language');

let ObjDB = require('../../../models/matter/road');

let _ = require('underscore')

let moment = require('moment')


exports.ptAutoRd = function(req, res, next) {
	let crWser = req.session.crWser;
	// 第一步 找到需要打印的路单
	ObjDB.find({'group': crWser.group})
	.where('printing').eq(true)
	.populate('group')
	.sort({"ctAt": 1})	// 需要打印的路单 从前往后打印
	.exec(function(err, printings) { if(err) {
		info = "pt自动打印时, 数据库错误, 请联系管理员";
		Err.wsError(req, res, info);
	} else {
		// 如果找到打印的路单
		if(printings.length > 0) {
			req.body.object = printings[0];
			next();
		} 

		// 如果没有找到打印的路单
		else {
			// 第二步 查找最新路单
			ObjDB.find({'group': crWser.group})
			.populate('group')
			.populate('cter')
			.sort({"ctAt": -1})
			.limit(1)
			.exec(function(err, objects) { if(err) {
				info = "pt自动打印时, 数据库错误, 请联系管理员";
				Err.wsError(req, res, info);
			} else {
				// 如果找到最新路单
				if(objects.length > 0) {
					req.body.object = objects[0];
					next();
				} 
				// 如果没有路单
				else {
					info = "您还没有路单， 请先添加路单";
					Err.wsError(req, res, info);
				}
			} })
		}
	} })
}
exports.ptRoad = function(req, res) {
	let object = req.body.object;
	res.render('./wser/print/road/ptRoad', {
		title: '自动打印',
		crWser: req.session.crWser,
		group: object.group,
		object: object,
	});
}





exports.ptRoadPrinting = function(req, res) {
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

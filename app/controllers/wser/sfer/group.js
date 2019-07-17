let Err = require('../aaIndex/err')
let Language = require('../aaIndex/language')

let ObjDB = require('../../../models/user/wsgp');
let _ = require('underscore');

exports.sfGroupFilter = function(req, res, next) {
	let crWser = req.session.crWser;
	ObjDB.findOne({_id: crWser.group}, function(err, object) {
		if(err) {
			info = "查找公司信息时，数据库错误 请联系管理员";
			Err.wsError(req, res, info);
		} else if(!object) {
			info = "公司信息出现错误，联系管理员";
			Err.wsError(req, res, info);
		} else {
			let objBody = new Object();

			objBody.crWser = req.session.crWser;
			objBody.object = object;
			objBody.thisAct = "/sfGroup";
			objBody.thisTit = "公司信息";

			req.body.objBody = objBody;
			next();
		}
	});
}

exports.sfGroup = function(req, res) {
	let crWser = req.session.crWser;
	let Lang = Language.wsLanguage('/wser', '/group', crWser)
	let objBody = req.body.objBody;
	objBody.title = Lang.title;
	objBody.Lang = Lang;

	res.render('./wser/sfer/group/detail', objBody);
}
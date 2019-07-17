let Index = require('../controllers/wser/print/index');

let Ctpter = require('../controllers/wser/print/pter');

let Ctod = require('../controllers/wser/print/order')
let Ctrd = require('../controllers/wser/print/road')

let MdBcrypt = require('../middle/middleBcrypt');
let MdRole = require('../middle/middleRole');
let MdPicture = require('../middle/middlePicture')

let multipart = require('connect-multiparty');
let postForm = multipart();

module.exports = function(app){

	// index ---------------Manager 首页 登录页面 登录 登出------------------------------
	app.get('/pter', Index.pter);

	// printer User  -----------------------------------------------------------------
	app.get('/pterInfo', MdRole.pterIsLogin, Ctpter.pterFilter, Ctpter.pterInfo)
	app.post('/pterInfoUpd', MdRole.pterIsLogin, postForm, Ctpter.pterInfoUpd)

	// print A4 A5     ---------------------------------------------------------------
	app.get('/ptPrint', MdRole.pterIsLogin, Ctod.ptAutoPr, Ctod.ptPrint)
	app.get('/ptOrderPrinting', MdRole.pterIsLogin, Ctod.ptOrderPrinting)// 为了打印后刷新用的

	// Ticket     --------------------------------------------------------------------
	app.get('/ptTicket', MdRole.pterIsLogin, Ctod.ptAutoTk, Ctod.ptTicket)
	app.get('/ptOrderTicket', MdRole.pterIsLogin, Ctod.ptOrderTicket)// 为了打印后刷新用的
	
	// Road  -------------------------------------------------------------------------
	app.get('/ptRoad', MdRole.pterIsLogin, Ctrd.ptAutoRd, Ctrd.ptRoad)
	app.get('/ptRoadPrinting', MdRole.pterIsLogin, Ctrd.ptRoadPrinting)// 为了打印后刷新用的


};
let Index = require('../controllers/wser/sfer/index');

let Ctsfgp = require('../controllers/wser/sfer/group');	// Ct : controll
let Ctsfer = require('../controllers/wser/sfer/wser');

let CtCter = require('../controllers/wser/sfer/cter')

let CtProd = require('../controllers/wser/sfer/product')
let Ctod = require('../controllers/wser/sfer/order')

let MdBcrypt = require('../middle/middleBcrypt');
let MdRole = require('../middle/middleRole');
let MdPicture = require('../middle/middlePicture')

let multipart = require('connect-multiparty');
let postForm = multipart();

module.exports = function(app){

	// index ---------------Manager 首页 登录页面 登录 登出--------------------------------
	app.get('/sfer', MdRole.sferIsLogin, Index.sfer);

	// wholesaler ------------------------------------------------------------------------
	app.get('/sferInfo', MdRole.sferIsLogin, Ctsfer.sferFilter, Ctsfer.sferInfo)
	
	app.post('/sferUpdInfo', MdRole.sferIsLogin, postForm, Ctsfer.sferUpd)
	app.post('/sferUpdPwd', MdRole.sferIsLogin, postForm, MdBcrypt.rqBcrypt, Ctsfer.sferUpd)


	// wholesaler group -------------------------------------------------------------------
	app.get('/sfGroup', MdRole.sferIsLogin, Ctsfgp.sfGroupFilter, Ctsfgp.sfGroup);


	// product         ----------------------------------------------------------------------
	app.get('/sfProds', MdRole.sferIsLogin, CtProd.sfProds)
	app.get('/sfProdsAjax', MdRole.sferIsLogin, CtProd.sfProdsAjax)

	app.get('/sfProd/:id', MdRole.sferIsLogin, CtProd.sfProdFilter, CtProd.sfProd)

	app.get('/orderAjaxSfProds', MdRole.sferIsLogin, CtProd.orderAjaxSfProds)

	// order     -------------------------------------------------------------------------
	app.get('/sfOrders', MdRole.sferIsLogin, Ctod.sfOrders)
	app.get('/sfOrdersAjax', MdRole.sferIsLogin, Ctod.sfOrdersAjax)
	app.get('/sfOrdersMonth', MdRole.sferIsLogin, Ctod.sfOrdersMonth)
	app.get('/sfOrdersMonthAjax', MdRole.sferIsLogin, Ctod.sfOrdersMonthAjax)

	app.get('/sfOrder/:id', MdRole.sferIsLogin, Ctod.sfOrderFilter, Ctod.sfOrder)
	app.get('/sfOrderPDF/:id', MdRole.sferIsLogin, Ctod.sfOrderFilter, Ctod.sfOrderPDF)
	app.get('/sfOrderExcel/:id', MdRole.sferIsLogin, Ctod.sfOrderFilter, Ctod.sfOrderExcel)
	app.get('/sfOrderUp/:id', MdRole.sferIsLogin, Ctod.sfOrderFilter, Ctod.sfOrderUp)
	app.get('/sfOrderCp/:id', MdRole.sferIsLogin, Ctod.sfOrderFilter, Ctod.sfOrderCp)

	app.get('/sfOrderAjaxPds', MdRole.sferIsLogin, Ctod.sfOrderAjaxPds)
	app.post('/sfOrderUpd', MdRole.sferIsLogin, postForm, Ctod.sfOrderUpd)

	app.get('/sfOrderAdd', MdRole.sferIsLogin, MdRole.singleWsLogin, Ctod.sfOrderAdd)
	app.post('/sfOrderNew', MdRole.sferIsLogin, postForm, Ctod.sfOrderNew)


	// app.get('/sfOrderStatus', MdRole.sferIsLogin, Ctod.sfOrderStatus)
	app.get('/sfOrderPrinting', MdRole.sferIsLogin, Ctod.sfOrderPrinting)
	app.get('/sfOrderTicket', MdRole.sferIsLogin, Ctod.sfOrderTicket)
	
	app.get('/sfOrderRelCter', MdRole.sferIsLogin, Ctod.sfOrderRelCter)

	// cter         ----------------------------------------------------------------------
	app.get('/sfCters', MdRole.sferIsLogin, CtCter.sfCters)
	app.get('/sfCtersAjax', MdRole.sferIsLogin, CtCter.sfCtersAjax)

	app.get('/sfCter/:id', MdRole.sferIsLogin, CtCter.sfCterFilter, CtCter.sfCter)

	app.get('/sfCterAdd', MdRole.sferIsLogin, CtCter.sfCterAdd)
	app.post('/sfCterNew', MdRole.sferIsLogin, postForm, CtCter.sfCterNew)
	app.post('/sfCterUpd', MdRole.sferIsLogin, postForm, CtCter.sfCterUpd)

	app.get('/ajaxSfCterAdd', MdRole.sferIsLogin, CtCter.ajaxSfCterAdd)
	app.get('/ajaxSfCterUp', MdRole.sferIsLogin, CtCter.ajaxSfCterUp)
	app.get('/ajaxSfCters', MdRole.sferIsLogin, CtCter.ajaxSfCters)
	app.get('/ajaxSfCterAll', MdRole.sferIsLogin, CtCter.ajaxSfCterAll)


};
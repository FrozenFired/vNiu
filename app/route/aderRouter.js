let Index = require('../controllers/ader/index');

let Ctader = require('../controllers/ader/ader'); // ct control
let Ctwsgp = require('../controllers/ader/wsgp')
let Ctwser = require('../controllers/ader/wser')

let Ctod = require('../controllers/ader/order')
let Ctpd = require('../controllers/ader/product')

let Aaopt = require('../controllers/ader/aaopt')

let MdBcrypt = require('../middle/middleBcrypt')
let MdRole = require('../middle/middleRole')

let multipart = require('connect-multiparty')
let postForm = multipart();

module.exports = function(app){

	// index ---------------Manager 首页 登录页面 登录 登出--------------------------------
	app.get('/ader', Index.ader)
	app.get('/aderLogin', Index.aderLogin)
	app.post('/loginAder', Index.loginAder)
	app.get('/aderLogout', Index.aderLogout)

	// Administrator ------------------------------------------------------------------------
	// 添加删除(后期要关闭)
	// app.get('/aderAdd', Ctader.aderAdd)
	// app.post('/aderNew', postForm, MdBcrypt.rqBcrypt, Ctader.aderNew)
	// app.delete('/aderDelAjax', MdRole.aderIsLogin, Ctader.aderDelAjax)
	
	// 查看
	app.get('/aders', MdRole.aderIsLogin, Ctader.aders)
	app.get('/ader/:id', MdRole.aderIsLogin, Ctader.ader)

	// wholesaler group
	app.get('/adWsgps', MdRole.aderIsLogin, Ctwsgp.adWsgpsFilter, Ctwsgp.adWsgps)
	app.get('/adWsgp/:id', MdRole.aderIsLogin, Ctwsgp.adWsgpFilter, Ctwsgp.adWsgp)
	app.get('/adWsgpDel/:id', MdRole.aderIsLogin, Ctwsgp.adWsgpFilter, Ctwsgp.adWsgpDel)
	
	app.post('/adWsgpUp', MdRole.aderIsLogin, postForm, Ctwsgp.adWsgpUp)

	app.get('/adWsgpAdd', MdRole.aderIsLogin, Ctwsgp.adWsgpAdd)
	app.post('/adWsgpNew', MdRole.aderIsLogin, postForm, Ctwsgp.adWsgpNew)
	
	app.delete('/adWsgpDelAjax', MdRole.aderIsLogin, Ctwsgp.adWsgpDelAjax)

	// wholesaler
	app.get('/adWsers', MdRole.aderIsLogin, Ctwser.adWsersFilter, Ctwser.adWsers)
	app.get('/adWser/:id', MdRole.aderIsLogin, Ctwser.adWserFilter, Ctwser.adWser)
	app.get('/adWserDel/:id', MdRole.aderIsLogin, Ctwser.adWserFilter, Ctwser.adWserDel)
	
	app.post('/adWserUpInfo', MdRole.aderIsLogin, postForm, Ctwser.adWserUp)
	app.post('/adWserUpPw', MdRole.aderIsLogin, postForm, MdBcrypt.rqBcrypt, Ctwser.adWserUp)

	app.get('/adWserAdd', MdRole.aderIsLogin, Ctwser.adWserAdd)
	app.post('/adWserNew', MdRole.aderIsLogin, postForm, MdBcrypt.rqBcrypt, Ctwser.adWserNew)

	app.delete('/adWserDelAjax', MdRole.aderIsLogin, Ctwser.adWserDelAjax)


	// preview     ---------------------------------------------------------------
	app.get('/adOrders', MdRole.aderIsLogin, Ctod.adOrders)
	app.get('/adOrdersAjax', MdRole.aderIsLogin, Ctod.adOrdersAjax)
	app.get('/adOrdersMonth', MdRole.aderIsLogin, Ctod.adOrdersMonth)
	app.get('/adOrdersMonthAjax', MdRole.aderIsLogin, Ctod.adOrdersMonthAjax)

	app.get('/adProds', MdRole.aderIsLogin, Ctpd.adProdsFilter, Ctpd.adProds)


	// 后台批量操作     ---------------------------------------------------------------
	// app.get('/adOptarts', MdRole.aderIsLogin, Aaopt.adOptarts) // 批量修改订单的产品数，已经修改
}
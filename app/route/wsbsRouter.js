let Index = require('../controllers/wser/bser/index');

let Ctwser = require('../controllers/wser/bser/wser');
let CtGroup = require('../controllers/wser/bser/group');	// Ct : controll

let CtCter = require('../controllers/wser/bser/cter')
let CtFter = require('../controllers/wser/bser/fter')

let CtPdname = require('../controllers/wser/bser/pdname')

let CtProd = require('../controllers/wser/bser/product')
let CtProdcl = require('../controllers/wser/bser/prodcl')
let CtProdsz = require('../controllers/wser/bser/prodsz')
let Ctod = require('../controllers/wser/bser/order')
let Ctrd = require('../controllers/wser/bser/road')

let CtBill = require('../controllers/wser/bser/bill')
let CtArrear = require('../controllers/wser/bser/arrear')

let MdBcrypt = require('../middle/middleBcrypt');
let MdRole = require('../middle/middleRole');
let MdPicture = require('../middle/middlePicture')

let multipart = require('connect-multiparty');
let postForm = multipart();

module.exports = function(app){

	// index ---------------Manager 首页 登录页面 登录 登出--------------------------------
	// 二维码生成
	app.post('/qrCode', MdRole.bserIsLogin, postForm, Index.qrCode)
	
	app.get('/bser', MdRole.bserIsLogin, Index.bser);

	// wholesaler ------------------------------------------------------------------------
	app.get('/bsWsers', MdRole.bserIsLogin, Ctwser.bsersFilter, Ctwser.bsWsers)
	app.get('/bsMyInfo', MdRole.bserIsLogin, Ctwser.bserFilter, Ctwser.bsMyInfo)
	app.get('/bsWser/:id', MdRole.bserIsLogin, Ctwser.bserFilter, Ctwser.bsMyInfo)
	
	app.post('/bsWserUpdInfo', MdRole.bserIsLogin, postForm, MdPicture.addNewPhoto, Ctwser.bsWserUpd)
	app.post('/bsWserUpdPwd', MdRole.bserIsLogin, postForm, MdBcrypt.rqBcrypt, Ctwser.bsWserUpd)

	// wholesaler group -------------------------------------------------------------------
	app.get('/bsGroup', MdRole.bserIsLogin, CtGroup.bsGroupFilter, CtGroup.bsGroup);
	app.post('/bsGroupUpd', MdRole.bserIsLogin, postForm, CtGroup.bsGroupUpd);

	// 公司颜色管理   ----------------
	app.get('/bsColors', MdRole.bserIsLogin, CtGroup.bsColors)

	// app.get('/bsColor/:id', CtGroup.bsColorFilter, CtGroup.bsColor)
	// app.get('/bsColorUp/:id', MdRole.bserIsLogin, CtGroup.bsColorFilter, CtGroup.bsColorUp)

	// app.post('/bsColorUpd', MdRole.bserIsLogin, postForm, CtGroup.bsColorUpd)

	app.post('/bsColorNew', MdRole.bserIsLogin, postForm, CtGroup.bsColorNew)

	app.delete('/bsColorDelAjax', MdRole.bserIsLogin, CtGroup.bsColorDelAjax)


	// pdname  Hidden ----------------------------------------------------------
	app.get('/bsPdnameInit', MdRole.bserIsLogin, CtPdname.bsPdnameInit)
	app.get('/bsPdnameCheck', MdRole.bserIsLogin, CtPdname.bsPdnameCheck)

	app.get('/bsPdnames', MdRole.bserIsLogin, CtPdname.bsPdnames)

	app.get('/bsPdAjaxNome', MdRole.bserIsLogin, CtPdname.bsPdAjaxNome)

	// product      ----------------------------------------------------------------------
	app.get('/bsProds', MdRole.bserIsLogin, CtProd.bsProds)
	app.get('/bsProdsAjax', MdRole.bserIsLogin, CtProd.bsProdsAjax) // 初始list

	app.get('/bsProd/:id', MdRole.bserIsLogin, CtProd.bsProdFilter, CtProd.bsProd)

	app.get('/bsProdAdd', MdRole.bserIsLogin, CtProd.bsProdAdd)
	app.post('/bsProdNew', MdRole.bserIsLogin, postForm,
		MdPicture.addNewPhoto, CtProd.bsProdNew)

	app.post('/bsProdUpd', MdRole.bserIsLogin, postForm, MdPicture.addNewPhoto, CtProd.bsProdUpd)

	app.get('/bsProdDel/:id', MdRole.bserIsLogin, CtProd.bsProdFilter, CtProd.bsProdDel)
	app.delete('/bsProdDelAjax', MdRole.bserIsLogin, CtProd.bsProdDelAjax)

	app.get('/orderAjaxBsProds', MdRole.bserIsLogin, CtProd.orderAjaxBsProds)
	app.get('/ajaxBsProd', MdRole.bserIsLogin, CtProd.ajaxBsProd)
	// prodcl      ----------------------------------------------------------------------
	app.post('/bsProdclNew', MdRole.bserIsLogin, postForm, CtProdcl.bsProdclNew)
	app.get('/bsProdclDel/:id', MdRole.bserIsLogin, CtProdcl.bsProdclFilter, CtProdcl.bsProdclDel)

	app.get('/bsProdcl/:id', MdRole.bserIsLogin, CtProdcl.bsProdclFilter, CtProdcl.bsProdcl)
	app.post('/bsProdclUpd', MdRole.bserIsLogin, postForm, MdPicture.addNewPhoto, CtProdcl.bsProdclUpd)

	app.post('/bsProdclStockAjax', MdRole.bserIsLogin, postForm, CtProdcl.bsProdclStockAjax)

	// prodsz      ----------------------------------------------------------------------
	app.get('/bsProdszNew', MdRole.bserIsLogin, CtProdsz.bsProdszNew)
	app.get('/bsProdszDel', MdRole.bserIsLogin, CtProdsz.bsProdszDel)

	app.get('/bsProdsz/:id', MdRole.bserIsLogin, CtProdsz.bsProdszFilter, CtProdsz.bsProdsz)
	app.post('/bsProdszUpdAjax', MdRole.bserIsLogin, postForm, CtProdsz.bsProdszUpdAjax)

	app.get('/bsProdszProof/:id', MdRole.bserIsLogin, CtProdsz.bsProdszFilter, CtProdsz.bsProdszProof)
	app.delete('/bsProdszDelSell', MdRole.bserIsLogin, CtProdsz.bsProdszDelSell)


	// order     -------------------------------------------------------------------
	app.get('/bsOrders', MdRole.bserIsLogin, Ctod.bsOrders)
	app.get('/bsOrdersAjax', MdRole.bserIsLogin, Ctod.bsOrdersAjax)
	app.get('/bsOrdersMonth', MdRole.bserIsLogin, Ctod.bsOrdersMonth)
	app.get('/bsOrdersMonthAjax', MdRole.bserIsLogin, Ctod.bsOrdersMonthAjax)

	app.get('/bsOrder/:id', MdRole.bserIsLogin, Ctod.bsOrderFilter, Ctod.bsOrder)
	app.get('/bsOrderPDF/:id', MdRole.bserIsLogin, Ctod.bsOrderFilter, Ctod.bsOrderPDF)
	app.get('/bsOrderExcel/:id', MdRole.bserIsLogin, Ctod.bsOrderFilter, Ctod.bsOrderExcel)
	app.get('/bsOrderUp/:id', MdRole.bserIsLogin, Ctod.bsOrderFilter, Ctod.bsOrderUp)
	app.get('/bsOrderCp/:id', MdRole.bserIsLogin, Ctod.bsOrderFilter, Ctod.bsOrderCp)
	app.get('/bsOrderDel/:id', MdRole.bserIsLogin, Ctod.bsOrderFilter, Ctod.bsOrderDel)

	app.get('/bsOrderAddPre', MdRole.bserIsLogin, MdRole.singleWsLogin, Ctod.bsOrderAddPre)
	app.get('/bsOrderAdd', MdRole.bserIsLogin, Ctod.bsOrderAdd)
	app.get('/bsOrderProdsAjax', MdRole.bserIsLogin, Ctod.bsOrderProdsAjax) // orderAdd 模糊查询
	app.get('/bsOrderProdIdAjax', MdRole.bserIsLogin, Ctod.bsOrderProdIdAjax) // orderAdd单一查询
	app.get('/bsOrderPlusPdAjax', MdRole.bserIsLogin, Ctod.bsOrderPlusPdAjax) // order添加prod
	app.get('/bsOrderConnCterAjax', MdRole.bserIsLogin, Ctod.bsOrderConnCterAjax) // order添加prod
	app.get('/bsOrderSettle/:id', MdRole.bserIsLogin, Ctod.bsOrderSettle) // 结帐


	app.delete('/bsOrderDelAjax', MdRole.bserIsLogin, Ctod.bsOrderDelAjax)
	app.get('/bsOrderPrinting', MdRole.bserIsLogin, Ctod.bsOrderPrinting)
	app.get('/bsOrderTicket', MdRole.bserIsLogin, Ctod.bsOrderTicket)
	
	
	app.get('/bsOrderRelCter', MdRole.bserIsLogin, Ctod.bsOrderRelCter)

	// Road     -------------------------------------------------------------------------
	app.get('/bsRoads', MdRole.bserIsLogin, Ctrd.bsRoads)
	app.get('/bsRoadsAjax', MdRole.bserIsLogin, Ctrd.bsRoadsAjax) // 初始list

	app.get('/bsRoad/:id', Ctrd.bsRoadFilter, Ctrd.bsRoad)
	app.get('/bsRoadUp/:id', MdRole.bserIsLogin, Ctrd.bsRoadFilter, Ctrd.bsRoadUp)
	app.get('/bsRoadDel/:id', MdRole.bserIsLogin, Ctrd.bsRoadFilter, Ctrd.bsRoadDel)

	app.post('/bsRoadUpd', MdRole.bserIsLogin, postForm, Ctrd.bsRoadUpd)

	app.get('/bsRoadAdd', MdRole.bserIsLogin, MdRole.singleWsLogin, Ctrd.bsRoadAdd)
	app.post('/bsRoadNew', MdRole.bserIsLogin, postForm, Ctrd.bsRoadNew)

	app.delete('/bsRoadDelAjax', MdRole.bserIsLogin, Ctrd.bsRoadDelAjax)

	app.get('/bsRoadPrinting', MdRole.bserIsLogin, Ctrd.bsRoadPrinting)

	// cter         ----------------------------------------------------------------------
	app.get('/bsCters', MdRole.bserIsLogin, CtCter.bsCters)
	app.get('/bsCtersAjax', MdRole.bserIsLogin, CtCter.bsCtersAjax)

	app.get('/bsCter/:id', MdRole.bserIsLogin, CtCter.bsCterFilter, CtCter.bsCter)
	app.get('/bsCterDel/:id', MdRole.bserIsLogin, CtCter.bsCterFilter, CtCter.bsCterDel)
	app.delete('/bsCterDelAjax', MdRole.bserIsLogin, CtCter.bsCterDelAjax)
	
	app.post('/bsCterUpd', MdRole.bserIsLogin, postForm, CtCter.bsCterUpd)

	app.get('/bsCterAdd', MdRole.bserIsLogin, CtCter.bsCterAdd)
	app.post('/bsCterNew', MdRole.bserIsLogin, postForm, CtCter.bsCterNew)

	app.get('/ajaxBsCterAdd', MdRole.bserIsLogin, CtCter.ajaxBsCterAdd)
	app.get('/ajaxBsCterUp', MdRole.bserIsLogin, CtCter.ajaxBsCterUp)
	app.get('/ajaxBsCters', MdRole.bserIsLogin, CtCter.ajaxBsCters)
	app.get('/ajaxBsCterAll', MdRole.bserIsLogin, CtCter.ajaxBsCterAll)

	// bill         ----------------------------------------------------------------------
	app.get('/bsBills', MdRole.bserIsLogin, CtBill.bsBills)
	app.get('/bsBillsAjax', MdRole.bserIsLogin, CtBill.bsBillsAjax)

	app.get('/bsBill/:id', MdRole.bserIsLogin, CtBill.bsBillFilter, CtBill.bsBill)
	app.get('/bsBillDel/:id', MdRole.bserIsLogin, CtBill.bsBillFilter, CtBill.bsBillDel)

	app.post('/bsBillUpd', MdRole.bserIsLogin, postForm, CtBill.bsBillUpd)

	app.get('/bsBillAdd', MdRole.bserIsLogin, CtBill.bsBillAdd)
	app.post('/bsBillNew', MdRole.bserIsLogin, postForm, CtBill.bsBillNew)

	app.delete('/bsBillDelAjax', MdRole.bserIsLogin, CtBill.bsBillDelAjax)


	// fter   供应商   ----------------------------------------------------------------------
	app.get('/bsFters', MdRole.bserIsLogin, CtFter.bsFters)
	app.get('/bsFtersAjax', MdRole.bserIsLogin, CtFter.bsFtersAjax)

	app.get('/bsFter/:id', MdRole.bserIsLogin, CtFter.bsFterFilter, CtFter.bsFter)
	app.get('/bsFterDel/:id', MdRole.bserIsLogin, CtFter.bsFterFilter, CtFter.bsFterDel)
	app.delete('/bsFterDelAjax', MdRole.bserIsLogin, CtFter.bsFterDelAjax)

	app.post('/bsFterUpd', MdRole.bserIsLogin, postForm, CtFter.bsFterUpd)

	app.get('/bsFterAdd', MdRole.bserIsLogin, CtFter.bsFterAdd)
	app.post('/bsFterNew', MdRole.bserIsLogin, postForm, CtFter.bsFterNew)

	app.get('/ajaxBsFters', MdRole.bserIsLogin, CtFter.ajaxBsFters)
	app.get('/ajaxBsFterAll', MdRole.bserIsLogin, CtFter.ajaxBsFterAll)

	// arrear         ----------------------------------------------------------------------
	app.get('/bsArrears', MdRole.bserIsLogin, CtArrear.bsArrears)
	app.get('/bsArrearsAjax', MdRole.bserIsLogin, CtArrear.bsArrearsAjax)

	app.get('/bsArrear/:id', MdRole.bserIsLogin, CtArrear.bsArrearFilter, CtArrear.bsArrear)
	app.get('/bsArrearDel/:id', MdRole.bserIsLogin, CtArrear.bsArrearFilter, CtArrear.bsArrearDel)

	app.post('/bsArrearUpd', MdRole.bserIsLogin, postForm, CtArrear.bsArrearUpd)

	app.get('/bsArrearAdd', MdRole.bserIsLogin, CtArrear.bsArrearAdd)
	app.post('/bsArrearNew', MdRole.bserIsLogin, postForm, 
		MdPicture.addNewPhoto, CtArrear.bsArrearNew)

	app.delete('/bsArrearDelAjax', MdRole.bserIsLogin, CtArrear.bsArrearDelAjax)

};
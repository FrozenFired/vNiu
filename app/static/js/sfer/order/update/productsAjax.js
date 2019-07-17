$(function() {
	$(".ajaxPdsCode").focus();	// 进入销售页面，直接获得焦点
	let ajaxUrl = "/orderAjaxSfProds";
	let products = new Array();	// ajax products 获取的 products （也有可能是第二次获取的）
	let formPds = new Array();	// 现在form中已存在的products
	let orPdNum = 0;			// 现在form中的产品个数


	let orderId = $("#orderId").val();
	if(orderId && orderId.length > 10) {
		$.ajax({
			type: 'get',
			url: '/sfOrderAjaxPds?id=' + orderId
		})
		.done(function(results) {
			if(results.success === 1) {
				formPds = results.products;
				orPdNum = formPds.length;
				for(let i=0; i<orPdNum; i++) {
					orderAddObjElem(formPds[i], i, formPds[i].quot)
				}
				$("#proLen").text(orPdNum);
				$("#imp").val(getNewImp())
			} else {
				alert(results.info)
			}
		})
	}

	let orderAddObjElem = function(product, i, newQuot) {
		let str = '';
		str += '<div id="iptProduct-' + product.code + '" class="border m-2 p-2">';
		str += '<div class="row">';
			str += '<div class="col-3 del-formDel" id="del-formDel-'+product.code+'">';
				str += '<img src="' + dns + product.photo +'" ';
				str += 'width="100%" style="max-width:80px;max-height:80px;"'
				str += ' alt="'+product.nome+'" />';
				str += '<div class="m-2"><span class="badge badge-warning">清除</span></div>'
			str += '</div>'
			str += '<div class="col-9">';
			str += '<div class="row">'

				str += '<div class="col-4" id="price-formTxt'+product.code;
				str +='">' + Math.round(product.price*100)/100+' €</div>'
				str += '<div class="col-4">'+ product.code + '</div>'
				str += '<div class="col-4">'+ product.nome + '</div>'
				// hidden
				str += '<input id="code-'+product.code+'" type="hidden" ';
				str += 'name="obj[products]['+ i + '][code]" ';
				str += 'value=' + product.code +' readonly="readonly" />';
				// hidden
				str += '<input class="form-control" type="hidden" ';
				str += 'name="obj[products]['+ i + '][photo]" ';
				if(product.photo) str += 'value=' + product.photo;
				str += ' readonly="readonly" />';
				// hidden
				str += '<input class="form-control" type="hidden" ';
				str += 'name="obj[products]['+ i + '][nome]" ';
				if(product.nome) str += 'value=' + product.nome;
				str += ' readonly="readonly" />';
				// hidden
				str += '<input id="price-formPd'+product.code+'" type="hidden" ';
				str += 'name="obj[products]['+ i + '][price]" ';
				str += 'value=' + product.price + ' readonly="readonly" />';
				

			str += '</div>'
			str += '<hr/>'
			str += '<div class="row">'
				// str += '<div class="col-1"> * </div>'

				str += '<input id="quot-formPd-'+product.code;
				str += '" class="col-6 form-control quot-formPd" type="number" ';
				str += 'name="obj[products]['+ i + '][quot]" value='+newQuot+' />';

				// str += '<div class="col-1"> = </div>'
				str += '<div class="col-2"> Tot: </div>';
				str += '<div id="total-formTxt-' + product.code + '" class="col-4">';
					str += Math.round(product.price*newQuot * 100) / 100
				str += ' €</div>'

				// hidden
				str += '<input id="total-formPd-'+product.code+'" class="form-control" type="hidden" ';
				str += 'name="obj[products]['+ i + '][total]" ';
				str += 'value=' + Math.round(product.price*newQuot * 100) / 100;
				str += ' readonly="readonly"/>';
			str += '</div>'
			str += '</div>'
		str += '</div>';
		str += '</div>';
		$('#proInOrder').after(str);		
	}


	// 输入进入焦点时
	$(".ajaxPdsCode").focus(function(e) {
		$(".ajaxPdsCode").val("");
		// 清除上次的products
		$('.showPds').remove(); products = new Array();
	});
	// 输入产品号时，获取products
	$(".ajaxPdsForm").on('input', '.ajaxPdsCode', function(e) {
		// ajaxUrl = $(e.target).data('url'); // 给ajax url 赋值
		obtProducts();
	});
	let obtProducts = function() {
		let str = $(".ajaxPdsCode").val().replace(/(\s*$)/g, "").replace( /^\s*/, '');
		// 清除上次的products
		$('.showPds').remove(); products = new Array();
		if(str.length > 2){	// 防止资源浪费 至少输入3个字符才从后台调用数据
			let code = encodeURIComponent(str);	// 转化码
			$.ajax({
				type: 'get',
				url: ajaxUrl+'?keytype=code&keyword=' + code
			})
			.done(function(results) {
				if(results.success === 1) {
					products[0] = results.product;
					newShowPd(products[0], 0)
				} else if(results.success === 2) {
					products = results.products;
					for(let pl = 0; pl < products.length; pl++) {
						let product = products[pl];
						newShowPd(product, pl)
					}
				}
			})
		}
	}

	// 解决网络延迟问题
	let freshShowPds = function(){
		// 如果没有products 会重新获取（当然ajaxPdsCode中的值长度小于2 只是调用函数 不刷新）
		if(products.length == 0) {
			obtProducts();
		} else {
			// 如果存在长度不为1的products， 要取判断里面是否有跟 ajaxPdsCode中的值相同的
			// 如果有则刷新，这样保证输入正确号码 对应产品会是第一个
			for(let i=0; i<products.length; i++) {
				if(products[i].code == $(".ajaxPdsCode").val() && products.length!=1) {
					obtProducts();
				}
			}
		}
	}
	setInterval(freshShowPds,1000)
	/* ---------------------------------------- */

	let getFormPd = function(proIdent) {
		for(let i = 0; i<formPds.length; i++){
			if(formPds[i].code == proIdent) {
				return formPds[i];
			}
		}
		return null;
	}
	let getNewImp = function() {
		let newImp = 0;
		for(let i=0; i<formPds.length; i++) {
			newImp += parseFloat(formPds[i].total);
		}
		newImp = Math.round(newImp*100)/100;
		return newImp;
	}
	let getShowPd = function(proIdent) {
		for(let i = 0; i<products.length; i++){
			if(products[i].code == proIdent) {
				return products[i];
			}
		}
		return null;
	}


	let upShowPd = function(proIdent, afterQuot, newPrice) {
		$("#price-showPdError-"+proIdent).hide();
		$("#price-showIpt-"+proIdent).hide();

		$("#quot-showPd-"+proIdent).val(afterQuot);
		$("#price-showPd-"+proIdent).val(newPrice);
		$("#price-showTxt-"+proIdent).text(newPrice + ' €');
		$("#total-showTxt-"+proIdent).text(Math.round(newPrice*afterQuot *100)/100 + ' €');
		for(let i = 0; i< products.length; i++ ){
			if(products[i].code == proIdent) {
				products[i].price = newPrice;
				break;
			}
		}
	}

	// 输入产品号时，添加到显示在屏幕的产品列表
	let newShowPd = function(product, pl) {
		// pl 是显示products中的脚标
		let dbPrice = product.price;
		let showAjaxPd = getFormPd(product.code); 	// 此产品是否在订单产品中
		if(showAjaxPd) {							// 此产品在此订单中已预订的数量
			formPdQuot = showAjaxPd.quot;
			product.price = showAjaxPd.price;
			// formPdPrice = showAjaxPd.quot;
		} else {
			formPdQuot = 0; 
			// formPdPrice = 0; 
		}

		let str = "";
		str += '<div class="showPds">'
		str += '<div class="row p-2 m-1 bg-secondary">'
			str += '<div class="col-3">'
				str += '<div class="row">'; 		// 照片
				str += '<img class="foto-showImg" id="foto-showImg-'+product.code;
				str += '" src="' +dns + product.photo +'" ';
					str += 'width="100%" ';
					str += 'style="max-width:100px;max-height:100px;"'
					str += ' alt="'+product.code+'" />';
				str += '</div>';

				str += '<div class="row">'			// 库存
					str += $("#langstock").val()+": " + product.stock
				str += '</div>';
			str += '</div>';

			str += '<div class="col-9">'
				str += '<div class="row">'
					str += '<div class="col-3">' + product.code + '</div>';
					str += '<div class="col-5">' + product.nome + '</div>';
					str += '<div id="price-showTxt-'+product.code;
					str += '" class="col-4 text-warning price-showTxt">';
					str += product.price + ' €</div>';
				str += '</div>';
				str += '<div id="price-showIpt-'+product.code;
				str += '" class="row price-showIpt" style="display:none">'
					str += '<div class="col-6 pt-2">'+$("#langorg").val()+': '+ dbPrice + ' €</div>';
					str += '<div style="display:none" id="price-showPdError-'+product.code;
					str += '" class="col-2 pt-2 text-danger price-showPdError';
					str += '">错</div>';

					str += '<input type="number" id="price-showPd-'+product.code;
					str += '" class="col-4 form-control price-showPd" value='+product.price;
					str += ' data-arr=' + pl + '>'
				str += '</div>';
				str += '<hr/>'

				str += '<div class="row">'
					str += '<div id="total-showTxt-'+product.code;
					str += '" class="col-4 total-showTxt">';
					str += Math.round(formPdQuot*product.price * 100) / 100 + ' €';
					str += '</div>';
					str += '<button type="button" class="col-2 btn btn-warning quotBtn" ';
						str += 'data-sym=-1 data-code=' + product.code;
						str += ' data-arr=' + pl + ' > - </button>';

					str += '<input type="number" id="quot-showPd-'+product.code;
					str += '" class="col-4 form-control quot-showPd" value='+formPdQuot;
					str += ' data-arr=' + pl + '>'

					str += '<button type="button" ';
					str += 'class="col-2 btn btn-primary quotBtn" ';
						str += 'data-sym=1 ';
						str += 'data-arr=' + pl + ' data-code=' + product.code;
						str += '> + </button>';
				str += '</div>';
			str += '</div>';

		str += '</div>';
		str += '</div>';
		
		$('.showPdsForm').append(str);
	}

	// 显示更改单价输入框
	$('.showPdsForm').on("click", ".price-showTxt", function(e) {
		let proIdent = ($(this).attr('id')).split('-')[2];
		$("#price-showIpt-"+proIdent).toggle();
	})

	// 离开更改单价输入框
	$('.showPdsForm').on("blur", ".price-showPd", function(e) {
		let arr = $(e.target).data('arr')
		let product = products[arr];

		let proIdent = product.code;
		let newPrice = $(this).val();
		if(isFloat(newPrice)) {
			let optProduct = getFormPd(proIdent);
			if(optProduct) {
				thisQuot = optProduct.quot;
			} else {
				thisQuot = 0;
			}

			upFormPd(proIdent, thisQuot, newPrice);
		} else {
			$("#price-showPdError-"+proIdent).show();
			$(this).focus();
		}

	})
	

	// 点击product的img 确认产品
	$('.showPdsForm').on("click", ".foto-showImg", function(e) {
		let proCode = ($(this).attr('id')).split('-')[2];
		$(".ajaxPdsCode").val(proCode)
	})

	// 点击product的增或者减，把product添加到order
	$('.showPdsForm').on("click", ".quotBtn", function(e) {
		let target = $(e.target)
		let sym = parseInt(target.data('sym'));	// 
		let arr = parseInt(target.data('arr'));	// 获取现在显示产品列表数组的下标
		let product = products[arr];
		let proIdent = product.code;
		let proPrice = product.price;
		let optProduct = getFormPd(proIdent);


		if(optProduct) {			// 如果订单中已经存在此产品
			formPdQuot = optProduct.quot;
			let aftQuot = parseInt(formPdQuot) + sym;

			if(aftQuot < 1) {			// 如果数量小于1,则在订单中删除此产品
				delFormPd(proIdent);
			} else {
				upFormPd(proIdent, aftQuot, proPrice);
			}
		} else {				// 如果订单中无此产品, 函数中自动判断不可以再减少，只能增加
			newFormPd(product, sym, 1);
		}
		
	})
	

	// 当在订单中的产品数量修改时
	$('#orderNew').on("blur", ".quot-formPd", function(e) {
		let aftQuot = parseInt($(this).val());
		if(isNaN(aftQuot)) aftQuot = 0;

		let proIdent = ($(this).attr('id')).split('-')[2];
		let product = getFormPd(proIdent);
		let proPrice = parseFloat(product.price);

		if(isNaN(aftQuot)) aftQuot = 1;
		if(aftQuot < 1) {
			delFormPd(proIdent);
		} else {
			upFormPd(proIdent, aftQuot, proPrice);
		}
	})

	$('.showPdsForm').on("blur", ".quot-showPd", function(e) {
		let aftQuot = parseInt($(this).val());					// 操作后此产品在订单中的数量
		if(isNaN(aftQuot)) aftQuot = 0;

		let arr = parseInt($(e.target).data('arr'));
		let product = products[arr];

		let proIdent = product.code;
		let proPrice = parseFloat(product.price);

		if(aftQuot < 1) {
			delFormPd(proIdent);
		} else {
			if(getFormPd(proIdent)){
				upFormPd(proIdent, aftQuot, proPrice)
			} else {
				newFormPd(product, 1, aftQuot)
			}
		}
	})

	$('#orderNew').on("click", ".del-formDel", function(e) {
		let proIdent = ($(this).attr('id')).split('-')[2];
		let product = getShowPd(proIdent);

		delFormPd(proIdent)
	})

	// 把order中的此产品移除
	let delFormPd = function(proIdent) {
		// 判断是否移除订单中的产品数组
		let temp = new Array();
		let flag = 0;
		for(let i = 0; i<formPds.length; i++){
			if(formPds[i].code == proIdent) {
				flag =1;
				continue;
			}
			temp.push(formPds[i])
		}
		if(flag == 1) {
			formPds = temp;
			orPdNum = orPdNum - 1;
		} else{
			alert('操作错误，请不要提交。需要刷新重试')
		}
		
		let optProduct = getShowPd(proIdent)
		if(optProduct) {
			proPrice = optProduct.price
		} else {
			proPrice = 0;
		}
		
		upShowPd(proIdent, 0, proPrice)

		$("#iptProduct-"+proIdent).remove()
		
		$("#proLen").text(orPdNum)
		$("#imp").val(getNewImp());
	}

	let upFormPd = function(proIdent, aftQuot, price){
		upShowPd(proIdent, aftQuot, price);
		// 修改订单中products变量
		price = Math.round(price * 100) / 100;
		for(let i = 0; i<formPds.length; i++){
			if(formPds[i].code == proIdent) {
				formPds[i].quot = aftQuot;
				formPds[i].price = price;
				formPds[i].total = Math.round(aftQuot*price * 100) / 100;
				break;
			}
		}

		let total = Math.round(aftQuot*price * 100) / 100;
		// 修改 订单中的product
		$("#quot-formPd-"+proIdent).val(aftQuot)
		$("#price-formTxt"+proIdent).text(price + " €")
		$("#price-formPd"+proIdent).val(price)
		$("#total-formPd-"+proIdent).val(total)
		$("#total-formTxt-"+proIdent).text(total + " €")
		//
		$("#imp").val(getNewImp())
	}

	let newFormPd = function(product, sym, newQuot) {
		if(sym > 0) {
			orderAddObjElem(product, orPdNum, newQuot)

			let ordPro = new Object();
			ordPro.code = product.code;
			ordPro.nome = product.nome;
			ordPro.photo = product.photo;
			ordPro.quot = newQuot;
			ordPro.price = Math.round(product.price * 100) / 100;
			ordPro.total = Math.round(newQuot*product.price * 100) / 100;
			formPds.push(ordPro);

			upShowPd(product.code, newQuot, product.price);

			orPdNum = orPdNum + 1;
			$("#proLen").text(orPdNum);
			$("#imp").val(getNewImp())
		}
	}







	var isFloat = function(str) {
		if(str.length == 0){
			return false
		} else {			
			var nums = str.split('.')
			if(nums.length > 2){
				return false
			} else {
				var n0 = nums[0]
				if(nums.length == 1){
					if(isNaN(n0)) {
						return false
					} else {
						return true
					}
				} else {
					var n1 = nums[1]
					if(isNaN(n0)) {
						return false
					} else {
						if(n1 && isNaN(n1)) {
							return false
						} else {
							return true
						}
					}
					
				}
				
			}
		}
	}
} );
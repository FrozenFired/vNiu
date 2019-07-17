$(function() {
	// let Lang = JSON.parse($("#lang").val())
	let order = JSON.parse($("#order").val());

	/* ------------------------------- Page Show ---------------------------------------------*/
	$("#ajaxPdsCode").focus(function(e) {
		$("#cartPage").hide();
		$("#clientPage").hide();
		$("#prodPage").show();
	})
	$(".cartBtn").click(function(e) {
		$("#prodPage").hide();
		$("#clientPage").hide();
		// 为了重新加载 order内容
		$(".ordProds").remove();
		cartShowPd();
		$("#cartPage").show();
	})
	/* ------------------------------- Page Show ---------------------------------------------*/



	/* ------------------------------- product ajax ---------------------------------------------*/
	let ajaxUrl = "/bsOrderProdsAjax";
	let ajaxIdUrl = "/bsOrderProdIdAjax";
	let ajaxPlusPd = "/bsOrderPlusPdAjax";
	let initFunc = function() {
		$("#ajaxPdsCode").focus();	// 进入销售页面，直接获得焦点
	}
	initFunc();
	// 清除编码 
	$("#pdcodeAjaxCancel").click(function(e) {
		$("#ajaxPdsCode").val("");
		$('.prodFirCard').remove();
		$('.productShow').remove();
		$("#ajaxPdsCode").focus();
	})
	// 编码 输入框，进入焦点后做处理
	$("#ajaxPdsCode").focus(function(e) {
		// console.log(order.sells)
		let str = $(this).val().replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
		if(str.length > 2){
			$('.prodFirCard').remove(); // 清除上次的全部ajaxProds
			$('.productShow').remove(); // 清除上次的独立ajaxProds
			let keyword = encodeURIComponent(str);	// 转化码
			let url = ajaxUrl+'?keyword='+keyword;
			getObjects(url);
		}
	})
	// 输入产品姓名，获取objects， 模糊查询，只要有相应的数字全部显示
	$("#ajaxPdsForm").on('input', '#ajaxPdsCode', function(e) {
		let str = $(this).val().replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
		if(str.length > 2){
			$('.prodFirCard').remove(); // 清除上次的ajaxProds
			$('.productShow').remove(); // 清除上次的ajaxProds
			let keyword = encodeURIComponent(str);	// 转化码
			let url = ajaxUrl+'?keyword='+keyword;
			getObjects(url);
		}
	});
	// 后台获取 模糊 products
	let getObjects = function(url) {
		$.ajax({
			type: 'get',
			url: url
		})
		.done(function(results) {
			if(results.success === 1) {
				let prodFirs = results.objects;
				// console.log(prodFirs)
				let len = prodFirs.length;
				for(let i=0; i<len; i++) {
					showObjs(prodFirs[i])
				}
			}
		})
	}
	// 前端显示获取的 products
	let showObjs = function(object) {
		let nome = $("#langunName").val();
		if(object.nome) nome = object.nome;
		let price = $("#langunPrice").val();
		if(object.price && !isNaN(object.price)){
			price = (object.price).toFixed(2) + ' €';
		}
		let priceIn = '0 €';
		if(object.priceIn && !isNaN(object.priceIn)){
			priceIn = (object.priceIn).toFixed(2) + ' €';
		}

		let str = "";
		str += '<div class="p-2 mt-3 border bg-light prodFirCard prodFirCard-'+object._id+'" ';
		str += 'id="prodFirCard-'+object._id+'">'
			str += '<div class="row">'
				str += '<div class="col-4">'
				str += '<div class="row text-right">'
					str += '<img class="card-img ml-1" src='+dns+object.photo;
					str += ' width="95%" style="max-width: 90px; max-height: 120px"/>';
				str += '</div>';
				str += '</div>';
				str += '<div class="col-8">'
					str += '<div class="row">'

						str += '<h4 class="col-5 text-right">'+'编号'+': </h4>';
						str += '<h4 class="col-7 text-left">'+object.code+'</h4>';

						str += '<div class="col-5 text-right">'+'名字'+': </div>';
						str += '<div class="col-7 text-left">'+nome+'</div>';

						str += '<div class="col-5 text-right">'+'售价'+': </div>';
						str += '<div class="col-7 text-left">'+price+'</div>';

						str += '<div class="col-5 text-right">'+'进价'+': </div>';
						str += '<div class="col-7 text-left">'+priceIn+'</div>';

						str += '<div class="col-12"> Size: [ '
							for(i=0;i<object.sizes.length;i++) {
								str += object.sizes[i] + ', '
							}
						str += ']</div>';

					str += '</div>';
				str += '</div>';
			str += '</div>';

			str += '<div class="row">'
				str += '<div class="col-12 ">'
					str += '<div class="col-12"> Color: [ '
						for(i=0;i<object.prodcls.length;i++) {
							str += object.prodcls[i].color + ', '
						}
					str += ']</div>';
				str += '</div>';
				// str += '<div class="col-2">'
				// 	str += '<span class="oi oi-chevron-bottom"></span>'
				// str += '</div>';
			str += '</div>';

		str += '<div class="row">';
			str += '<div class="col-12 text-right">';
				str += '<button class="btn btn-danger delAjax" data-id='+object._id;
				str += ' type="button" style="display:none">Del</button>';
			str += '</div>';
		str += '</div>';

		str += '</div>';
		
		$("#prodPage").append(str);
	}

	// 点击筛选出的产品后，显示产品详细信息
	$("#prodPage").on('click', '.prodFirCard', function(e) {
		let firId = ($(this).attr('id')).split('-')[1];
		let url = ajaxIdUrl+'?id='+firId;
		obtObject(url)
	})
	// 根据id 获取需要的那个product
	let obtObject = function(url) {
		$.ajax({
			type: 'get',
			url: url
		})
		.done(function(results) {
			if(results.success === 1) {
				let prodFir = results.object;
				$('.prodFirCard').remove(); // 清除上次的ajaxProds
				$('.productShow').remove(); // 清除上次的ajaxProds
				demoProd(prodFir)
			}
		})
	}
	// 前端展示此product的详细信息
	let demoProd = function(object) {
		let nome = "";
		if(object.nome) nome = object.nome;
		let price = "";
		if(object.price && !isNaN(object.price)){
			price = (object.price).toFixed(2) + ' €';
		}
		let priceIn = '0 €';
		if(object.priceIn && !isNaN(object.priceIn)){
			priceIn = (object.priceIn).toFixed(2) + ' €';
		}

		let str = "";
		str += '<div class="mt-3 border bg-secondary productShow">';
			str += '<div class="row text-center">'
				str += '<div class="col-6 text-right">';
				str += '<h4> 编号: </h4>';
				str += '</div>';
				str += '<div class="col-6 text-left">';
				str += '<h4 text-info>'+object.code+'</h4>';
				str += '</div>';

				str += '<div class="col-3">';
				str += '<strong> 名字 </strong><br/>';
				str += '<span>'+object.nome+'</span>';
				str += '</div>';

				str += '<div class="col-3">';
				str += '<strong> 材料 </strong><br/>';
				str += '<span>'+object.material+'</span>';
				str += '</div>';

				str += '<div class="col-3">';
				str += '<strong> 门幅 </strong><br/>';
				str += '<span>'+object.width+'</span>';
				str += '</div>';

				str += '<div class="col-3">';
				str += '<strong> 售价 </strong><br/>';
				str += '<span>'+object.price+'</span>';
				str += '</div>';
			str += '</div>';
		str += '</div>';

		let prodcls = object.prodcls;
		for(i=0;i<prodcls.length; i++) {
			let prodcl = prodcls[i];
			str += '<div class="row bg-light mt-3 text-dark text-center productShow">';
				str += '<div class="col-3">'
					let clPhoto = object.photo;
					if(prodcl.photo && prodcl.photo != '/upload/product/1.jpg'){
						clPhoto = prodcl.photo;
					}
					str += '<img src='+clPhoto+' width="100%" height="50px"/>';
				str += '</div>'

				str += '<div class="col-3 pt-3">' + prodcl.color + '</div>'

			str += '</div>'

			let prodszs = prodcl.prodszs;
			for(j=0;j<prodszs.length;j++) {
				let prodsz = prodszs[j];
				str += '<div class="row border mt-2 text-center productShow">';
					str += '<div class="col-2 pt-3">' + prodsz.size + '</div>'

					str += '<div class="col-3 py-2">';
						str += '<span>0</span>'
						str += '<span> €</span>'
					str += '</div>'

					str += '<div class="col-2 py-3 bg-warning minus" id="minus-'+prodsz._id+'">';
						str += '<span class="oi oi-minus"></span>';
					str += '</div>'

					str += '<div class="col-3 py-2">'
						let ordQuot = 0;
						for(m=0;m<order.sells.length;m++){
							if(order.sells[m].prodThr == prodsz._id) {
								ordQuot = order.sells[m].quot;
							}
						}
						str += '<input class="form-control quot" id="quot-'+prodsz._id;
						str +='" type="number", value='+ordQuot+'>';
					str += '</div>'

					str += '<div class="col-2 py-3 bg-success plus" id="plus-'+prodsz._id+'">';
						str += '<span class="oi oi-plus"></span>';
					str += '</div>';
				str += '</div>';
			}
		}
		
		$("#prodPage").append(str);
	}

	// 点击添加按钮 
	$("#prodPage").on('click', '.plus', function(e) {
		let thrId = $(this).attr('id').split('-')[1];
		let quot = parseInt($("#quot-"+thrId).val()) + 1;
		$("#quot-"+thrId).val(quot)
		url = ajaxPlusPd+'?orderId='+order._id+'&thrId='+thrId+'&quot='+quot;

		orderRelProd(url);
	})
	// 点击minus按钮 
	$("#prodPage").on('click', '.minus', function(e) {
		let thrId = $(this).attr('id').split('-')[1];
		let quot = parseInt($("#quot-"+thrId).val()) - 1;
		if(quot>=0){
			$("#quot-"+thrId).val(quot)
			url = ajaxPlusPd+'?orderId='+order._id+'&thrId='+thrId+'&quot='+quot;

			orderRelProd(url);
		}
	})
	// 把产品quot 添加到此订单中
	let orderRelProd = function(url) {
		$.ajax({
			type: 'get',
			url: url
		})
		.done(function(results) {
			if(results.success === 1) {
				// console.log(results.order)
				order = results.order;
				$("#artText").text(order.sells.length)

				let imp = 0;
				let pz = 0;
				for(i=0;i<order.sells.length;i++){
					let price = parseFloat(order.sells[i].price);
					let size = parseInt(order.sells[i].size);
					let quot = parseInt(order.sells[i].quot);
					let tot = price*size*quot;
					if(!isNaN(tot)){
						imp += tot;
						pz += quot;
					}
				}
				$("#pzText").text(pz)
				$("#impText").text(imp)
			}
		})
	}
	/* ------------------------------- product ajax ---------------------------------------------*/

















	/* ------------------------------- order ajax ---------------------------------------------*/
	let cartShowPd = function() {
		let str = '';

		let total=0;
		str += '<div class="row ordProds">';
			str += '<div class="col-8">';
				str += '<h4>'+order.code+'</h4>'
			str += '</div>';
			str += '<div class="col-4">';
				if(order.cter) {
					str += '<h4>'+order.cter.nome+'</h4>'
				}
			str += '</div>';
		str += '</div>';
		for(i=0;i<order.sells.length;i++) {
			let sell = order.sells[i];
			let size = parseInt(sell.size);
			let quot = parseInt(sell.quot);
			let price = parseFloat(sell.price);
			let tot = 'NaN'
			if(!isNaN(size) && !isNaN(quot) && !isNaN(price) ) {
				tot = quot*size*price;
				total += tot;
			}
			str += '<div class="row bg-light mt-2 text-center ordProds">';
				str += '<div class="col-3 pt-3"><h4>'+sell.code+'</h4></div>';
				str += '<div class="col-3 py-3">'+sell.nome+'</div>';
				str += '<div class="col-3 py-3">'+sell.color+'</div>';
				str += '<div class="col-3 py-3"></div>';
				str += '<div class="col-3 py-3">'+size+' m</div>';
				str += '<div class="col-3 py-3">'+quot+' Pz</div>';
				str += '<div class="col-3 py-3">'+price+' €</div>';
				str += '<div class="col-3 py-3"><strong>'+tot+' €</strong></div>';
			str += '</div>';
		}

		str += '<div class="row border-top mt-3 text-right ordProds">';
			str += '<div class="col-12 py-3">';
				str += '<h3>'+total+' €</h3>';
			str += '</div>';
		str += '</div>';

		$("#ordProds").append(str);
	}
	/* ------------------------------- order ajax ---------------------------------------------*/















	/* ------------------------------- cter ajax ---------------------------------------------*/
	// 所有客户
	let ajaxClient = function() {
		$.ajax({
			type: 'GET',
			url: '/ajaxBsCterAll'
		})
		.done(function(results) {
			if(results.success === 1 && results.cters) {
				let cters = results.cters;
				let str = "";
				for(let i=0; i<cters.length; i++) {
					let cter = cters[i];
					let unpaid = "";
					if(cter.unpaid) unpaid = '<span>'+Lang.bill+': '+cter.unpaid+ '</span><br/>';
					let note = "";
					if(cter.note) note = '<span>'+Lang.note+': '+cter.note+'</span>';
					str += '<div class="col-6">'
						str += '<div class="card clientCard m-2 bg-light" ';
						str += 'id="'+cter.nome+'-'+cter._id+'">';
							//- img.card-img-top(src="..." alt="Card image cap")
							str += '<div class="card-body">';
								str += '<h5 class="card-title text-info">'+ cter.nome +'</h5>';
								str += '<p class="card-text">' 
									str += unpaid;
									str += note;
								str += '</p>'
							str += '</div>'
						str += '</div>'
					str += '</div>'
				}
				$('.allCtersAjax').append(str);


			}
		})
	}
	ajaxClient();

	$('.clientSel').on("click", ".clientCard", function(e) {
		let clientName = ($(this).attr('id')).split('-')[0];
		let clientId = ($(this).attr('id')).split('-')[1];
		$("#clientPage").hide()
		$("#clientBtn").text(clientName)
		$.ajax({
			type: 'GET',
			url: '/bsOrderConnCterAjax?orderId='+order._id+'&cterId='+clientId
		})
		.done(function(results) {
			if(results.success == 1) {
				order = results.order
			}
		})
	})


	// 输入匹配客户
	let matchClient = "";
	$('#formCters').on("input", "#ajaxCters", function(e) {
		matchClient = $(this).val();
		$(".matchEle").remove()
		matchCters();
	})
	let matchCters = function() {
		if(matchClient.length > 0) {
			let keyword = encodeURIComponent(matchClient);
			let keytype = 'nome';
			$.ajax({
				type: 'GET',
				url: '/ajaxBsCters?keytype='+keytype+'&keyword=' + keyword
			})
			.done(function(results) {
				if(results.success === 1 && results.cters) {
					let cters = results.cters;
					let str = "";
					for(let i=0; i<cters.length; i++) {
						let cter = cters[i];
						let unpaid = "";
						if(cter.unpaid) unpaid = '<span>'+Lang.bill+': '+cter.unpaid+ '</span><br/>';
						let note = "";
						if(cter.note) note = '<span>'+Lang.note+': '+cter.note+'</span>';
						str += '<div class="col-6 matchEle">'
							str += '<div class="card clientCard m-2 bg-light" ';
							str += 'id="'+cter.nome+'-'+cter._id+'">';
								//- img.card-img-top(src="..." alt="Card image cap")
								str += '<div class="card-body">';
									str += '<h5 class="card-title text-info">'+ cter.nome +'</h5>';
									str += '<p class="card-text">' 
										str += unpaid;
										str += note;
									str += '</p>'
								str += '</div>'
							str += '</div>'
						str += '</div>'
					}
					$('.catersAjax').append(str);

				}
			})
		}
	}

	/* ------------------------------- cter ajax ---------------------------------------------*/
} );
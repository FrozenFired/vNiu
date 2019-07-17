$( function() {
	let Size = {1: 'XS', 2: 'S', 3: 'M', 4: 'L', 5: 'XL', 6: 'XXL'};
	let ajaxUrl = "/bsProdsAjax";
	let objects = new Array();
	let sortCond = $("#sortCond").val();
	let sortVal = $("#sortVal").val();

	let getObjects = function(url, ajaxClass, appendClass, moreBtn) {
		$.ajax({
			type: 'get',
			url: url
		})
		.done(function(results) {
			if(results.success === 1) {
				let objs = results.objects;
				let len = objs.length;
				let nowLen = objects.length;
				for(let i=0; i<len; i++) {
					showObjs(objs[i], nowLen+i+1, appendClass, ajaxClass)
					objects.push(objs[i])
				}
				if(objects.length < results.keyCount) {
					showMore(objects.length, appendClass, moreBtn);
				} else {
					showEnd(appendClass);
				}
			}
		})
	}
	let showMore = function(skip, appendClass, moreBtn){
		let str = "";
		str += '<div class="col-12">'
			str += '<button class="btn btn-info btn-block '+moreBtn+'" data-skip=';
			str += skip+'> <span class="oi oi-loop-circular"></span> </button>';
		str += '</div>'
		$(appendClass).append(str);
	}
	let showEnd = function(appendClass){
		let str = "";
		str += '<div class="col-12">'
			str += '<button class="btn btn-secondary btn-block endVal';
			str += '"> <span class="oi oi-circle-x"></span> </button>';
		str += '</div>'
		$(appendClass).append(str);
	}
	let showObjs = function(object, numth, appendClass, ajaxClass) {
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
		str += '<div class="card-'+object._id+' col-12 col-sm-4 p-2 '+ajaxClass+'">'
		str += '<div class="card bg-light">'
				str += '<div class="row">'
					str += '<div class="col-4">'
					str += '<a class="btn btn-default text-dark" href="/bsProd/'+object._id+'">';
					str += '<div class="row text-center">'
						str += '<img class="card-img ml-1" src='+dns+object.photo;
						str += ' width="100%" style="max-width: 90px; max-height: 120px"/>';
						str += '<div class="col-12">N.'+numth+'</div>';
					str += '</div>';
					str += '</div>';
					str += '</a>';
					str += '<div class="col-8">'
						str += '<div class="row">'

							str += '<h4 class="col-5 text-right">'+$("#langcode").val()+': </h4>';
							str += '<h4 class="col-7 text-left">'+object.code+'</h4>';

							str += '<div class="col-5 text-right">'+$("#langname").val()+': </div>';
							str += '<div class="col-7 text-left">'+nome+'</div>';

							str += '<div class="col-5 text-right">'+$("#langprice").val()+': </div>';
							str += '<div class="col-7 text-left">'+price+'</div>';

							str += '<div class="col-5 text-right">'+$("#langpriceIn").val()+': </div>';
							str += '<div class="col-7 text-left">'+priceIn+'</div>';

							str += '<div class="col-12"> Size: [ '
								for(i=0;i<object.sizes.length;i++) {
									str += Size[object.sizes[i]] + ', '
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
		str += '</div>';

		str += '<div class="row">';
			str += '<div class="col-12 text-right">';
				str += '<button class="btn btn-danger delAjax" data-id='+object._id;
				str += ' type="button" style="display:none">Del</button>';
			str += '</div>';
		str += '</div>';

		str += '</div>';
		
		$(appendClass).append(str);
	}
	


	let objsInit = function() {

		$('.moreInit').remove();
		let url = ajaxUrl+'?sortCond='+sortCond+'&sortVal=' + sortVal + '&skip='+0;
		getObjects(url, '', '.objects', 'moreInit');
	}
	objsInit();

	$('.container').on('click', '.moreInit', function(e) {
		let target = $(e.target);
		let skip = parseInt(target.data('skip'));

		$('.moreInit').remove();
		let url = ajaxUrl+'?sortCond='+sortCond+'&sortVal=' + sortVal + '&skip='+skip
		getObjects(url, '', '.objects', 'moreInit');
	})



	// 输入产品姓名，获取objects
	$(".ajaxForm").on('input', '.ajaxKey', function(e) {
		// ajaxUrl = $(e.target).data('url'); // 给ajax url 赋值
		objects.length = 0;
		$('.moreVal').remove();
		$('.endVal').remove();
		$('.ajaxClass').remove(); // 清除上次的ajaxProds
		let str = $(".ajaxKey").val().replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
		if(str.length > 0){
			$(".objects").hide();
			let keyword = encodeURIComponent(str);	// 转化码
			let url = ajaxUrl+'?keyword='+keyword;
				url += '&sortCond='+sortCond+'&sortVal=' + sortVal;
				url += '&skip='+0;
			getObjects(url, 'ajaxClass', '.objsKey', 'moreVal');
		} else {
			$(".objects").show();
		}
	});

	$('.container').on('click', '.moreVal', function(e) {
		let target = $(e.target);
		let skip = parseInt(target.data('skip'));

		$('.moreVal').remove();
		let str = $(".ajaxKey").val().replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
		let keyword = encodeURIComponent(str);	// 转化码
		let url = ajaxUrl+'?keyword='+keyword;
			url += '&sortCond='+sortCond+'&sortVal=' + sortVal;
			url += '&skip='+skip;
		getObjects(url, 'ajaxClass', '.objsKey', 'moreVal');
	})





	$('.shield').click(function(e) {
		$(".delAjax").toggle();
	})
	$('.container').on('click', '.delAjax', function(e) {
		let target = $(e.target)
		let id = target.data('id')
		let div = $('.card-' + id)
		$.ajax({
			type: 'DELETE',
			url: '/bsProdDelAjax?id=' + id
		})
		.done(function(results) {
			if(results.success === 1) {
				if(div.length >0) {
					div.remove()
				}
			} else if(results.success === 0) {
				alert(results.info)
			}
		})
	})
} );
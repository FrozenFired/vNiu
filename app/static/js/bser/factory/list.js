$( function() {
	let ajaxUrl = "/bsFtersAjax";
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
		let code = $("#langunset").val();
		if(object.code) code = object.code;

		let str = "";
		str += '<div class="card-'+object._id+' col-12 col-sm-4 p-2 '+ajaxClass+'">'
		str += '<div class="card">'
			str += '<a class=" btn btn-default bg-light text-dark" href="/bsFter/'+object._id+'">';
				str += '<div class="row">'
					str += '<div class="col-6 text-left"><h4>'+code+'</h4></div>';
					str += '<div class="col-6 text-right">'+$("#langname").val()+': '+object.nome+'</div>';
				str += '</div>';
				str += '<div class="row">'
					str += '<div class="col-4 text-left">'
						str += 'Tel:' + object.tel
					str += '</div>';
					str += '<div class="col-4 text-right">';
						if(object.unpaid) {
							unpaid = object.unpaid;
								str += '<span class="text-danger">';
									str += Math.round(unpaid * 100)/100
								str += '</span> €';
						}
					str += '</div>';
					str += '<div class="col-4 text-right">'
						str += '[' + object.arrears.length +']';
					str += '</div>';
				str += '</div>';
				if(object.note) {
					str += '<div class="row">'
						str += '<div class="col-12 text-warning text-left">'
							str += object.note
						str += '</div>';
					str += '</div>';
				}
			str += '</a>';
			str += '<div class="row">';
				str += '<div class="col-12 text-right">';
					str += '<button class="btn btn-danger delAjax" data-id='+object._id;
					str += ' type="button" style="display:none">Del</button>';
				str += '</div>';
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

	// 输入客户姓名，获取objects
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
			url: '/bsFterDelAjax?id=' + id
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
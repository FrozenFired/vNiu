$( function() {
	let ajaxUrl = "/bsRoadsAjax";
	let roads = new Array();

	// let getRoads = function(skip) {
	let getRoads = function(url, ajaxClass, appendClass, moreBtn) {
		$.ajax({
			type: 'get',
			url: url
		})
		.done(function(results) {
			if(results.success === 1) {
				let rds = results.roads;
				let len = rds.length;
				let nowLen = roads.length;
				for(let i=0; i<len; i++) {
					showRoads(rds[i], nowLen+i+1, appendClass, ajaxClass)
					roads.push(rds[i])
				}
				if(roads.length < results.keyCount) {
					showMore(roads.length, appendClass, moreBtn);
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
	let showRoads = function(road, numth, appendClass, ajaxClass) {
		let str = "";
		str += '<div class="card-'+road._id+' ajaxPds col-12 col-sm-4 p-2 '+ajaxClass+'">'
		str += '<div class="card">'
			str += '<a class="btn btn-default bg-light text-dark" href="/bsRoad/'+road._id+'">';
				str += '<div class="row text-left">'
					str += '<div class="col-4">'
						str += '<div class="col-12 text-right">Nr.'+road.code+'</div>';
					str += '</div>';
					str += '<div class="col-8">'
						str += '<div class="row">'
							str += '<div class="col-12">'
								str += '<h4 class="card-title">'+$("#langclient").val()+': '+road.clientNome+'</h4>'
							str += '</div>';
							str += '<div class="col-6">'
								str += '<p class="card-text">Art.: '+road.arts+'</p>'
							str += '</div>';
							str += '<div class="col-6">'
								str += '<p class="card-text">Pz: '+road.pieces+'</p>'
							str += '</div>';
						str += '</div>';
					str += '</div>';
				str += '</div>';
			str += '</a>';
			str += '<div class="row">';
				str += '<div class="col-12 text-right">';
					str += '<button class="btn btn-danger delAjax" data-id='+road._id;
					str += ' type="button" style="display:none">Del</button>';
				str += '</div>';
			str += '</div>';
		str += '</div>';
		str += '</div>';
		
		$(appendClass).append(str);
	}
	


	let rdsInit = function() {

		let url = ajaxUrl+'?skip='+0;
		$('.moreInit').remove();
		getRoads(url, '', '.roads', 'moreInit');
	}
	rdsInit();

	$('.container').on('click', '.moreInit', function(e) {
		let target = $(e.target);
		let skip = parseInt(target.data('skip'));

		$('.moreInit').remove();
		let url = ajaxUrl+'?skip='+skip
		getRoads(url, '', '.roads', 'moreInit');
	})


	$(".ajaxForm").on('input', '.ajaxPdKey', function(e) {
		// ajaxUrl = $(e.target).data('url'); // 给ajax url 赋值
		roads.length = 0;
		$('.moreVal').remove();
		$('.endVal').remove();
		$('.ajaxClass').remove(); // 清除上次的ajaxProds
		let str = parseInt($(".ajaxPdKey").val());
		if(!isNaN(str)) {
			$(".roads").hide();
			let url = ajaxUrl+'?keyword='+str +'&skip='+0;
			getRoads(url, 'ajaxClass', '.roadKey', 'moreVal');
		} else {
			$(".roads").show();
		}
	});


	$('.container').on('click', '.moreVal', function(e) {
		let target = $(e.target);
		let skip = parseInt(target.data('skip'));

		$('.moreVal').remove();
		let str = parseInt($(".ajaxPdKey").val());
		let url = ajaxUrl+'?keyword='+str + '&skip='+skip;
		getRoads(url, 'ajaxClass', '.roadKey', 'moreVal');
	})




	$('.shield').click(function(e) {
		$(".delAjax").toggle();
	})
	$('.roads').on('click', '.delAjax', function(e) {
		let target = $(e.target)
		let id = target.data('id')
		let div = $('.card-' + id)
		$.ajax({
			type: 'DELETE',
			url: '/bsRoadDelAjax?id=' + id
		})
		.done(function(results) {
			if(results.success === 1) {
				if(div.length >0) {
					div.remove()
				}
			}
			if(results.success === 0) {
				alert(results.info)
			}
		})
	})
} );
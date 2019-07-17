$( function() {
	let ajaxUrl = "/bsBillsAjax";
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
		let order = $("#langunset").val();
		if(object.order && object.order.code) {
			order = object.order.code;
		}
		let cter = $("#langlost").val();
		if(object.cter) {
			if(object.cter.nome) cter = object.cter.nome;
			else if(object.cter.code) cter == object.cter.code;
			else cter = $("#langunset").val();
		}

		let str = "";
		str += '<div class="card-'+object._id+' col-12 col-sm-4 p-2 '+ajaxClass+'">'
		str += '<div class="card">'
			str += '<a class=" btn btn-default bg-light text-dark" href="/bsBill/'+object._id+'">';
				str += '<div class="row">'
					str += '<div class="col-6 text-left">'

						str += '<h5>'
							str += order
						str += '</h5>';
					str += '</div>';
					str += '<div class="col-6 text-right">'
						str += $("#langclient").val()+': ' + cter
					str += '</div>';
				str += '</div>';
				str += '<div class="row">'
					str += '<div class="col-6 text-left">'
						str += object.desp
					str += '</div>';
					str += '<div class="col-6 text-right">';
						if(object.unpaid) {
							unpaid = object.unpaid;
								str += '<span class="text-danger">';
									str += Math.round(unpaid * 100)/100
								str += '</span> €';
						}
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

	$('.objects').on('click', '.moreInit', function(e) {
		let target = $(e.target);
		let skip = parseInt(target.data('skip'));

		$('.moreInit').remove();
		let url = ajaxUrl+'?sortCond='+sortCond+'&sortVal=' + sortVal + '&skip='+skip
		getObjects(url, '', '.objects', 'moreInit');
	})

} );
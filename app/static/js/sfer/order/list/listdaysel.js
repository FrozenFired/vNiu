$( function() {
	$(".datepicker").datepicker();
	$(".selDate").click(function(e) {
		$(".days").toggle();
		$(".day").toggle();
	})
	// 添加 日期 行元素
	let singledateRow = function(timestamp) {
		var time = new Date(timestamp)
		let month = time.getMonth()+1;
		let day = time.getDate();
		let ident = timestamp;
		let elem;
		elem = '<div class="row singleday mt-2 py-2">';
			elem += '<div class="col-4">';
				elem += '<span>'+month+$("#langmonth").val()+day+$("#langday").val()+'</span>';
			elem += '</div>';
			elem += '<div class="col-4 text-warning text-center">';
				elem += '<span id="slen_'+ident+'"></span>';
			elem += '</div>';
			elem += '<div class="col-4 text-right">';
				elem += '<span id="stot_'+ident+'" class="text-warning"></span>';
				elem += '<span> €</span>';
			elem += '</div>';
		elem += '</div>';

		$('.day').append(elem);
	}
	// 添加order 元素
	let orderRow = function(order, ident) {
		let elem;
		elem = '<div class="card mt-2 singleday sdayshow_'+ident+'">';
			elem += '<a class="btn btn-default bg-light text-dark" href="sfOrder/'+order._id+'">';
				elem += '<div class="row">';
					elem += '<div class="col-8 text-left">';
						let code = 'view';
						if(order.code) code = order.code;
						elem += '<h4>'+code+'</h4>';
					elem += '</div>';
					elem += '<div class="col-4 text-right">';
						elem += '<span class="text-info">';
							if(isNaN(order.rlp)){
								elem += 'NaN';
							} else {
								elem += Math.round(order.rlp*100)/100
							}
						elem += '</span>';
						elem += '<span> €</span>'
					elem += '</div>';
				elem += '</div>';

				elem += '<div class="row">';
					elem += '<div class="col-4 text-left">';
						var date = new Date(order.ctAt);
						elem += (date).getHours() + ':'
						elem += (date).getMinutes() + ':'
						elem += (date).getSeconds();
					elem += '</div>';
					elem += '<div class="col-4">' + order.pieces + 'pz</div>'
					elem += '<div class="col-4">T.Art: ' + order.arts+'</div>';
				elem += '</div>';

				elem += '<div class="row">';
					elem += '<div class="col-6 text-left">';
					if(order.cter) {
						elem += order.cter.nome;
					}
					elem += '</div>';
					elem += '<div class="col-6 text-right">'; 
					if(order.imp != order.rlp) {
						if(isNaN(order.imp)) {
							elem += 'NaN'
						} else {
							elem += $("#langorgPrice").val()+': '+Math.round(order.imp * 100)/100+' €';
						}
					}
					elem += '</div>';
				elem += '</div>';
				if(order.note) {
					elem += '<div class="row">';
						elem += '<div class="col-12 text-warning text-left">';
							elem += order.note;
						elem += '</div>';
					elem += '</div>';
				}
			elem += '</a>';
		elem += '</div>';
		$('.day').append(elem);
	}
	// 获取orders
	let getsdOrders = function(timestamp) {
		
		let ident = timestamp;
		let sferCode = $("#selWserCode").val();
		$.ajax({
			type: 'GET',
			url: '/sfOrdersAjax?begin=' + timestamp + '&selWserCode='+sferCode
		})
		.done(function(results) {
			if(results.success === 1) {
				let orders = results.orders;
				let len = orders.length;
				$("#slen_"+ident).text(len+$("#langitem").val())
				// alert(orders[0].ctAt)
				let tot = 0;
				for(let i=0; i<len; i++) {
					let order = orders[i];
					if(!isNaN(order.rlp)){
						tot += order.rlp;
					}
					orderRow(order, ident);
				}
				if(len>0) {
					totalStr = tot.toFixed(2);
				} else {
					totalStr = $("#langunItem").val();
				}
				$("#stot_"+ident).text(totalStr)
			} else {

			}
		})
	}
	$("#dirDate").change(function(e) {
		$('.singleday').remove()
		let timestamp = new Date($(this).val()).setHours(0,0,0,0)
		singledateRow(timestamp);
		getsdOrders(timestamp);
	});

	let dayinit = function() {
		let now = new Date();
		let timestamp = now.setHours(0, 0, 0, 0);
		singledateRow(timestamp);
		getsdOrders(timestamp);
	}
	dayinit();
} );
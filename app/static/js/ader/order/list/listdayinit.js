$( function() {
	// 添加 日期 行元素
	let dateRow = function(timestamp) {
		var time = new Date(timestamp)
		let month = time.getMonth()+1;
		let day = time.getDate();
		let ident = timestamp;
		let elem;
		elem = '<div class="row dateorder mt-2 py-2">';
			elem += '<div class="col-1">';
				elem += '<span class="dayhide dayhide_'+ident+'" id="dayhide_'+ident;
				elem += '" style="display:none">';
					elem += '<span class="oi oi-caret-right"></span>';
				elem += '</span>';
				elem += '<span class="dayshow dayshow_'+ident+'" id="dayshow_'+ident+'">';
					elem += '<span class="oi oi-caret-bottom"></span>';
				elem += '</span>';
			elem += '</div>';
			elem += '<div class="col-3">';
				elem += '<span>'+month+'月'+day+'日'+'</span>';
			elem += '</div>';
			elem += '<div class="col-4 text-warning text-center">';
				elem += '<span id="len_'+ident+'"></span>';
			elem += '</div>';
			elem += '<div class="col-4 text-right">';
				elem += '<span id="tot_'+ident+'" class="text-warning"></span>';
				elem += '<span> €</span>';
			elem += '</div>';
		elem += '</div>';

		$('.days').append(elem);
	}
	// 添加 下个日期 行元素
	let lastdayRow = function(lastTimestamp) {
		ident = lastTimestamp;
		let lastDay = new Date(lastTimestamp);
		month = lastDay.getMonth()+1;
		day = lastDay.getDate();

		let elem;
		elem = '<div class="row mt-2 py-2 lastday" id="lastday_'+ident+'">';
			elem += '<div class="col-1">';
				elem += '<span class="oi oi-plus"></span>';
			elem += '</div>';
			elem += '<div class="col-3">';
				elem += '<span>'+month+'月'+day+'日'+'</span>';
			elem += '</div>';
			elem += '<div class="col-8 text-center">';
			elem += '</div>';
		elem += '</div>';

		$('.days').append(elem);
	}

	// 添加order 元素
	let orderRow = function(order, ident) {
		let elem;
		elem = '<div class="card mt-2 dayshow_'+ident+'">';
			elem += '<a class="btn btn-default bg-light text-dark" href="adOrder/'+order._id+'">';
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
					elem += '<div class="col-4">T.Art:' + order.products.length+'</div>';
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
							elem += '原价:'+Math.round(order.imp * 100)/100+' €';
						}
					}
					elem += '</div>';
				elem += '</div>';
				if(order.node) {
					elem += '<div class="row">';
						elem += '<div class="col-12 text-warning text-left">';
							elem += order.note;
						elem += '</div>';
					elem += '</div>';
				}
			elem += '</a>';
		elem += '</div>';
		$('.days').append(elem);
	}
	// 获取orders
	let getOrders = function(timestamp) {
		
		let ident = timestamp;
		let wsgpId = $("#selWsgpId").val();
		$.ajax({
			type: 'GET',
			url: '/adOrdersAjax?begin=' + timestamp + '&selWsgpId='+wsgpId
		})
		.done(function(results) {
			if(results.success === 1) {
				let orders = results.orders;
				let len = orders.length;
				$("#len_"+ident).text(len+' 单')
				// alert(orders[0].ctAt)
				let tot = 0;
				for(let i=0; i<len; i++) {
					let order = orders[i];
					if(!isNaN(order.rlp)){
						tot += order.rlp;
					}
					orderRow(order, ident);
				}

				$("#tot_"+ident).text(tot.toFixed(2))
				let lastTimestamp = timestamp - 24*60*60*1000;
				lastdayRow(lastTimestamp);
			} else {

			}
		})
	}

	let daysinit = function() {
		let now = new Date();
		let timestamp = now.setHours(0, 0, 0, 0);
		// dateRow(timestamp);
		// getOrders(timestamp);
		lastdayRow(timestamp);
	}
	daysinit();


	$(".days").on('click', '.lastday', function(e) {
		let timestamp = parseInt(($(this).attr('id')).split('_')[1]);
		$(this).remove()
		dateRow(timestamp);
		getOrders(timestamp)
	})

} );
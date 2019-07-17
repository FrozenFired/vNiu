$( function() {
	$(".clientBtn").click(function(e) {
		$(".clientInfo").toggle()
	})
	$(".clientAjax").click(function(e) {
		// 此按钮只按一次，节省ajax资源
		$(".clientAjax").hide();
		$(".clientBtn").show();
		
		$(".clientInfo").show()
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
					str += '<div class="col-6 col-sm-3">'
						str += '<div class="card clientCard m-2 bg-light" id="'+cter.nome+'-'+cter._id+'">';
							//- img.card-img-top(src="..." alt="Card image cap")
							str += '<div class="card-body">';
								str += '<h5 class="card-title">'+ cter.nome +'</h5>';
								str += '<p class="card-text">' 
									str += '<span> iva:' + cter.iva + '</span><br/>'
									str += '<span> Tel:' + cter.tel + '</span>';
								str += '</p>'
							str += '</div>'
						str += '</div>'
					str += '</div>'
				}
				$('.cterAllAjax').append(str);
			}
		})
	})
	
	$(".cancel").click(function(e) {
		$(".clientInfo").hide()
	})
	$('.cterAllAjax').on("click", ".clientCard", function(e) {
		let cterId = ($(this).attr('id')).split('-')[1];
		let orderId = $("#orderId").val();
		bsOrderRelCter(cterId, orderId)
	})
	$('.ctersAjax').on("click", ".clientCard", function(e) {
		let cterId = ($(this).attr('id')).split('-')[1];
		let orderId = $("#orderId").val();
		bsOrderRelCter(cterId, orderId)
	})
	let bsOrderRelCter = function(cterId, orderId) {
		$.ajax({
			type: 'GET',
			url: '/bsOrderRelCter?orderId='+orderId+'&cterId='+cterId
		})
		.done(function(results) {
			if(results.success === 1) {
				window.location.reload();
			}
		})
	}

	// 输入匹配客户
	let matchClient = "";
	$('#formCters').on("input", "#ajaxCters", function(e) {
		matchClient = $(this).val();
		$(".matchEle").remove()
		matchCters();
	})
	$('#formCtersCp').on("input", "#ajaxCtersCp", function(e) {
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
						if(cter.unpaid) unpaid = '<span>欠款: '+cter.unpaid+ '</span><br/>';
						let note = "";
						if(cter.note) note = '<span>备注: '+cter.note+'</span>';
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
					$('.ctersAjax').append(str);

				}
			})
		}
	}
} );
$( function() {
	// 所有客户
	let ajaxClient = function() {
		$.ajax({
			type: 'GET',
			url: '/ajaxSfCterAll'
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

	$("#showClient").click(function(e) {
		$(".orderInformation").toggle()
		$(".clientInformation").toggle()
	})
	$('.clientSel').on("click", ".clientCard", function(e) {
		let clientName = ($(this).attr('id')).split('-')[0];
		let clientId = ($(this).attr('id')).split('-')[1];
		$(".orderInformation").toggle()
		$(".clientInformation").toggle()
		$("#showClient").text(clientName)
		$("#orderCter").val(clientId)
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
				url: '/ajaxSfCters?keytype='+keytype+'&keyword=' + keyword
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
					$('.catersAjax').append(str);

				}
			})
		}
	}

} );
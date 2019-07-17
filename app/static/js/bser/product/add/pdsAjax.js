$( function() {
	let ajaxUrl = "/orderAjaxBsProds";
	let products = new Array();
	$("#back").click(function(e) {
		window.location.href = "/bsProds";
	})
	$(".ajaxPdKey").focus()

	$(".ajaxPdForm").on('input', '.ajaxPdKey', function(e) {
		obtPds();
	});

	let obtPds = function() {
		let str = $(".ajaxPdKey").val().replace(/(\s*$)/g, "").replace( /^\s*/, '').toUpperCase();
		$('.ajaxPds').remove(); products = new Array();
		if(str.length > 2){
			$('#iptCode').val(str);

			let keyword = encodeURIComponent(str);	// 转化码
			let keytype = 'code';
			$.ajax({
				type: 'get',
				url: ajaxUrl+'?keytype='+keytype+'&keyword=' + keyword
			})
			.done(function(results) {
				if(results.success === 1) {
					$(".ajaxInfo").text($("#oldPd").val())
					$(".btnNewPd").hide()
					$(".newPd").hide()
					$(".plusPd").hide()

					products[0] = results.product;
					showProduct(products[0], 0)
				} else if(results.success === 2) {
					$(".ajaxInfo").text($("#oldNew").val())
					$(".btnNewPd").show()
					$(".newPd").hide()
					$(".plusPd").hide()

					products = results.products;
					for(let i=0; i<products.length; i++) {
						showProduct(products[i], i)
					}
				} else {
					$(".ajaxInfo").text($("#iptPd").val())
					$(".newPd").show()
					$(".btnNewPd").hide()
					$(".plusPd").hide()
				}
			})
		} else {
			$(".ajaxInfo").text($("#codeRule").val())
			$(".newPd").hide()
			$(".btnNewPd").hide()
			$(".plusPd").hide()
		}
	}

	let showProduct = function(product, pl) {
		let nome = $("#unName");
		if(product.nome) nome = product.nome;

		let str = "";
		str += '<div class="ajaxPds col-12 col-sm-4 p-2">'
			str += '<div class="card" id='+pl+'>'
				str += '<div class="row">'
					str += '<div class="col-3">'
						str += '<img class="card-img" src='+dns+product.photo;
						str += ' alt='+product.code+' />';
					str += '</div>';
					str += '<div class="col-9">'
						str += '<div class="row">'
							str += '<div class="col-6"><h4 class="card-title">'+product.code+'</h4></div>';
							str += '<div class="col-6"><h5 class="card-text">'+nome+'</h5></div>';
						str += '</div>';
						str += '<div class="row">'
							str += '<div class="col-6">'
								if(product.price && !isNaN(product.price)){
									price = (product.price).toFixed(2) + ' €';
								} else {
									price = $("#unPrice")
								}
								// p.card-text #{(object.price).toFixed(2)}
								str += '<p class="card-text">'+price+'</p>'
							str += '</div>';
							str += '<div class="col-6">'
								// p.card-text(class=textStock) 库存:#{object.stock}
								str += '<p class="card-text textStock">'+ $("#stock").val() +':'+product.stock+'</p>' 
							str += '</div>';
						str += '</div>';
					str += '</div>';
				str += '</div>';
			str += '</div>';
		str += '</div>';
		
		$('.products').append(str);
	}
	
	$(".btnNewPd").click(function(e) {
		$('.ajaxPds').remove();
		$(".ajaxInfo").text($("#iptPd").val())
		$(".newPd").show()
		$(".btnNewPd").hide()
	})

	$('.products').on('click', '.card', function(e) {
		let arr = parseInt($(this).attr('id'));
		let product = products[arr];

		$('.ajaxPds').remove();
		$(".ajaxInfo").text($("#buyQuot").val())
		$(".btnNewPd").hide()
		$(".plusPd").show()
		$("#iptId").val(product._id)
		$("#pdNome").text(product.nome)
		$("#pdPrice").text(product.price)
		$("#pdStock").text(product.stock)
		$("#orgStock").val(product.stock)

		$(".proImg").empty();
		str = '<a href="/bsProd/'+product._id+'">';
		str += '<img src='+dns+product.photo+' height="180px" />';
		str += '</a>'
		$(".proImg").append(str);

	})

	$("#bsProdUpd").on("input", "#iptAddquot", function(e) {
		let addquot = 0;
		if(!isNaN(parseInt($(this).val()) ) ) addquot = parseInt($(this).val());
		let stock = 0;
		if(!isNaN(parseInt($("#orgStock").val()) ) ) stock = parseInt($("#orgStock").val());
		let newStock = addquot + stock;
		$("#upStock").val(newStock)
	})
} );
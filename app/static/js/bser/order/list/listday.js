$( function() {
	// 选择成员
	$("#selWser").change(function(e) {
		let selWserCode = $(this).val();
		self.location.href="/bsOrders?selWserCode="+selWserCode;
	});

	$(".container").on('click', '.dayshow', function(e) {
		let ident = ($(this).attr('id')).split('_')[1];
		$(".dayshow_"+ident).hide()
		$(".dayhide_"+ident).show()
	})
	$(".container").on('click', '.dayhide', function(e) {
		let ident = ($(this).attr('id')).split('_')[1];
		$(".dayhide_"+ident).hide()
		$(".dayshow_"+ident).show()
	})
} );
$( function() {
	$("#selWsgp").change(function(e) {
		let selWsgpId = $(this).val();
		self.location.href="/adProds?selWsgpId="+selWsgpId;
	});
} );
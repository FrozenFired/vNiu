let ObjDB = require('../../models/matter/order');

exports.adOptarts = function(req, res) {
	console.log('start: ' + Date.now())
	ObjDB.find({}, function(err, orders) {
		if(err) console.log(err);
		let len = orders.length;
		// for(let i=0; i<len; i++){
		// 	let order = orders[i];
		// 	if(order.arts) {
		// 		console.log(i)
		// 	}
		// }
		adoptOrdSave(orders, 0);
		console.log('Finish: ' + Date.now())
	})
}

let adoptOrdSave = function(orders, nm) {
	if(nm == orders.length) return;
	let order = orders[nm];
	order.arts = order.products.length;

	order.save(function(err, objSave) {
		if(err) console.log(err);
		console.log(nm)
		adoptOrdSave(orders, nm+1)
	})
}
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

const colection = 'Wsgp';
let dbSchema = new Schema({		// Wholesaler group 批发商所属公司
	code: {			// name
		unique: true,
		type: String
	},
	// nome: String,
	iva: String,
	cf: String,	// codice fisicale 税号
	post: String,
	addr: String,
	ct: String,
	city: String,
	nt: String,
	nation: String,
	tel: String,
	bank: String,
	iban: String,
	resp: String,// 负责人

	colors: [{type: String}],

	ctAt: Date,
	upAt: Date,
});
dbSchema.pre('save', function(next) {	
	if(this.isNew) {
		this.upAt = this.ctAt = Date.now();
	} else {
		this.upAt = Date.now();
	}
	next();
});

module.exports = mongoose.model(colection, dbSchema);
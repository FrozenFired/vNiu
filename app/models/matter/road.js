let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let ObjectId = Schema.Types.ObjectId;
let Float = require('mongoose-float').loadType(mongoose, 2);

const colection = 'Road';
let dbSchema = new Schema({
	group: {type: ObjectId, ref: 'Wsgp'},
	order: {type: ObjectId, ref: 'Order'},

	code: Number,

	desp: String,
	arts: Number,
	pieces: Number,

	clientNome: String,
	clientAddr: String,
	clientIva: String,
	clientCF: String,
	clientTel: String,
	dest: String,

	printing: {
		type: Number,
		default: 0
	},

	ctAt: Date,
	note: String,
});

dbSchema.pre('save', function(next) {	
	if(this.isNew) {
		this.ctAt = Date.now();
	}
	next();
})

module.exports = mongoose.model(colection, dbSchema);
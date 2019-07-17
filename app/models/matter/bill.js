let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let ObjectId = Schema.Types.ObjectId;
let Float = require('mongoose-float').loadType(mongoose, 2);

const colection = 'Bill';
let dbSchema = new Schema({
	group: {type: ObjectId, ref: 'Wsgp'},
	cter:{type: ObjectId, ref: 'Cter'},
	order: {type: ObjectId, ref: 'Order'},

	unpaid: Float,
	desp: String,

	crter: {type: ObjectId, ref: 'Wser'},
	upder: {type: ObjectId, ref: 'Wser'},
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
})

module.exports = mongoose.model(colection, dbSchema);
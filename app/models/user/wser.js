let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let ObjectId = Schema.Types.ObjectId;

const colection = 'Wser';	// Wholesaler 批发商
let dbSchema = new Schema({
	code: {
		unique: true,
		type: String
	},
	pwd: String,

	group: {type: ObjectId, ref: 'Wsgp'},
	cd: String,		// 本公司唯一
	role: Number,
	lang: {type: Number, default: 0},

	nome: String,

	photo: {
		type: String,
		default: '/upload/avatar/wser/1.jpg'
	},
	// 打印类型
	printAx: {
		type:Number,
		default: 4
	},

	lgAt: Date,	// 登录时间

	ctAt: Date,
	upAt: Date,
});
dbSchema.pre('save', function(next) {	
	if(this.isNew) {
		this.upAt = this.ctAt = this.lgAt = Date.now();
	} else {
		this.upAt = Date.now();
	}
	next();
});
module.exports = mongoose.model(colection, dbSchema);
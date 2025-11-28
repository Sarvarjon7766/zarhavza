const { model, Schema } = require('mongoose')
const networksSchema = new Schema({
	name: {
		type: String,
	},
	link: {
		type: String,
	},
	key: {
		type: String,
		enum: ['facebook', 'telegram', 'youtube', 'instagram', 'location', 'notfount'],
		default: 'notfount'
	}

})
module.exports = new model('socialnetwork', networksSchema)
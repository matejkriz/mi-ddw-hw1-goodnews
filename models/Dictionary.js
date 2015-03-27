var db = require('./Database');

/**
 * Create a Schema to hold dictionary.
 */
var schema = new db.Schema({
	language: String,
	vocabulary: [String],
	type: [String]
});

module.exports = db.model('Dictionary', schema);

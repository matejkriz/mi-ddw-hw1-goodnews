var db = require('./Database');
var negativeWords = require('../dictionary/negative.json');

/**
 * Create a Schema to hold dictionary.
 */
var schema = new db.Schema({
	language: String,
	vocabulary: [String],
	type: [String]
});

function initDictionary() {
	Dictionary.create({
		language: 'cs',
		vocabulary: negativeWords.cs,
		type: ['news']
	});
}

module.exports = db.model('Dictionary', schema);

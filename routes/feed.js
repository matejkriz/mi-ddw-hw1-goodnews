var FeedParser = require('feedparser');
var request = require('request');
var analyze = require('./analyze');

var socket = {};
exports.fetch = function(req, res) {
  var feed = req.query.url;
  socket.field = req.query.filterBy ? req.query.filterBy : 'title';
  socket.req = req;
  socket.res = res;
  socket.posts = [];
	socket.positiveness = req.query.positiveness ? req.query.positiveness : 1;

	if(!feed){
		res.send(400, 'You must select feed!')
	}

  // Define streams
  var feedRequest = request(feed, {
    timeout: 10000,
    pool: false
  });

  var feedparser = new FeedParser();

  // Define handlers
  feedRequest.on('error', done);
  feedRequest.on('response', function(res) {
    if (res.statusCode != 200) return this.emit('error', new Error(
      'Bad status code'));
    var charset = getParams(res.headers['content-type'] || '').charset;
    // And boom goes the dynamite
    res.pipe(feedparser);
  });

  feedparser.on('error', done);
  feedparser.on('end', done);
  var counter = 0;
  feedparser.on('readable', function() {
    var post;
    while (post = this.read()) {
      socket.posts.push(post);
    }

  });
}

function getParams(str) {
  var params = str.split(';').reduce(function(params, param) {
    var parts = param.split('=').map(function(part) {
      return part.trim();
    });
    if (parts.length === 2) {
      params[parts[0]] = parts[1];
    }
    return params;
  }, {});
  return params;
}

function done(err) {
  if (err) {
    console.log(err, err.stack);
  }
  analyze.analyzeNegativeness(socket.posts, socket.field, function(posts) {
    socket.res.send(filter(posts, socket.positiveness));
  })
}

function getNegativeCount(posts) {
	var negativeCount = 0;
	for (var i = 0; i < posts.length; i++) {
		if(posts[i].negativeness > 0) {
			negativeCount++;
		}
	}
	return negativeCount;
}

function getIndexList(posts) {
	var indexList = posts.map(function(post, position){
		return {index: position, negativeness: post.negativeness};
	});
	// sort posts descendent by negativness
	return indexList.sort(function(a, b){return b.negativeness - a.negativeness});
}

function removeMostNegative(posts, count, indexList){
	for (var i = 0; i < count; i++) {
		posts.splice(indexList[i].index, 1);
	}
	return posts;
}


// positiveness (between 0 and 1)- rate of completely positive posts to keep
function filter(posts, positiveness) {
	var totalCount = posts.length;
	var negativeCount = getNegativeCount(posts);
	var toFilterRate = (negativeCount / totalCount) * positiveness;
	var toFilterCount = Math.round(toFilterRate * totalCount);

	console.log("totalCount");
	console.log(totalCount);
	console.log("negativeCount");
	console.log(negativeCount);
	console.log("positiveness");
	console.log(positiveness);
	console.log("toFilterRate");
	console.log(toFilterRate);
	console.log("toFilterCount");
	console.log(toFilterCount);

	var filteredPosts = removeMostNegative(posts, toFilterCount, getIndexList(posts));
	console.log("filteredPosts.length");
	console.log(filteredPosts.length);
	return filteredPosts;
}

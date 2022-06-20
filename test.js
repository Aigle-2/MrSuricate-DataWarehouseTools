var lineReader = require('line-reader');
const path = require('path');
console.log(path.resolve('./out-mongo-small.json'))
lineReader.eachLine(path.resolve('./out-mongo-small.json'), function(line, last) {
  console.log(line);


});

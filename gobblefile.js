var gobble = require('gobble');
var version = require('./package.json').version;

module.exports = gobble([
  gobble('src/client').transform('browserify', {
    entries: './index.es6',
    dest: 'app-' + version + '.js',
    extensions: ['.es6', '.html']
  }),
  
  gobble('node_modules/bootstrap/dist/css/bootstrap.min.css'),
  
  gobble('src/client/app.css')
]);
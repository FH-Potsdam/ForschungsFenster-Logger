var fs = require('fs');

/**
 * Description of the class.
 */
function BunyanExtras() {
  this.dir = 'logs';
  this.latestLog = (new Date().getTime())+'.log';
}

module.exports = BunyanExtras;

/**
 * Check if a logs directory exist.
 * If no dir exists, create one.
 */
BunyanExtras.prototype.checkDir = function(dirname) {
  if (dirname !== undefined) {
    this.dir = dirname;
  }
  if (!fs.existsSync(this.dir)) {
    fs.mkdirSync(this.dir);
  }
};

/**
 * Get the log filepath.
 */
BunyanExtras.prototype.filepath = function() {
  return this.dir+'/'+this.latestLog;
};

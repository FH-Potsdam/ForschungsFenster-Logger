/**
 * Module dependencies.
 */
var fs = require('fs');
var ApiModel = require('api-model');

/**
 * The Logger class.
 */
function ForschungsFensterLogger() {
  this.dir = 'logs';
  this.suffix = '.log';
  this.latestLog = (new Date().getTime());
  this.latestLogFile = this.latestLog+this.suffix;
  // Get the log filepath.
  this.path = this.dir+'/'+this.latestLog+this.suffix;
  // small verbose log boolean to trigger on debug information.
  this.verboseLog = true;
  this.verboseInfo('dir       = '+this.dir);
  this.verboseInfo('latestLog = '+this.latestLog);
  this.verboseInfo('suffix    = '+this.suffix);
  this.verboseInfo('path      = '+this.path);
}

module.exports = ForschungsFensterLogger;

/**
 * create the logger...
 * 
 * @param  {Object} options The configuration.
 * @return {[type]} [description]
 */
ForschungsFensterLogger.prototype.init = function(Logger, options) {
  this.verboseInfo('init = '+options);
  var self = this;

  self.checkDir(self.dir);

  GLOBAL.log = new Logger({
    name: options.name,
    streams: [
      {
        stream: process.stdout,
        level: 'debug'
      },
      {
        path: self.path,
        level: 'debug' // trace for logging all kind of messages.
      }
    ],
    serializers: {
      req: Logger.stdSerializers.req,
      res: Logger.stdSerializers.res
    }
  });

  // First log with the global logger...
  log.debug('Logger Initialized');
  return options;
};


/**
 * Check if a logs directory exist.
 * If no dir exists, create one.
 *
 * return true if directory exists
 */
ForschungsFensterLogger.prototype.checkDir = function(dirname) {
  console.log('checkDir');
  if (dirname !== undefined) {
    this.dir = dirname;
  }

  if (!fs.existsSync(this.dir)) {
    fs.mkdirSync(this.dir);
    return false;
  } else {
    return true;
  }
};


/**
 * The routes
 */
ForschungsFensterLogger.prototype.routes = function(express, options) {
  var self = this;
  var tmpBaseUrl = options.baseUrl;
  console.log('baseUrl: ', tmpBaseUrl);

  /**
   * @api {get} /logs GET logs
   * @apiVersion 0.1.0
   * @apiGroup logs
   * @apiDescription
   *     Send a list of log files.
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "meta": {
   *         "code": 200,
   *         "status": "OK"
   *       },
   *       "data": [
   *         "array",
   *         "of",
   *         "log",
   *         "files"
   *       ]
   *     }
   *
   * @apiExample Example usage:
   *     curl -i http://localhost:3000/logs
   */
  express.get(tmpBaseUrl, function(req, res) {
    log.info('GET /logs');
    
    var tmpLogsDir = process.cwd()+'/'+self.dir;
    console.log('tmpLogsDir', tmpLogsDir);
    var logsDir = fs.readdirSync(tmpLogsDir);

    var apiModel = new ApiModel(res);

    var tmpData = {
      latest_log: self.latestLog,
      logs: 'logs'
    };

    tmpData.logs = new Array(logsDir.length);
    for (var i = 0; i < logsDir.length; i++) {
      tmpData.logs[i] = {
        filename: logsDir[i],
        url: 'http://'+req.headers.host+tmpBaseUrl+'/file/'+logsDir[i]
      };
    };

    apiModel.setData(tmpData);
    res.json(apiModel.getStore());
  });

  /**
 * @api {get} /logs/:file GET log file
 * @apiVersion 0.1.0
 * @apiGroup logs
 * @apiDescription
 *     Response the log file as json.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "meta": {
 *         "code": 200,
 *         "status": "OK"
 *       },
 *       "data": [
 *         "array",
 *         "of",
 *         "log",
 *         "files"
 *       ]
 *     }
 *
 * @apiExample Example usage:
 *     curl -i http://localhost:3000/logs/:file
 */
  express.get(tmpBaseUrl+'/file/:file', function(req, res) {
    log.info('GET /logs/'+req.params.file+'/');
    var tmp = logfile(self.dir, req.params.file);
    res.json(tmp);
  });

  express.get(tmpBaseUrl+'/latest', function(req, res) {
    log.info('GET /logs/latest');
    console.log('TODO: redirect to logs/filename.log');

    //var tmp = logfile(self.dir, self.latestLogFile);
    res.json('tmp');
    return next();
  });

};


function logfile(dir, filename) {
  var filepath = process.cwd()+'/'+dir+'/'+filename;
  var logs = fs.readFileSync(filepath, 'utf8');
  var splitted = logs.split('\n');
  var tmp = [];

  for (var i = 0; i < splitted.length-1; i++) {
    var parsed = JSON.parse(splitted[i]);
    tmp.push(parsed);
  };
  //console.log(tmp);
  
  return tmp;
}

/**
 * @api {get} /logs/latest GET latest log file
 * @apiVersion 0.1.0
 * @apiGroup logs
 * @apiDescription
 *     Response the latest log file.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *     }
 *
 * @apiExample Example usage:
 *     curl -i http://localhost:3000/logs/latest
 */
ForschungsFensterLogger.prototype.latestFile = function(req, res, next) {
  log.info('GET /logs/latest');
  console.log('TODO: redirect to logs/filename.log');

  var tmp = logfile(latestLog);
  res.json(tmp);
  return next();
};


/**
 * internal verbose log
 */
ForschungsFensterLogger.prototype.verboseInfo = function(msg) {
  if (this.verboseLog === true) {
    console.log('LOGGER-INFO: '+msg);
  };
};

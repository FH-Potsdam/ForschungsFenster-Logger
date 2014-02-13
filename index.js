/**
 * Module dependencies.
 */
var fs = require('fs');
var ApiModel = require('api-model');

/**
 * The Logger class.
 */
function ForschungsFensterLogger() {
  // The directory we want to log
  this.dir = 'logs';

  // The logfile suffix
  this.suffix = '.log';
  
  // Latest log name
  this.latestLog = (new Date().getTime());
  
  // Latest logfile name
  this.latestLogFile = this.latestLog+this.suffix;
  
  // small verbose log boolean to trigger on debug information.
  this.verboseLog = false;
}

module.exports = ForschungsFensterLogger;


/**
 * Initialize the logger (create directory, init bunyan...)
 * 
 * @param  {Object} options The configuration.
 * @return {[type]} [description]
 */
ForschungsFensterLogger.prototype.init = function(Logger, options) {
  var self = this;

  if (options !== undefined) {
    if (options.dir !== undefined) self.dir = options.dir;
    if (options.latestLog !== undefined) self.latestLog = options.latestLog;
    if (options.suffix !== undefined) self.suffix = options.suffix;
    if (options.verboseLog !== undefined) self.verboseLog = options.verboseLog;
  };
  self.verboseInfo('dir         = '+self.dir);
  self.verboseInfo('latestLog   = '+self.latestLog);
  self.verboseInfo('suffix      = '+self.suffix);
  self.verboseInfo('filedir     = '+self.getFiledir());

  self.checkDir(self.dir);

  GLOBAL.log = new Logger({
    name: options.name,
    streams: [
      {
        stream: process.stdout,
        level: 'debug'
      },
      {
        path: self.getFiledir(),
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
 * internal verbose log
 */
ForschungsFensterLogger.prototype.verboseInfo = function(msg) {
  if (this.verboseLog === true) {
    console.log('LOGGER-INFO: '+msg);
  };
};


/**
 * Get the filepath of the logs directory.
 * 
 * @return {String} The Filepath.
 */
ForschungsFensterLogger.prototype.getFiledir = function() {
  return this.dir+'/'+this.latestLog+this.suffix;
};


/**
 * Check if a logs directory exist.
 * If no dir exists, create one.
 *
 * return true if directory exists
 */
ForschungsFensterLogger.prototype.checkDir = function(dirname) {
  if (dirname !== undefined) {
    this.dir = dirname;
  }

  // if directory diesn't exists...
  if (!fs.existsSync(this.dir)) {
    this.verboseInfo('checkDir: create directory "'+this.dir+'"');
    fs.mkdirSync(this.dir);
    return false;
  }
  // if directory exists, do nothing
  else {
    this.verboseInfo('checkDir: "'+this.dir+'"" exists.');
    return true;
  }
};


/**
 * The routes
 */
ForschungsFensterLogger.prototype.routes = function(express, options) {
  var self = this;
  var tmpBaseUrl = options.baseUrl;
  //console.log('baseUrl: ', tmpBaseUrl);

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
    log.info('GET '+tmpBaseUrl);
    
    var tmpLogsDir = process.cwd()+'/'+self.dir;
    //console.log('tmpLogsDir', tmpLogsDir);
    var logsDir = fs.readdirSync(tmpLogsDir);

    var apiModel = new ApiModel(res);

    var tmpData = {
      latest_log: {
        filename: self.latestLogFile,
        url: 'http://'+req.headers.host+tmpBaseUrl+'/file/'+self.latestLogFile
      },
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
    log.info('GET '+tmpBaseUrl+'/'+req.params.file+'/');

    console.log(req.query);
    // TODO: disable data items
    // http...13719.log?name=false&pid=false&level=false&v=false
    
    var tmp = logfile(self.dir, req.params.file);
    res.json(tmp);
  });

  express.get(tmpBaseUrl+'/latest', function(req, res) {
    log.info('GET '+tmpBaseUrl+'/latest');
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
  log.info('GET '+tmpBaseUrl+'/latest');
  console.log('TODO: redirect to logs/filename.log');

  var tmp = logfile(latestLog);
  res.json(tmp);
  return next();
};

/**
 * Module dependencies.
 */
var fs = require('fs');
var ApiModel = require('api-model');

/**
 * Variables
 */
var dir = 'logs';
var latestLog = (new Date().getTime())+'.log';

// create the logger...
exports.initGlobalLogVar = function(Logger, dirname, options) {
  checkDir(dirname);

  GLOBAL.log = new Logger({
    name: options.name,
    streams: [
      {
        stream: process.stdout,
        level: 'debug'
      },
      {
        path: filepath(),
        level: 'debug' // trace for logging all kind of messages.
      }
    ],
    serializers: {
      req: Logger.stdSerializers.req,
      res: Logger.stdSerializers.res
    }
  });
  log.info('Initialize Logger');
};

/**
 * Check if a logs directory exist.
 * If no dir exists, create one.
 */
function checkDir(dirname) {
  if (dirname !== undefined) {
    dir = dirname;
  }
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
};

exports.checkDir = checkDir;

/**
 * Get the log filepath.
 */
function filepath() {
  return dir+'/'+latestLog;
};

exports.filepath = filepath;

/**
 * The routes
 */
exports.routes = function(express) {
  express.get('/logs', list);
  express.get('/logs/latest', latestFile);
  express.get('/logs/:file', file);
};

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
function list(req, res, next) {
  log.info('GET /logs');

  var apiModel = new ApiModel(res);
  var logs = fs.readdirSync(process.cwd()+'/'+dir);
  apiModel.setData({
    latest_log: latestLog,
    logs: logs
  });

  res.json(apiModel.getStore());
  return next();
};

function logfile(filename) {
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
function latestFile(req, res, next) {
  log.info('GET /logs/latest');
  console.log('TODO: redirect to logs/filename.log');

  var tmp = logfile(latestLog);
  res.json(tmp);
  return next();
};

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
function file(req, res, next) {
  log.info('GET /logs/'+req.params.file+'/');
  var tmp = logfile(req.params.file);
  res.json(tmp);
  return next();
};

var assert = require("assert")
var Logger = require('../index');


describe('index.js', function() {

  describe('#filepath()', function() {
    it('should return the logfile directory.', function() {
      var testLogger = new Logger();
      var result = testLogger.getFileDir();

      assert.equal(result, '/logs/');
    });

    it('should create a "tmp-logs/" directory.', function() {
      var tmp = logger.checkDir('tmp-logs');
      assert.equal(tmp, false);
    });
  });

  // describe('#checkDir()', function() {
  //   it('should create a "logs/" directory.', function() {
  //     var tmp = logger.checkDir();
  //     assert.equal(tmp, true);
  //   });

  //   it('should create a "tmp-logs/" directory.', function() {
  //     var tmp = logger.checkDir('tmp-logs');
  //     assert.equal(tmp, false);
  //   });
  // });

});

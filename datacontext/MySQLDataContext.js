'use strict';

var DataContext        = require('./DataContext');
var MySQLEscaper       = require('../query/MySQLEscaper');
var MySQLQueryExecuter = require('../query/MySQLQueryExecuter');

/**
 * A DataContext for MySQL databases.
 * @param database An instance of a Database.
 * @param pool A connection pool as created by mysql.createPool.
 */
function MySQLDataContext(database, pool)
{
  var queryExec = new MySQLQueryExecuter(pool);
  var escaper   = new MySQLEscaper();

  DataContext.call(this, database, escaper, queryExec);
}

// MySQLDataContext extends DataContext.
MySQLDataContext.prototype = Object.create(DataContext.prototype);
MySQLDataContext.prototype.constructor = DataContext;

module.exports = MySQLDataContext;


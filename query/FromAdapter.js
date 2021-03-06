'use strict';

var From   = require('./From');
var Select = require('./Select');
var Delete = require('./Delete');
var Update = require('./Update');

/**
 * This is an adapter for the From class that provides the user with a
 * convenient interface for selecting and deleting.
 * @param database The database to select from.
 * @param escaper An instance of an Escaper matching the database type (i.e.
 *        MySQLEscaper or MSSQLEscaper).
 * @param queryExecuter A QueryExecuter instance that implements the
 *        select method.
 * @param meta Either the name of the table or a meta object describing the table:
 * {
 *   table:  string, // The name of the table to select from.
 *   as:     string  // An alias for the table.  This is needed if, for example,
 *                   // the same table is joined in multiple times.
 *                   // This defaults to the table's alias.
 * }
 */
function FromAdapter(database, escaper, queryExecuter, meta)
{
  From.call(this, database, escaper, queryExecuter, meta);
}

// FromAdapter extends From.
FromAdapter.prototype = Object.create(From.prototype);
FromAdapter.prototype.constructor = From;

/**
 * Select from the table.
 * @param cols See the documentation in Select.  An optional array of columns.
 */
FromAdapter.prototype.select = function(/*cols*/)
{
  var sel = new Select(this, this._queryExecuter);

  // This has to be applied because cols is optional.  If cols is not passed,
  // calling sel.select(cols) would pass undefined to select().
  return sel.select.apply(sel, arguments);
};

/**
 * Delete from the table.
 * @param tableAlias The alias of the table to delete from (optional, and
 *        defaults from table).
 */
FromAdapter.prototype.delete = function(tableAlias)
{
  return new Delete(this, tableAlias);
};

/**
 * Update a table.
 * @param model A data model describing the fields to be updated.  The format
 *        should be:
 *        {
 *          <table-alias1>:
 *          {
 *            <column-alias1>: <column-value>,
 *            <column-aliasN>: <column-value>
 *          },
 *          <table-aliasN>:
 *          {
 *            ...
 *          }
 *        }
 */
FromAdapter.prototype.update = function(model)
{
  return new Update(this, model);
};

module.exports = FromAdapter;


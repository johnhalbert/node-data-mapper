'use strict';

var bikeShopDC = require('../bikeShopDataContext');

// Select all columns from the bike_shops table.
var query = bikeShopDC.from('bike_shops').select();

// This is the query that will be executed.
console.log('Query:');
console.log(query.toString(), '\n');

// Executing a query returns a promise, as defined by the deferred API.
// https://www.npmjs.com/package/deferred
query.execute()
  .then(function(result)
  {
    console.log('Result:');
    console.log(result);
  })
  .catch(function(err)
  {
    console.log(err);
  })
  .finally(function()
  {
    // Close the connection.
    bikeShopDC.getQueryExecuter().getConnectionPool().end();
  });

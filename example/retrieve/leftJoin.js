'use strict';

var bikeShopDC = require('../bikeShopDataContext');

// Find all employees that have not received bonuses.
var query = bikeShopDC
  .from('staff')
  .leftOuterJoin({table: 'bonuses', on: {$eq: {'staff.staffID':'bonuses.staffID'}}})
  .where({$is: {'bonuses.bonusID': null}})
  .select('staff.staffID', 'staff.firstName', 'staff.lastName');

console.log('Query:');
console.log(query.toString(), '\n');

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
    bikeShopDC.getQueryExecuter().getConnectionPool().end();
  });

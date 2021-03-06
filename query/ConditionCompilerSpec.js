describe('ConditionCompiler test suite.', function()
{
  'use strict';

  var MySQLEscaper      = require('./MySQLEscaper');
  var ConditionLexer    = require('./ConditionLexer');
  var ConditionParser   = require('./ConditionParser');
  var ConditionCompiler = require('./ConditionCompiler');
  var lexer             = new ConditionLexer();
  var parser            = new ConditionParser();
  var compiler          = new ConditionCompiler(new MySQLEscaper());

  // Compiles a single condition.
  it('compiles a single condition.', function()
  {
    var cond, tokens, tree;

    // $eq.
    cond   = {$eq: {name: ':name'}};
    tokens = lexer.parse(cond);
    tree   = parser.parse(tokens);
    expect(compiler.compile(tree, {name: 'Joe'})).toBe("`name` = 'Joe'");

    // $neq.
    cond   = {$neq: {name: ':name'}};
    tokens = lexer.parse(cond);
    tree   = parser.parse(tokens);
    expect(compiler.compile(tree, {name: 'Joe'})).toBe("`name` <> 'Joe'");

    // $lt.
    cond   = {$lt: {age: 30}};
    tokens = lexer.parse(cond);
    tree   = parser.parse(tokens);
    expect(compiler.compile(tree)).toBe('`age` < 30');

    // $lte.
    cond   = {$lte: {age: 30}};
    tokens = lexer.parse(cond);
    tree   = parser.parse(tokens);
    expect(compiler.compile(tree)).toBe('`age` <= 30');

    // $gt.
    cond   = {$gt: {age: 30}};
    tokens = lexer.parse(cond);
    tree   = parser.parse(tokens);
    expect(compiler.compile(tree)).toBe('`age` > 30');

    // $gte.
    cond   = {$gte: {age: 30}};
    tokens = lexer.parse(cond);
    tree   = parser.parse(tokens);
    expect(compiler.compile(tree)).toBe('`age` >= 30');

    // $like.
    cond   = {$like: {name: ':name'}};
    tokens = lexer.parse(cond);
    tree   = parser.parse(tokens);
    expect(compiler.compile(tree, {name: 'Joe'})).toBe("`name` LIKE 'Joe'");

    // $notLike.
    cond   = {$notLike: {name: ':name'}};
    tokens = lexer.parse(cond);
    tree   = parser.parse(tokens);
    expect(compiler.compile(tree, {name: 'Joe'})).toBe("`name` NOT LIKE 'Joe'");
  });

  // Checks the value types--column, parameter, and number.
  it('checks the value types--column, parameter, and number.', function()
  {
    var cond, tokens, tree;

    // Parameter.
    cond   = {$eq: {name: ':name'}};
    tokens = lexer.parse(cond);
    tree   = parser.parse(tokens);
    expect(compiler.compile(tree, {name: 'Joe'})).toBe("`name` = 'Joe'");

    // Number.
    cond   = {$eq: {age: 30}};
    tokens = lexer.parse(cond);
    tree   = parser.parse(tokens);
    expect(compiler.compile(tree)).toBe('`age` = 30');

    // Column
    cond   = {$eq: {name: 'u.name'}};
    tokens = lexer.parse(cond);
    tree   = parser.parse(tokens);
    expect(compiler.compile(tree)).toBe('`name` = `u`.`name`');
  });

  // Compiles a single null condition.
  it('compiles a single null condition.', function()
  {
    var cond, params, tokens, tree;

    // $is.
    cond   = {$is: {'j.occupation': null}};
    tokens = lexer.parse(cond);
    tree   = parser.parse(tokens);
    expect(compiler.compile(tree)).toBe('`j`.`occupation` IS NULL');

    // $isnt.
    cond   = {$isnt: {occupation: null}};
    tokens = lexer.parse(cond);
    tree   = parser.parse(tokens);
    expect(compiler.compile(tree)).toBe('`occupation` IS NOT NULL');

    // Using parameters.
    cond   = {$isnt: {occupation: ':occupation'}};
    params = {occupation: null};
    tokens = lexer.parse(cond);
    tree   = parser.parse(tokens, params);
    expect(compiler.compile(tree)).toBe('`occupation` IS NOT NULL');

    cond   = {$isnt: {occupation: ':occupation'}};
    params = {occupation: 'Doctor'}; // Parameter is ignored: NULL is insterted blindly.
    tokens = lexer.parse(cond);
    tree   = parser.parse(tokens, params);
    expect(compiler.compile(tree)).toBe('`occupation` IS NOT NULL');
  });

  // Compiles a single in condition.
  it('compiles a single in condition.', function()
  {
    var cond, tokens, tree;

    // Numbers.
    cond   = {$in: {'p.shoeSize': [10, 10.5, 11]}};
    tokens = lexer.parse(cond);
    tree   = parser.parse(tokens);
    expect(compiler.compile(tree)).toBe('`p`.`shoeSize` IN (10, 10.5, 11)');

    // Parameters.
    cond   = {$in: {employer: [':emp1', ':emp2']}};
    tokens = lexer.parse(cond);
    tree   = parser.parse(tokens);
    expect(compiler.compile(tree, {emp1: 'Nike', emp2: "Billy's Flowers"})).toBe("`employer` IN ('Nike', 'Billy\\'s Flowers')");

    // Columns.
    cond   = {$in: {'u.employer': ['mom.employer', 'dad.employer']}};
    tokens = lexer.parse(cond);
    tree   = parser.parse(tokens);
    expect(compiler.compile(tree)).toBe('`u`.`employer` IN (`mom`.`employer`, `dad`.`employer`)');

    // Single condition.
    cond   = {$in: {shoeSize: [10]}};
    tokens = lexer.parse(cond);
    tree   = parser.parse(tokens);
    expect(compiler.compile(tree)).toBe('`shoeSize` IN (10)');
  });

  // Compiles a single boolean condition.
  it('compiles a single boolean condition.', function()
  {
    var cond, tokens, tree;

    // Single condition AND'd.
    cond   = {$and: [{$eq: {'u.name': 'pn.name'}}]};
    tokens = lexer.parse(cond);
    tree   = parser.parse(tokens);
    expect(compiler.compile(tree)).toBe('(`u`.`name` = `pn`.`name`)');

    // Two conditions AND'd.
    cond   = {$and: [{$eq: {'u.name': ':name'}}, {$gt: {'u.age': 21}}]};
    tokens = lexer.parse(cond);
    tree   = parser.parse(tokens);
    expect(compiler.compile(tree, {name: 'Joe'})).toBe("(`u`.`name` = 'Joe' AND `u`.`age` > 21)");

    // Single condition OR'd.
    cond   = {$or: [{$eq: {name: 'pn.name'}}]};
    tokens = lexer.parse(cond);
    tree   = parser.parse(tokens);
    expect(compiler.compile(tree)).toBe('(`name` = `pn`.`name`)');

    // Two conditions OR'd.
    cond   = {$or: [{$eq: {name: ':name'}}, {$gt: {age: 21}}]};
    tokens = lexer.parse(cond);
    tree   = parser.parse(tokens);
    expect(compiler.compile(tree, {name: 'Joe'})).toBe("(`name` = 'Joe' OR `age` > 21)");
  });

  // Checks an invalid token type (should never fire in real code).
  it('checks an invalid token type (should be impossible).', function()
  {
    var tree = {token: {type: 'BAD'}};
    expect(function()
    {
      compiler.compile(tree);
    }).toThrowError('Unknown type: BAD');
  });

  // Compiles some more complicated conditions.
  it('compiles some more complicated conditions.', function()
  {
    var cond, tokens, tree;

    // (`gender` = 'M' AND (`occupation` IS NULL OR `salary` <= 11000))
    cond =
    {
      $and:
      [
        {$eq: {gender: ':gender'}},
        {
          $or:
          [
            {$is:  {occupation: null}},
            {$lte: {salary: 11000}}
          ]
        }
      ]
    };
    tokens = lexer.parse(cond);
    tree   = parser.parse(tokens);
    expect(compiler.compile(tree, {gender: 'male'}))
      .toBe("(`gender` = 'male' AND (`occupation` IS NULL OR `salary` <= 11000))");

    // ((`gender` = 'M' AND `age` > 23) OR (`gender` = 'F' AND `age` > 21))
    cond =
    {
      $or:
      [
        {$and: [ {$eq: {gender: ':male'}}, {$gt: {age: 23}} ]},
        {$and: [ {$eq: {gender: ':female'}}, {$gt: {age: 21}} ]}
      ]
    };
    tokens = lexer.parse(cond);
    tree   = parser.parse(tokens);
    expect(compiler.compile(tree, {male: 'M', female: 'F'}))
      .toBe("((`gender` = 'M' AND `age` > 23) OR (`gender` = 'F' AND `age` > 21))");
  });

  // Replaces parameters in a condition.
  it('replaces parameters in a condition.', function()
  {
    var cond, tokens, tree;

    cond   = {$eq: {store: ':store'}};
    tokens = lexer.parse(cond);
    tree   = parser.parse(tokens);

    expect(compiler.compile(tree, {store: "Suzy's Floozies"}))
      .toBe("`store` = 'Suzy\\'s Floozies'");
  });

  // Checks that the replacement is required for each parameter.
  it('checks that the replacement is required for each parameter.', function()
  {
    var cond, tokens, tree;

    cond   = {$eq: {gender: ':gender'}};
    tokens = lexer.parse(cond);
    tree   = parser.parse(tokens);

    expect(function()
    {
      compiler.compile(tree);
    }).toThrowError('Replacement value for parameter :gender not present.');
  });

  // Checks that a parameter can be replaced by 0.
  it('checks that a parameter can be replaced by 0.', function() {
    var cond, tokens, tree;

    cond   = {$eq: {isActive: ':isActive'}};
    tokens = lexer.parse(cond);
    tree   = parser.parse(tokens);

    expect(compiler.compile(tree, {isActive: 0})).toBe('`isActive` = 0');
  });

  describe('ConditionCompiler parseColumns test suite', function()
  {
    // Parses the columns from trivial queries.
    it('parses the columns from trivial queries.', function()
    {
      var cond, tokens, tree;

      cond   = {$eq: {name: ':name'}};
      tokens = lexer.parse(cond);
      tree   = parser.parse(tokens);
      expect(compiler.getColumns(tree)).toEqual(['name']);

      cond   = {$lt: {age: 30}};
      tokens = lexer.parse(cond);
      tree   = parser.parse(tokens);
      expect(compiler.getColumns(tree)).toEqual(['age']);

      cond   = {$is: {occupation: null}};
      tokens = lexer.parse(cond);
      tree   = parser.parse(tokens);
      expect(compiler.getColumns(tree)).toEqual(['occupation']);

      cond   = {$in: {'u.shoeSize': [11, 12]}};
      tokens = lexer.parse(cond);
      tree   = parser.parse(tokens);
      expect(compiler.getColumns(tree)).toEqual(['u.shoeSize']);

      cond   = {$eq: {'cousin.name': 'brother.name'}};
      tokens = lexer.parse(cond);
      tree   = parser.parse(tokens);
      expect(compiler.getColumns(tree)).toEqual(['cousin.name', 'brother.name']);
    });

    // Checks that the returned list of columns is distinct.
    it('checks that the returned list of columns is distinct.', function()
    {
      var cond, tokens, tree;
      cond =
      {
        $or:
        [
          {$and: [ {$eq: {'p.gender': ':male'}}, {$gt: {'p.age': 23}} ]},
          {$and: [ {$eq: {'c.gender': 'p.gender'}}, {$gt: {'c.age': 'p.age'}} ]},
          {$and: [ {$eq: {'c.age': 21}}, {$in: {'c.occupation': [':doctor', 'p.occupation']}} ]}
        ]
      };
      tokens = lexer.parse(cond);
      tree   = parser.parse(tokens);

      // The set is distinct.
      expect(compiler.getColumns(tree)).toEqual(
        ['p.gender', 'p.age', 'c.gender', 'c.age', 'c.occupation', 'p.occupation']);
    });
  });
});


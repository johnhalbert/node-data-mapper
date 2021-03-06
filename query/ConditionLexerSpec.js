describe('ConditionLexer test suite.', function()
{
  'use strict';

  var ConditionLexer = require('./ConditionLexer');
  var cl             = new ConditionLexer();

  describe('ConditionLexer parse test suite.', function()
  {
    // Checks that the lexer can take an object or a string.
    it('checks that the lexer can take an object or a string.', function()
    {
      var cond = {$eq: {name: ':name'}};
      expect(cl.parse(cond)).toEqual(cl.parse(JSON.stringify(cond)));
    });
  });

  describe('ConditionLexer terminal test suite.', function()
  {
    var terminals = ['{', '}', '[', ']', ':', ','];

    // Checks the basic terminals.
    it('checks the basic terminals.', function()
    {
      terminals.forEach(function(term)
      {
        expect(cl.parse(term)).toEqual([{terminal: true, type: 'char', value: term}]);
      });
    });

    // Checks terminal combinations.
    it('checks terminal combinations.', function()
    {
      var tokens   = [];
      var sentence = '';
      var randInd;

      // Make a random sentence out of terminals, with expected tokens.
      for (var i = 0; i < 100; ++i)
      {
        randInd   = Math.floor(Math.random() * terminals.length);
        sentence += terminals[randInd];
        tokens.push({terminal: true, type: 'char', value: terminals[randInd]});
      }

      expect(cl.parse(sentence)).toEqual(tokens);
    });
  });

  describe('ConditionLexer string test suite.', function()
  {
    // Checks a basic string.
    it('checks a basic string.', function()
    {
      expect(cl.parse(JSON.stringify('user.name'))).toEqual([{terminal: true, type: 'column', value: 'user.name'}]);
      expect(cl.parse('"user.name"')).toEqual([{terminal: true, type: 'column', value: 'user.name'}]);
      expect(cl.parse('""')).toEqual([{terminal: true, type: 'column', value: ''}]);
      expect(cl.parse('"str1""str2"')).toEqual
      ([
        {terminal: true, type: 'column', value: 'str1'},
        {terminal: true, type: 'column', value: 'str2'}
      ]);
    });

    // Checks a string in a sentence.
    it('checks a string in a sentence.', function()
    {
      expect(cl.parse(JSON.stringify({name: 'user.name'}))).toEqual
      ([
        {terminal: true, type: 'char', value: '{'},
        {terminal: true, type: 'column', value: 'name'},
        {terminal: true, type: 'char', value: ':'},
        {terminal: true, type: 'column', value: 'user.name'},
        {terminal: true, type: 'char', value: '}'}
      ]);
    });

    // Checks a string that ends in an opening quote.
    it('checks a string that ends in an opening quote.', function()
    {
      expect(function()
      {
        cl.parse('"');
      }).toThrowError('Expected character but found EOL.');
      expect(function()
      {
        cl.parse('"name":"');
      }).toThrowError('Expected character but found EOL.');
    });

    // Checks an unterminated string.
    it('checks an unterminated string.', function()
    {
      expect(function()
      {
        cl.parse('"name');
      }).toThrowError('Expected quote but found EOL.');
    });
  });

  describe('ConditionLexer number test suite.', function()
  {
    // Checks a basic number.
    it('checks a basic number.', function()
    {
      expect(cl.parse('1')).toEqual([{terminal: true, type: 'number', value: 1}]);
      expect(cl.parse('10')).toEqual([{terminal: true, type: 'number', value: 10}]);
      expect(cl.parse('1.0')).toEqual([{terminal: true, type: 'number', value: 1}]);
      expect(cl.parse('.5')).toEqual([{terminal: true, type: 'number', value: 0.5}]);
      expect(cl.parse('-4600.532')).toEqual([{terminal: true, type: 'number', value: -4600.532}]);
      expect(cl.parse('0123')).toEqual([{terminal: true, type: 'number', value: 123}]);
      expect(function()
      {
        cl.parse('46-.23');
      }).toThrowError('Expected number but found 46-.23');
    });

    // Checks multiple numbers.
    it('checks multiple numbers.', function()
    {
      expect(cl.parse('1,-10,14.5')).toEqual
      ([
        {terminal: true, type: 'number', value: 1},
        {terminal: true, type: 'char', value: ','},
        {terminal: true, type: 'number', value: -10},
        {terminal: true, type: 'char', value: ','},
        {terminal: true, type: 'number', value: 14.5}
      ]);
    });

    // Checks a number in a sentence.
    it('checks a number in a sentence.', function()
    {
      expect((cl.parse(JSON.stringify({$gt: {age: 60}})))).toEqual
      ([
        {terminal: true, type: 'char', value: '{'},
        {terminal: false, type: 'comparison-operator', value: '$gt'},
        {terminal: true, type: 'char', value: ':'},
        {terminal: true, type: 'char', value: '{'},
        {terminal: true, type: 'column', value: 'age'},
        {terminal: true, type: 'char', value: ':'},
        {terminal: true, type: 'number', value: 60},
        {terminal: true, type: 'char', value: '}'},
        {terminal: true, type: 'char', value: '}'}
      ]);
    });
  });

  describe('ConditionLexer null test suite.', function()
  {
    // Checks the null terminal.
    it('checks the null terminal.', function()
    {
      expect(cl.parse('null')).toEqual([{terminal: true, type: 'null', value: null}]);
      expect(cl.parse('nullnull')).toEqual
      ([
        {terminal: true, type: 'null', value: null},
        {terminal: true, type: 'null', value: null}
      ]);
    });

    // Checks the null terminal in a string.
    it('checks the null terminal in a string.', function()
    {
      expect(cl.parse('{"$is":{"name":null}}')).toEqual
      ([
        {terminal: true,  type: 'char', value: '{'},
        {terminal: false, type: 'null-comparison-operator', value: '$is'},
        {terminal: true,  type: 'char', value: ':'},
        {terminal: true,  type: 'char', value: '{'},
        {terminal: true , type: 'column', value: 'name'},
        {terminal: true,  type: 'char', value: ':'},
        {terminal: true,  type: 'null', value: null},
        {terminal: true,  type: 'char', value: '}'},
        {terminal: true,  type: 'char', value: '}'}
      ]);
    });
  });

  describe('ConditionLexer operator test suite.', function()
  {
    // Checks the basic operators.
    it('checks the basic operators.', function()
    {
      expect(cl.parse('"$and"')).toEqual([{terminal: false, type: 'boolean-operator', value: '$and'}]);
      expect(cl.parse('"$or"')).toEqual([{terminal: false, type: 'boolean-operator', value: '$or'}]);
      expect(cl.parse('"$eq"')).toEqual([{terminal: false, type: 'comparison-operator', value: '$eq'}]);
      expect(cl.parse('"$neq"')).toEqual([{terminal: false, type: 'comparison-operator', value: '$neq'}]);
      expect(cl.parse('"$lt"')).toEqual([{terminal: false, type: 'comparison-operator', value: '$lt'}]);
      expect(cl.parse('"$lte"')).toEqual([{terminal: false, type: 'comparison-operator', value: '$lte'}]);
      expect(cl.parse('"$gt"')).toEqual([{terminal: false, type: 'comparison-operator', value: '$gt'}]);
      expect(cl.parse('"$gte"')).toEqual([{terminal: false, type: 'comparison-operator', value: '$gte'}]);
      expect(cl.parse('"$like"')).toEqual([{terminal: false, type: 'comparison-operator', value: '$like'}]);
      expect(cl.parse('"$notLike"')).toEqual([{terminal: false, type: 'comparison-operator', value: '$notLike'}]);
      expect(cl.parse('"$in"')).toEqual([{terminal: false, type: 'in-comparison-operator', value: '$in'}]);
      expect(cl.parse('"$is"')).toEqual([{terminal: false, type: 'null-comparison-operator', value: '$is'}]);
      expect(cl.parse('"$isnt"')).toEqual([{terminal: false, type: 'null-comparison-operator', value: '$isnt'}]);
    });

    // Checks operators in a sentence.
    it('checks operators in a sentence.', function()
    {
      var cond =
      {
        $and:
        [
          {$eq: {name: ':name'}},
          {$gt: {age: 21}}
        ]
      };

      expect(cl.parse(JSON.stringify(cond))).toEqual
      ([
        {terminal: true,  type: 'char', value: '{'},
        {terminal: false, type: 'boolean-operator', value: '$and'},
        {terminal: true,  type: 'char', value: ':'},
        {terminal: true,  type: 'char', value: '['},
        {terminal: true,  type: 'char', value: '{'},
        {terminal: false, type: 'comparison-operator', value: '$eq'},
        {terminal: true,  type: 'char', value: ':'},
        {terminal: true,  type: 'char', value: '{'},
        {terminal: true,  type: 'column', value: 'name'},
        {terminal: true,  type: 'char', value: ':'},
        {terminal: true,  type: 'parameter', value: ':name'},
        {terminal: true,  type: 'char', value: '}'},
        {terminal: true,  type: 'char', value: '}'},
        {terminal: true,  type: 'char', value: ','},
        {terminal: true,  type: 'char', value: '{'},
        {terminal: false, type: 'comparison-operator', value: '$gt'},
        {terminal: true,  type: 'char', value: ':'},
        {terminal: true,  type: 'char', value: '{'},
        {terminal: true,  type: 'column', value: 'age'},
        {terminal: true,  type: 'char', value: ':'},
        {terminal: true,  type: 'number', value: 21},
        {terminal: true,  type: 'char', value: '}'},
        {terminal: true,  type: 'char', value: '}'},
        {terminal: true,  type: 'char', value: ']'},
        {terminal: true,  type: 'char', value: '}'}
      ]);
    });
  });

  describe('ConditionLexer parameter test suite.', function()
  {
    // Checks a basic terminal.
    it('checks a basic terminal.', function()
    {
      expect(cl.parse(JSON.stringify(':name'))).toEqual([{terminal: true, type: 'parameter', value: ':name'}]);
    });

    // Checks a parameter in a sentence.
    it('checks a parameter in a sentence.', function()
    {
      expect(cl.parse(JSON.stringify({name: ':name'}))).toEqual
      ([
        {terminal: true, type: 'char', value: '{'},
        {terminal: true, type: 'column', value: 'name'},
        {terminal: true, type: 'char', value: ':'},
        {terminal: true, type: 'parameter', value: ':name'},
        {terminal: true, type: 'char', value: '}'}
      ]);
    });
  });

  describe('ConditionLexer bad terminal test suite.', function()
  {
    // Checks that other characters throw an exception.
    it('checks that other characters throw an exception.', function()
    {
      expect(function()
      {
        cl.parse("A");
      }).toThrowError('Unexpected character found A');
    });
  });
});


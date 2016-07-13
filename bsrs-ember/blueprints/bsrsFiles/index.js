/*jshint node:true*/
module.exports = {
  description: '',

  locals: function(options) {
    return {
      CapitalizeModule: allCaps(options.entity.name),
      SnakeModuleName: snake(options.entity.name),
      CapFirstLetterModuleName: firstWhole(options.entity.name),

      randomize: Math.floor(Math.random() * 10),

      FirstCharacterModuleName: first(options.entity.name),

      firstProperty: options.first,
      firstPropertyCamel: camel(options.first),
      firstPropertySnake: snake(options.first),

      secondProperty: options.second,
      secondPropertyCamel: camel(options.second),
      secondPropertyTitle: title(options.second),
      //All properties called by snake name to enfore this. Can't name it foo-bar
      secondPropertySnake: snake(options.second),

      secondModel: options.secondModel,
      secondModelCamel: camel(options.secondModel),
      secondModelTitle: title(options.secondModel),
      secondModelSnake: snake(options.secondModel),
      secondModelPlural: plural(options.secondModel),
      secondModelPluralCaps: allCaps(plural(options.secondModel)),

      secondModelDisplaySnake: options.secondDisplay,
      secondModelDisplayCamel: camel(options.secondDisplay),
      //All properties called by snake name to enfore this. Can't name it foo-bar
      secondModelDisplaySnake: snake(options.secondDisplay),
    };
  }
};

function allCaps(str) {
  return str.toUpperCase();
}

function snake(str) {
  return str.replace('-', '_');
}

var camel = function(str) {
  if (str.includes('_')){
    const indx = str.indexOf('_');
    const character = str.charAt(indx+1);
    const upperCaseLetter = character.toUpperCase();
    const rgx = new RegExp(`_${character}`);
    return str.replace(rgx, upperCaseLetter);
  }
  return str;
};

var title = function(str) {
  if (str.includes('_')){
    const indx = str.indexOf('_');
    const character = str.charAt(indx+1);
    const upperCaseLetter = character.toUpperCase();
    const rgx = new RegExp(`_${character}`);
    const newString = str.replace(rgx, upperCaseLetter);
    return firstWhole(newString);
  }
  return firstWhole(str);
};

function first(str) {
  var first = str.substr(0, 1);
  return first.toUpperCase();
}

function firstWhole(str) {
  var first = str.substr(0, 1);
  var rest = str.substr(1);
  return first.toUpperCase() + rest;
}

function plural(str) {
  switch(str) {
    case 'person':
      return 'people';
  }
}
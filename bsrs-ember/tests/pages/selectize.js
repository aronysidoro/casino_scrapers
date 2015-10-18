import PageObject from '../page-object';

let { visitable, fillable, clickable } = PageObject;

var Selectize = PageObject.build({
  visit: visitable('/'),
  input: fillable('.selectize-input input'),
  remove: clickable('div.item > a.remove:eq(0)'),
  removeSecond: clickable('div.item > a.remove:eq(1)'),
});

export default Selectize;

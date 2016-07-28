var BSRS_ASSIGNMENT_FACTORY = (function() {
  var factory = function(assignment, assignmentfilter, ticket) {
    this.assignment = assignment;
    this.assignmentfilter = assignmentfilter;
    this.ticket = ticket;
  };
  factory.prototype.generate = function(i) {
    var id = i || this.assignment.idOne;
    return {
      id: id,
      description: this.assignment.descriptionOne,
      assignee: {
        id: this.assignment.assigneeOne,
        username: this.assignment.username
      },
      filters: [{
        id: this.assignmentfilter.idOne,
        key: this.assignmentfilter.keyOne,
        context: this.assignmentfilter.contextOne,
        field: this.assignmentfilter.fieldOne,
        criteria: [this.ticket.priorityOneId]
      }]
    };
  };
  factory.prototype.detail = function(id) {
    return this.generate(id);
  };
  factory.prototype.put = function(assignment) {
    var id = assignment && assignment.id || this.assignment.idOne;
    var response = this.generate(id);
    response.assignee = response.assignee.id;
    for(var key in assignment) {
      response[key] = assignment[key];
    }
    return response;
  };
  factory.prototype.list = function() {
    return this._list(0, 20);
  };
  factory.prototype.list_two = function() {
    return this._list(10, 20);
  };
  factory.prototype.list_reverse = function() {
    const page_size = 10;
    var results = [];
    for(var i = page_size; i > 0; i--) {
      results.push(this._generate_item(i));
    }
    return {count: page_size-1, next: null, previous: null, results: results};
  };
  factory.prototype._list = function(start, page_size) {
    var results = [];
    for(var i = start; i < page_size; i++) {
      results.push(this._generate_item(i));
    }
    return {count: page_size-1, next: null, previous: null, results: results};
  };
  factory.prototype._generate_item = function(i) {
    return {
      id: `${this.assignment.idOne.slice(0,-1)}${i}`,
      description: `${this.assignment.descriptionOne}${i}`,
      assignee: {
        id: `${this.assignment.assigneeOne.slice(0,-1)}${i}`,
        username: `${this.assignment.username}${i}`,
      }
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  var objectAssign = require('object-assign');
  var mixin = require('../vendor/mixin');
  var assignment = require('./defaults/assignment');
  objectAssign(BSRS_assignment_FACTORY.prototype, mixin.prototype);
  module.exports = new BSRS_ASSIGNMENT_FACTORY(assignment);
}
else {
  define('bsrs-ember/vendor/assignment_fixtures', ['exports', 'bsrs-ember/vendor/defaults/assignment', 'bsrs-ember/vendor/defaults/assignmentfilter', 'bsrs-ember/vendor/defaults/ticket', 'bsrs-ember/vendor/mixin'],
    function(exports, assignment, assignmentfilter, ticket, mixin) {
      'use strict';
      Object.assign(BSRS_ASSIGNMENT_FACTORY.prototype, mixin.prototype);
      return new BSRS_ASSIGNMENT_FACTORY(assignment, assignmentfilter, ticket);
    }
  );
}
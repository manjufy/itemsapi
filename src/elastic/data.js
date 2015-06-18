'use strict';

var request = require('request');
var winston = require('winston');
var nconf = require('nconf');
var elastic = require('../connections/elastic').getElastic();
var validate = require('validate.js');

(function(module) {

  module.addDocumentValidate = function(data) {
    var constraints = {
      id: {presence: false},
      index: {presence: true},
      body: {presence: true},
      refresh: {presence: false},
      type: {presence: true}
    };
    return validate(data, constraints);
  }

  /**
   * add data to elastic
   * @param {Obj} data document
   */
  module.addDocument = function(data, callback) {

    var v = module.addDocumentValidate(data);
    if (v) {
      return callback(v);
    }

    elastic.index({
      index: data.index,
      type: data.type,
      id: data.id,
      //replication: 'async',
      //refresh: true,
      body: data.body
    }, function (err, res) {
      if (err) {
        return callback(err);
      }
      callback(null, res);
    });
  }

  module.addDocumentsValidate = function(data) {
    var constraints = {
      index: {presence: true},
      body: {presence: true},
      type: {presence: true}
    };
    return validate(data, constraints);
  }

  /**
   * add multiple data to elastic
   * @param {Array} data documents
   * @param {String} index
   * @param {String} type
   */
  module.addDocuments = function(data, callback) {

    var v = module.addDocumentsValidate(data);
    if (v) {
      return callback(v);
    }

    var body = [];
    for (var i = 0 ; i < data.body.length ; ++i) {
      var o = { create: { _id: data.body[i].id } };
      body.push(o);
      body.push(data.body[i]);
    }

    elastic.bulk({
      index: data.index,
      type: data.type,
      refresh: true,
      consistency: "one",
      body: body
    }, function (err, res) {
      if (err) {
        return callback(err);
      }
      callback(null, res);
    });
  }

  /**
   * get item by id
   * @param {Obj} data document
   */
  module.getDocument = function(data, callback) {

    elastic.get({
      index: data.index,
      type: data.type,
      id: data.id
    }, function (err, res) {
      if (err) {
        return callback(err);
      }
      callback(null, res);
    });
  }

  /**
   * delete item by id
   * @param {Obj} data document
   */
  module.deleteDocument = function(data, callback) {
    elastic.delete({
      index: data.index,
      type: data.type,
      id: data.id
    }, function (err, res) {
      if (err) {
        return callback(err);
      }
      callback(null, res);
    });
  }

  /**
   * partial update item by id
   * @param {Obj} data document
   */
  module.updateDocument = function(data, callback) {
    elastic.update({
      index: data.index,
      type: data.type,
      id: data.id,
      //refresh: true,
      body: {doc: data.body}
    }, function (err, res) {
      if (err) {
        return callback(err);
      }
      callback(null, res);
    });
  }

}(exports));
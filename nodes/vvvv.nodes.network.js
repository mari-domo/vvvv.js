// VVVV.js -- Visual Web Client Programming
// (c) 2011 Matthias Zauner
// VVVV.js is freely distributable under the MIT license.
// Additional authors of sub components are mentioned at the specific code locations.

if (typeof define !== 'function') { var define = require(VVVVContext.Root+'/node_modules/amdefine')(module, VVVVContext.getRelativeRequire(require)) }
define(function(require,exports) {

var Node = require('core/vvvv.core.node');
var VVVV = require('core/vvvv.core.defines');
var $ = require('jquery');

/*
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 NODE: HTTP (Network Get)
 Author(s): Matthias Zauner
 Original Node Author(s): VVVV Group
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/

VVVV.Nodes.HTTPGet = function(id, graph) {
  this.constructor(id, "HTTP (Network Get)", graph);

  this.meta = {
    authors: ['Matthias Zauner'],
    original_authors: ['VVVV Group'],
    credits: [],
    compatibility_issues: ['Doesnt handle get variables yet','Doesnt support proxies','No header output pin yet']
  };

  this.auto_evaluate = true;

  var urlIn = this.addInputPin("URL", ["http://localhost"], VVVV.PinTypes.String);
  var nameIn = this.addInputPin("Name", [""], VVVV.PinTypes.String);
  var valueIn = this.addInputPin("Value", [""], VVVV.PinTypes.String);
  var refreshIn = this.addInputPin("Refresh", [0], VVVV.PinTypes.Value);

  var statusOut = this.addOutputPin("Status", [""], VVVV.PinTypes.String);
  var bodyOut = this.addOutputPin("Body", [""], VVVV.PinTypes.String);
  var failOut = this.addOutputPin("Fail", [0], VVVV.PinTypes.Value);
  var successOut = this.addOutputPin("Success", [0], VVVV.PinTypes.Value);

  var body;
  var status;
  var success;
  var fail;

  var requestComplete = false;

  var doResetOutPins = -1;

  this.evaluate = function() {
    var maxSize = this.getMaxInputSliceCount();

    var pinsChanged = (refreshIn.pinIsChanged() && refreshIn.getValue(0)==1);

    if (successOut.getValue(0)==1)
      successOut.setValue(0,0);
    if (failOut.getValue(0)==1)
      failOut.setValue(0, 0);

    if (requestComplete) {
      bodyOut.setValue(0, body);
      statusOut.setValue(0, status);
      successOut.setValue(0, success);
      failOut.setValue(0, fail);
      requestComplete = false;
    }

    if (pinsChanged) {
      var i = 0;
      if (urlIn.getValue(i)==undefined) {
        bodyOut.setValue(0, '');
        statusOut.setValue(0, '');
        return;
      }
      $.ajax({
        url: urlIn.getValue(i),
        type: 'get',
        dataType: 'text',
        success: function(response, status, xhr) {
          body = response;
          status = xhr.status;
          success = 1;
          requestComplete = true;
        },
        error: function(xhr, status) {
          body = '';
          fail = 1;
          status = xhr.status;
          requestComplete = true;
        }
      });
    }
  }

}
VVVV.Nodes.HTTPGet.prototype = new Node();

/*
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 NODE: HTTP (Network Post)
 Author(s): Matthias Zauner
 Original Node Author(s): VVVV Group
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/

VVVV.Nodes.HTTPPost = function(id, graph) {
  this.constructor(id, "HTTP (Network Post)", graph);

  this.meta = {
    authors: ['Matthias Zauner'],
    original_authors: ['VVVV Group'],
    credits: [],
    compatibility_issues: ['Doesnt support proxies','No header output pin yet']
  };

  this.auto_evaluate = true;

  var urlIn = this.addInputPin("URL", ["http://localhost"], VVVV.PinTypes.String);
  var nameIn = this.addInputPin("Name", [""], VVVV.PinTypes.String);
  var valueIn = this.addInputPin("Value", [""], VVVV.PinTypes.String);
  var fileNameIn = this.addInputPin("File Name", [""], VVVV.PinTypes.String);
  var fileIn = this.addInputPin("File", ["No File"], VVVV.PinTypes.Node);
  var refreshIn = this.addInputPin("Refresh", [0], VVVV.PinTypes.Value);

  var statusOut = this.addOutputPin("Status", [""], VVVV.PinTypes.String);
  var bodyOut = this.addOutputPin("Body", [""], VVVV.PinTypes.String);
  var progressOut = this.addOutputPin("Progress", [0], VVVV.PinTypes.Value);
  var failOut = this.addOutputPin("Fail", [0], VVVV.PinTypes.Value);
  var successOut = this.addOutputPin("Success", [0], VVVV.PinTypes.Value);

  var body;
  var status;
  var success;
  var fail;

  var requestComplete = false;

  var doResetOutPins = -1;

  this.evaluate = function() {
    var maxSize = this.getMaxInputSliceCount();

    var pinsChanged = (refreshIn.pinIsChanged() && refreshIn.getValue(0)==1);

    if (successOut.getValue(0)==1)
      successOut.setValue(0,0);
    if (failOut.getValue(0)==1)
      failOut.setValue(0, 0);

    if (requestComplete) {
      bodyOut.setValue(0, body);
      statusOut.setValue(0, status);
      successOut.setValue(0, success);
      failOut.setValue(0, fail);
      requestComplete = false;
    }

    if (pinsChanged) {
      var i = 0;
      if (urlIn.getValue(i)==undefined) {
        bodyOut.setValue(0, '');
        statusOut.setValue(0, '');
        return;
      }
      var formData = new FormData();
      var paramsCount = Math.max(nameIn.getSliceCount(), valueIn.getSliceCount());
      for (var i=0; i<paramsCount; i++) {
        formData.append(nameIn.getValue(i), valueIn.getValue(i));
      }
      paramsCount = Math.max(fileNameIn.getSliceCount(), fileIn.getSliceCount());
      for (var i=0; i<paramsCount; i++) {
        formData.append(fileNameIn.getValue(i), fileIn.getValue(i));
      }
      var xhr = new XMLHttpRequest();
      xhr.open("POST", urlIn.getValue(0));

      xhr.onload = function(e) {
        if (xhr.status==200) {
          body = xhr.responseText;
          status = xhr.status;
          success = 1;
          requestComplete = true;
        }
        else {
          body = xhr.responseText;
          status = xhr.status;
          fail = 1
          requestComplete = true;
        }
      }

      xhr.upload.addEventListener("progress", function(e) {
        progressOut.setValue(0, e.loaded / e.total);
      });

      xhr.onerror = function(e) {
        body = '';
        status = xhr.status;
        fail = 1;
        requestComplete = true;
      }

      xhr.send(formData);
    }
  }

}
VVVV.Nodes.HTTPPost.prototype = new Node();



VVVV.Nodes.WebsocketClient = function(id, graph) {
  this.constructor(id, "Websocket (Network Client)", graph);

  this.meta = {
    authors: ['Matthias Zauner'],
    original_authors: [],
    credits: [],
    compatibility_issues: []
  };

  this.auto_evaluate = true;

  var hostIn = this.addInputPin("URL", ["localhost"], VVVV.PinTypes.String);
  var portIn = this.addInputPin("Port", [8006], VVVV.PinTypes.Value);
  var inputIn = this.addInputPin("Input", ["Hello"], VVVV.PinTypes.String);
  var doSendIn = this.addInputPin("DoSend", [0], VVVV.PinTypes.Value);
  var enabledIn = this.addInputPin("Enabled", [0], VVVV.PinTypes.Value);

  var outputOut = this.addOutputPin("Output", [""], VVVV.PinTypes.String);
  var onDataOut = this.addOutputPin("OnData", [0], VVVV.PinTypes.Value);
  var connectedOut = this.addOutputPin("Connected", [0], VVVV.PinTypes.Value);

  var ws = null;
  var queue = [];

  this.evaluate = function() {

    if ((enabledIn.getValue(0)<0.5 || hostIn.pinIsChanged() || portIn.pinIsChanged()) && ws!=null) {
      ws.close();
      ws = null;
    }

    if (enabledIn.getValue(0)>=0.5 && ws == null) {
      ws = new WebSocket("ws://"+hostIn.getValue(0)+":"+portIn.getValue(0));
      ws.onopen = function(e) {
        connectedOut.setValue(0, 1);
      }
      ws.onclose = function(e) {
        connectedOut.setValue(0, 0);
      }
      ws.onmessage = function(e) {
        queue.push(e.data);
      }
    }

    if (queue.length>0) {
      outputOut.setValue(0, queue.shift());
      onDataOut.setValue(0, 1);
    }
    else {
      outputOut.setValue(0, "");
      onDataOut.setValue(0, 0);
    }

    if (doSendIn.getValue(0)>=0.5 && ws) {
      ws.send(inputIn.getValue(0));
    }

  }

}
VVVV.Nodes.WebsocketClient.prototype = new Node();

});

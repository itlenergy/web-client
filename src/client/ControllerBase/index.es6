
import Ractive from 'ractive';
import $ from 'jquery';
import Promise from 'bluebird';

import baseTemplate from './template.html';


export default class ControllerBase {
  constructor() {
    this.requestQueue = [];
    this.onHandlers = this.getHandlers(/^on_(.*)$/);
    this.changeHandlers = this.getHandlers(/^(.*?)(_change)$/);
    
    (['get', 'post', 'put', 'delete', 'options'])
      .forEach((function (method) {
        this[method] = this.tryRequest.bind(this, method);
      }).bind(this));
  }
  
  
  render(template, data) {
    this.ractive = new Ractive({
      el: '#content',
      template: baseTemplate,
      partials: {content: template},
      data: data
    });
    
    this.ractive.on(this.onHandlers)
    this.ractive.observe(this.changeHandlers);
    
    // ease debugging
    window.controller = this;
    window.ractive = this.ractive;
  }
  
  
  getHandlers(regex) {
    let match = null;
    let result = {};
    
    for (let k in this) {
      if (match = k.match(regex)) {
        result[match[1].replace(/_/g, '.')] = this[k].bind(this);
      }
    }
    
    return result;
  }
  
  
  _request(method, url, data, options) {
    // build the request
    let request = {
      url: ControllerBase.apiUrl + url,
      type: method,
      contentType: 'application/json',
      data: JSON.stringify(data)
    };
    
    if (options)
      request = $.extend(request, options);
    
    return request;
  }
  
  _runRequest(request, resolve, reject) {
    if (ControllerBase.ticket) 
      request.url = request.url + '?sgauth=' + ControllerBase.ticket;
    
    $.ajax(request)
      .done(function (data) {
        resolve(data);
      })
      .fail(function (jqXHR) {
        reject(jqXHR);
      });
  }
  
  
  request(method, url, data, options) {
    let _this = this;
    let request = this._request(method, url, data, options);
    
    return new Promise(function (resolve, reject) {
      _this._runRequest(request, resolve, reject);
    });
  }
  
  
  tryRequest(method, url, data, options) {
    let _this = this;
    let request = this._request(method, url, data, options);
    let resolve = null;
    let reject = null;
    
    function _tryRequest() {
      _this._runRequest(request, resolve, function (jqXHR) {
        if (jqXHR.status == 401 || jqXHR.status == 403) {
          _this.showDialog('loginDialog');
          _this.resumeRequest = _tryRequest;
        } else {
          reject(jqXHR);
        }
      });
    }
    
    return new Promise(function () {
      resolve = arguments[0];
      reject = arguments[1];
      _tryRequest();
    });
  }
  
  
  showDialog(id) {
    $('#' + id).modal('show');
  }
  
  
  hideDialog(id) {
    $('#' + id).modal('hide');
  }
  
  
  async on_loginDialog_submit() {
    let login = {
      username: this.ractive.get('loginDialog.username'),
      password: this.ractive.get('loginDialog.password')
    };
    
    try {
      let response = await this.request('post', '/auth/login', login);
      ControllerBase.ticket = response.ticket;
      this.hideDialog('loginDialog');
      
      if (this.resumeRequest) {
        this.resumeRequest();
        this.resumeRequest = null;
      }
    } catch (jqXHR) {
      
      if (jqXHR.status == 401 || jqXHR.status == 403) {
        this.ractive.set('loginDialog.error', 'wrong username or password');
      } else {
        this.showDialog('errorDialog');
      }
    }
  }
}

ControllerBase.apiUrl = null;
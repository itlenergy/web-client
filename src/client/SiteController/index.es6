
import RactiveValidator from 'ractive-validator';

import RouterContext from '../RouterContext';
import ControllerBase from '../ControllerBase';


export default class SiteController extends ControllerBase {
  constructor(router) {
    new RouterContext(router, this)
      .on('/sites', this.list)
      .on('/sites/:id/edit', this.edit)
      .on('/sites/create', this.create);
    
    super();
  }
  
  setupValidator() {
    this.validator = new RactiveValidator('site', this.ractive, {
      'siteName': {required: true},
      'altitude': {required: true, type: 'decimal'},
      'latitude': {required: true, type: 'decimal'},
      'longitude': {required: true, type: 'decimal'}
    });
  }
  
  async list() {
    let sites = (await this.get('/sites')).items;
    this.render(require('./list'), {sites});
  }
  
  async edit(id) {
    let site = await this.get('/sites/' + id);
    this.render(require('./edit'), {site});
    this.setupValidator();    
  }
  
  create() {
    let site = {name: '', altitude: '', latitude: '', longitude: ''};
    this.render(require('./create'), {site});
    this.setupValidator();
  }
  
  
  async on_createSite_save() {
    let validation = this.validator.validate();
    
    if (validation.valid) {
      let site = validation.data;
      
      await this.post('/sites', site);
      this.on_list_show();
    }
  }
  
  
  on_list_show() {
    window.location = '#/sites';
  }
  
  
  on_editSite_show(event, id) {
    window.location = '#/sites/' + id + '/edit';
  }
  
  
  async on_editSite_save(event, id) {
    let validation = this.validator.validate();
    
    if (validation.valid) {
      let site = validation.data;
      site.siteId = id;
      
      await this.put('/sites', site);
      this.on_list_show();
    }
  }
  
  
  on_deleteSite_show() {
    this.showDialog('deleteSiteDialog');
  }
  
  
  async on_deleteSite_save(event, id) {
    this.hideDialog('deleteSiteDialog');
    await this.delete('/sites/' + id);
    this.on_list_show();
  }
}
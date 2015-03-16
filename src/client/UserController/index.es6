
import RactiveValidator from 'ractive-validator';

import RouterContext from '../RouterContext';
import ControllerBase from '../ControllerBase';


export default class UserController extends ControllerBase {
  constructor(router) {
    new RouterContext(router, this)
      .on('/users', this.list)
      .on('/users/:id/edit', this.edit)
      .on('/users/:id/password', this.changePassword)
      .on('/users/create', this.create);
    
    super();
  }
  
  async list() {
    let users = (await this.get('/users')).items;
    this.render(require('./list'), {users});
  }
  
  async edit(id) {
    let user = await this.get('/users/' + id);
    this.render(require('./edit'), {user});
    
    this.validator = new RactiveValidator('user', this.ractive, {
      'username': {required: true},
      'role': {required: true},
      'relatedId': {required: false, type: 'integer'}
    });
  }
  
  async changePassword(id) {
    let user = await this.get('/users/' + id);
    this.render(require('./changePassword'), {user});
    
    this.validator = new RactiveValidator('user', this.ractive, {
      'password': {required: true},
      'confirmPassword': {required: true, password: 'user.password'}
    });
  }
  
  create() {
    let user = {username: '', role: '', relatedId: '', password: '', confirmPassword: ''};
    this.render(require('./create'), {user});
    
    this.validator = new RactiveValidator('user', this.ractive, {
      'username': {required: true},
      'role': {required: true},
      'relatedId': {required: false, type: 'integer'},
      'password': {required: true},
      'confirmPassword': {required: true, password: 'user.password'}
    });
  }
  
  
  async on_createUser_save() {
    let validation = this.validator.validate();
    
    if (validation.valid) {
      let user = validation.data;
      delete user.confirmPassword;
      
      await this.post('/users', user);
      this.on_list_show();
    }
  }
  
  
  on_list_show() {
    window.location = '#/users';
  }
  
  
  on_editUser_show(event, id) {
    window.location = '#/users/' + id + '/edit';
  }
  
  
  async on_editUser_save(event, id) {
    let validation = this.validator.validate();
    
    if (validation.valid) {
      let user = validation.data;
      user.userId = id;
      
      await this.put('/users', user);
      this.on_list_show();
    }
  }
  
  
  on_deleteUser_show() {
    this.showDialog('deleteUserDialog');
  }
  
  
  async on_deleteUser_save(event, id) {
    this.hideDialog('deleteUserDialog');
    await this.delete('/users/' + id);
    this.on_list_show();
  }
  
  
  async on_changePassword_save(event, id) {
    let validation = this.validator.validate();
    
    if (validation.valid) {
      let data = {
        password: validation.data.password
      };
      
      await this.post(`/users/${id}/password`, data);
      this.on_editUser_show(null, id);
    }
  }
}
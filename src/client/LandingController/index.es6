import RouterContext from '../RouterContext';
import ControllerBase from '../ControllerBase';


export default class LandingController extends ControllerBase {
  constructor(router) {
    new RouterContext(router, this)
      .on('/', this.landing);
    
    super();
  }
  
  landing() {
    this.render(require('./landing', {}));
  }
  
  async on_landingLogin() {
    let login = {
      username: this.ractive.get('loginDialog.username'),
      password: this.ractive.get('loginDialog.password')
    };
    
    try {
      let response = await this.request('post', '/auth/login', login);
      ControllerBase.ticket = response.ticket;
      this.hideDialog('loginDialog');
      
      window.location = '#/graphs';
    } catch (jqXHR) {
      if (jqXHR.status == 401 || jqXHR.status == 403) {
        this.ractive.set('loginDialog.error', 'wrong username or password');
      } else {
        this.showDialog('errorDialog');
      }
    }
  }
}
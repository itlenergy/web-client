import RouterContext from '../RouterContext';
import ControllerBase from '../ControllerBase';
import $ from 'jquery';
import d3 from 'd3';
import cubism from 'cubism';
import moment from 'moment';


export default class SiteController extends ControllerBase {
  constructor(router) {
    new RouterContext(router, this)
      .on('/graphs', this.selectData);
    
    super();
  }
  
  async selectData() {
    let sites = (await this.get('/sites')).items;
    this.render(require('./selectData'), {selection: {sites}, sensors: []});
  }
  
  async on_selectSite(event, id) {
    let houses = (await this.get(`/sites/${id}/houses`)).items;
    this.ractive.set('selection.houses', houses);
    this.ractive.set('selection.site', id);
    this.ractive.set('selection.house', null);
    this.ractive.set('selection.hub', null);
    $('html, body').animate({scrollTop: $('#houseColumn').offset().top});
  }
  
  async on_selectHouse(event, id) {
    let hubs = (await this.get(`/houses/${id}/hubs`)).items;
    this.ractive.set('selection.hubs', hubs);
    this.ractive.set('selection.house', id);
    this.ractive.set('selection.hub', null);
    $('html, body').animate({scrollTop: $('#hubColumn').offset().top});
  }
  
  async on_selectHub(event, id) {
    let sensors = (await this.get(`/hubs/${id}/sensors`)).items;
    this.ractive.set('selection.sensors', sensors);
    this.ractive.set('selection.hub', id);
    $('html, body').animate({scrollTop: $('#sensorColumn').offset().top});
  }
  
  on_selectSensor(event, id) {
    let selection = this.ractive.get('selection');
    let site = selection.sites.filter((x) => x.siteId == selection.site)[0];
    let sensor = selection.sensors.filter((x) => x.sensorId == id)[0];
    let description = `${site.siteName} / ${selection.house} / ${selection.hub} / ${sensor.description}`;
    this.ractive.get('sensors').push({description, id: sensor.sensorId});
    this.ractive.set('selection.site', null);
    this.ractive.set('selection.house', null);
    this.ractive.set('selection.hub', null);
    $('html, body').animate({scrollTop: $('#chosenColumn').offset().top});
  }
  
  async on_showGraphs() {
    await this.ractive.set('graph', true);
    let _this = this;
    let sensors = this.ractive.get('sensors');
    let context = cubism.context()
      .serverDelay(0)
      .step(300000)
      .size(1100);
    
    d3.select('#graph').call(function (div) {      
      div.selectAll('.horizon')
        .data(sensors.map((x) => context.metric(_this.createMetric(x.id), x.description)))
        .enter().append('div')
          .attr('class', 'horizon')
          .call(context.horizon().height(100)
            .format(d3.format('.2f')));
    });
  }
  
  createMetric(id) {
    let _this = this;
    
    return async function (start, stop, step, callback) {
      try {
        let startStr = moment(start).format('YYYY-MM-DD HH:mm:ss');
        let stopStr = moment(stop).format('YYYY-MM-DD HH:mm:ss');
        let result = await _this.get(`/sensors/${id}/measurements/${startStr}/${stopStr}`);
//        let values = [];
//        
//        console.log('metric: ' + startStr + ' | ' + stopStr + ' | ' + step);
//        
//        for (let i = 0, currentTime = step; i < result.items.length && currentTime < stop; i++) {
//          if (moment(result.items[i].observationTime, 'YYYY-MM-DD HH:mm:ss', true).toDate()
//              >= currentTime) {
//            values.push(result.items[i].observation);
//            currentTime += step;
//          }
//        }

        callback(null, result.items.map((x) => x.observation));
      } catch(e) {
        callback(e); 
      }
    };
  }
  
  on_goFullScreen() {
    let el = document.getElementsByClassName('fullscreen-container')[0];
    if (el.requestFullScreen) el.requestFullScreen();
    else if (el.msRequestFullScreen) el.msRequestFullScreen();
    else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
    else if (el.webkitRequestFullScreen) el.webkitRequestFullScreen();
  }
}
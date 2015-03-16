
export default class RouterContext {
  constructor(router, context) {
    this.router = router;
    this.context = context;
  }
  
  on(route, handler) {
    this.router.route('on', route, handler.bind(this.context));
    return this;
  }
}
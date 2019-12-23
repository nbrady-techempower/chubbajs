class RouteContext {
  constructor(req, res, next) {
    this.req = req;
    this.res = res;
    this.next = next;

    // This is reset after every controller
    this.controllerErrors = false;

    this.data = {
      messages: [],
      hasErrors: false
    };
  }

  addError(msgs) {
    this.controllerErrors = true;
    this.data.hasErrors = true;
    if (!Array.isArray(msgs)) msgs = [msgs];
    msgs.forEach(msg => {
      this.data.messages.push({ msg, type: "error" });
    });
  }

  addSuccess(msgs) {
    if (!Array.isArray(msgs)) msgs = [msgs];
    msgs.forEach(msg => {
      this.data.messages.push({ msg, type: "success" });
    });
  }

  get isLoggedIn() {
    // TODO: implement
  }
}

export default RouteContext;

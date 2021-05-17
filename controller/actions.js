const curryingActionControllers = (key) => {
  return async function (ctx, payload) {
    if(this.config.debugger) {
      console.log(`[DS action] ${key}`, ctx, payload, this.config);
    }
    await this.config.actions[key](ctx, payload, this.config);
  }
}

export default curryingActionControllers;

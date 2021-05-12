const curryingActionControllers = (key) => {
  return async function (ctx) {
    if(this.config.debugger) {
      console.log(`[DS action] ${key}`, ctx, this.config);
    }
    await this.config.actions[key](ctx, this.config);
  }
}

export default curryingActionControllers;

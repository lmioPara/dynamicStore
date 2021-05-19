const curryingGettersControllers = (key) => {
  return function (state, getters, rootState) {
    if (this.config.debugger) {
      console.log(`[DS getters] ${key}`);
    }
    return state[key];
  };
}

export default curryingGettersControllers;

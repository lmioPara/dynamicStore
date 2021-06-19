const controllers = {
  get: {
    fn: (state, key, getters, rootState, config) => {
      return state[key];
    }
  },
  root: {
    fn: (state, key, getters, rootState, config) => {
      return rootState[key];
    }
  }
}


const curryingGettersControllers = (key, action = 'get') => {
  return function (state, getters, rootState) {
    if (this.config.debugger) {
      console.log(`[DS getters] ${key}`);
    }
    return controllers[action].fn(state, key, getters, rootState, this.config);
  }
}

export default curryingGettersControllers;

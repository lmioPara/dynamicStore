const controllers = {
  set: {
    keys: ['action', 'value'],
    fn: (state, key, payload, config) => {
      state[key] = payload;
      if (key.indexOf(config.treeDelimiter) > 0) {
        let keysArr = key.split(config.treeDelimiter);
        keysArr.reduce((total, currentValue, currentIndex, arr) => {
          if (currentIndex === arr.length - 1) {
            total[currentValue] = payload;
          }
          return total[currentValue];
        }, state);
      }
    }
  },
  snap: {
    keys: ['action', 'value', 'delay'],
    fn: (state, key, payload, config) => {
      let cacheState = state[key];
      state[key] = payload;
      setTimeout(() => {
        state[key] = cacheState;
      }, config.snapShot);
    }
  },
  batchSet: {}
}

const curryingMutationControllers = (key, action = 'set') => {
  return function (state, payload) {
    if(this.config.debugger) {
      console.log(`[DS mutation] ${key} ${action}`, state, this.config);
    }
    controllers[action].fn(state, key, payload, this.config);
  }
}

export default curryingMutationControllers;

const controllers = {
  set: {
    fn: (state, key, payload, config) => {
      state[key] = payload;
      // 判断是否开启连锁转换
      if (config.chainConversion) {
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
    }
  },
  snap: {
    fn: (state, key, payload, config) => {
      let cacheState = state[key];
      state[key] = payload;
      setTimeout(() => {
        state[key] = cacheState;
      }, config.snapShot);
    }
  },
  persistence: {
    fn: (state, key, payload, config) => {
      controllers.set.fn(state, key, payload, config);
      console.log('[DS persistence] 持久化数据');
      // 是否开启持久化
      if (config.persistence) {
        let storageKey = `${config.persistenceStoragePrefix}${key}`;
        switch (config.persistenceStorage) {
          case "localStorage":
            localStorage.setItem(storageKey, JSON.stringify(payload));
            break;
          case "sessionStorage":
            sessionStorage.setItem(storageKey, JSON.stringify(payload))
            break;
          default:
            console.warn(`[DS persistence error] 未设置持久化类型`);
        }
      }
    }
  }
}

const curryingMutationControllers = (key, action = 'set') => {
  return function (state, payload) {
    if (this.config.debugger) {
      console.log(`[DS mutation] ${key} ${action}`, state, payload, this.config);
    }
    controllers[action].fn(state, key, payload, this.config);
  }
}

export default curryingMutationControllers;

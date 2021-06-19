/**
 * 动态生成mutation与getter的策略
 */

// import ExternalObject from "./external/ExternalObject";

import config from './config';
import curryingMutationControllers from "./controller/mutations";
import curryingActionControllers from "./controller/actions";
import curryingGettersControllers from "./controller/getters";

import decorator from './decorator';

class DynamicStore {
  // 静态属性
  static DSDecorator = (target, name, descriptor, decorator) => {
    console.log('[DS decorator]', target, name, descriptor, decorator);
    return target;
  };
  constructor(state, options) {
    this.state = state;
    this.config = {...config, ...options};

    if(this.config.dynamicUrl) {
      let url = new URL(window.location.href);
      console.log(url);
    }

    this.state = this.conversion(this.state);
  }

  conversion(state, perFix = '') {
    let stateKeys = Object.keys(state);
    let localState = {};
    stateKeys.map(key => {
      // 开启链式转换并且key中出现关键字
      if (this.config.chainConversion && key.indexOf(this.config.treeDelimiter) >= 0) {
        throw new Error(`state中不能使用 [${this.config.treeDelimiter}] 连接符  问题key: [${key}] 前缀: [${perFix}]`);
      }
      // 组合dsKey
      let dyKey = `${perFix}${key}`;

      // 获取当前值
      let thisObj;

        // 如果开启了store持久化
      if(this.config.persistence) {
        thisObj = this.initStorageValue(dyKey, state[key]);
      } else {
        thisObj = JSON.parse(JSON.stringify(state[key]));
      }

      if (Object.prototype.toString.call(thisObj) === '[object Object]') {
        localState[dyKey] = thisObj;
        // 是否开启连锁转换
        if (this.config.chainConversion) {
          let tempValue = this.conversion(thisObj, `${dyKey}${this.config.treeDelimiter}`);
          Object.assign(localState, tempValue);
        }
      } else if (Object.prototype.toString.call(thisObj) === '[object Array]' && this.config.arrayConversion) {
        localState[dyKey] = thisObj;
        if (this.config.chainConversion) {
          let tempValue = this.conversion(thisObj, `${dyKey}${this.config.treeDelimiter}`);
          Object.assign(localState, tempValue);
        }
      } else {
        localState[dyKey] = thisObj;
      }
    })
    return localState;
  }

  getMutations() {
    let mutations = {};
    Object.keys(this.state).map(dk => {
      // 默认控制器为set控制器
      mutations[dk] = curryingMutationControllers(dk).bind(this);
      this.config.mutationController.map(controller => {
        // 排除默认控制器
        if (controller === 'set') {
          return;
        }
        mutations[`${dk}${this.config.controllerDecorator}${controller}`] = curryingMutationControllers(dk, controller).bind(this);
      })
    })
    return mutations;
  }

  getGetters() {
    let getters = {};
    Object.keys(this.state).map(dk => {
      getters[dk] = curryingGettersControllers(dk).bind(this);
      this.config.getterController.map(controller => {
        // 排除默认控制器
        if (controller === 'get') {
          return;
        }
        getters[`${dk}${this.config.controllerDecorator}${controller}`] = curryingGettersControllers(dk, controller).bind(this);
      })
    })
    return getters;
  }

  getState() {
    return this.state;
  }

  getActions() {
    if (this.config.actions) {
      let actions = {};
      Object.keys(this.config.actions).map(action => {
        actions[action] = curryingActionControllers(action).bind(this);
      })
      return actions;
    } else {
      return {};
    }
  }

  initStorageValue(key, defVal) {
    if (this.config.persistence) {
      let storageKey = `${this.config.persistenceStoragePrefix}${key}`;
      let result;
      switch (this.config.persistenceStorage) {
        case "localStorage":
          result = localStorage.getItem(storageKey);
          break;
        case "sessionStorage":
          result = sessionStorage.getItem(storageKey);
          break;
        default:
          throw new Error(`[DS persistence error] 未设置持久化类型`)
      }
      if(result) {
        return JSON.parse(result);
      } else {
        return defVal;
      }
    }
  }

  exportModule() {
    let state = this.getState();
    let actions = this.getActions();
    let getters = this.getGetters();
    let mutations = this.getMutations();

    return {
      namespaced: true,
      state,
      actions,
      getters,
      mutations
    }
  }
}

export default DynamicStore;

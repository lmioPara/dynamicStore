/**
 * 动态生成mutation与getter的策略
 */

import ExternalObject from "./external/ExternalObject";


import config from './config';
import curryingMutationControllers from "./controller/mutations";
import curryingActionControllers from "./controller/actions";

class DynamicStore {
  constructor(state, options) {
    this.state = state;
    this.config = {...config, ...options};
    this.state = this.conversion(this.state);
  }

  conversion(state, perFix = '') {
    let stateKeys = Object.keys(state);
    let localState = {};
    stateKeys.map(key => {
      if (key.indexOf(this.config.treeDelimiter) >= 0) {
        throw new Error(`state中不能使用 [${this.config.treeDelimiter}] 连接符  问题key: [${key}] 前缀: [${perFix}]`);
      }
      let thisObj = JSON.parse(JSON.stringify(state[key]));
      let dyKey = `${perFix}${key}`;
      if (Object.prototype.toString.call(thisObj) === '[object Object]') {
        localState[dyKey] = thisObj;
        let tempValue = this.conversion(thisObj, `${dyKey}${this.config.treeDelimiter}`);
        Object.assign(localState, tempValue);
      } else if (Object.prototype.toString.call(thisObj) === '[object Array]' && this.config.arrayConversion) {
        localState[dyKey] = thisObj;
        let tempValue = this.conversion(thisObj, `${dyKey}${this.config.treeDelimiter}`);
        Object.assign(localState, tempValue);
      } else {
        localState[dyKey] = thisObj;
      }
    })
    return localState;
  }

  getMutations() {
    let dyKeys = this.state;
    let mutations = {};
    let keyMaps = Object.keys(dyKeys);
    keyMaps.map(dk => {
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
    let dyKeys = this.state;
    let getters = {};
    let keyMaps = Object.keys(dyKeys);
    let config = this.config;
    keyMaps.map(dk => {
      getters[dk] = function (state, getters, rootState) {
        if (config.debugger) {
          console.log(`[DS getters] ${dk}`);
        }
        return state[dk];
      };
    })
    return getters;
  }

  getState() {
    return this.state;
  }

  getActions() {
    if (this.config.actions) {
      let baseActions = this.config.actions;
      let actions = {};
      Object.keys(baseActions).map(action => {
        actions[action] = curryingActionControllers(action).bind(this);
      })
      return actions;
    } else {
      return {};
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

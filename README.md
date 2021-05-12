# dynamicStore
> 根据state的结构自动化生成getters mutations

使用方法

```javascript
import DynamicStore from 'dynamicStore';
import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);

const state = {
  userName: '',
  userInfo: {
    email: 'ex@a.com'
  },
  userLIst: [
    {
      userId: 1
    },
    {
      userId: 2
    }
  ],
}

const actions = {
  changeUsername: async (ctx) => {
    // 自动生成的mutation名称均为state键名
    ctx.commit('userName', ctx.payload);
  },
  changeUserEmail: async (ctx) => {
    // 多层结构的state使用 $ 连接符连接state键名 连接符可由配置修改
    ctx.commit('userInfo$email', ctx.payload);
  },
  changeUserId: async (ctx) => {
    // 如果需要ds转换数组 需要开启 arrayConversion 配置
    // 开启数组转换之后数组索引需要当成键值使用
    ctx.commit('userLIst$0$userId', ctx.payload);
  }
}


// 需要提前执行 先于state初始化
// 如果需要ds转换数组 需要开启 arrayConversion 配置
const projectDs = new DynamicStore(state, {actions, arrayConversion: true});

// 目前只支持模块化的方式使用 生成模块时默认会开启 `namespaced : true` 强制使用模块命名空间
const module = projectDs.exportModule();

export default new Vuex.Store({
  modules: {
    module
  }
});


// getter使用

import {mapGetter} from 'vuex';

computed: {
  // 必须使用模块名
  // getter与mutation一样同样使用state键名
  // 多层结构的state使用 $ 连接符连接state键名 连接符可由配置修改
  ...mapGetter('module', ['userName', 'userName$email', 'userLIst$0$userId'])
}

```

export default {
  treeDelimiter: '$',
  setDeep: true,
  debugger: false,
  arrayConversion: false,
  chainConversion: false,
  userExternalObject: false,
  mutationController: ['set'],
  controllerDecorator: '@',
  snapShot: 3000,
  persistence: false,
  persistenceStorage: 'localStorage', // 枚举值 'sessionStorage'
  persistenceStoragePrefix: 'ds_'
}

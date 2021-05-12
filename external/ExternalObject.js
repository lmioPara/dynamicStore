class ExternalObject {
  constructor(props) {
    this.type = typeof props;
    this.value = props;
    return new Proxy(this, handler);
  }

  getValue(key) {
    return this.value[key];
  }

  setValue(key, val) {
    this.value[key] = val;
    return this;
  }
}

const handler = {
  get: function (target, property) {
    console.log(property);
    return target.getValue(property);
  },
  set: function (target, property, value) {
    return target.setValue(property, value);
  }
}

export default ExternalObject;

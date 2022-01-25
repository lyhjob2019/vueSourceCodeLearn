class KVue {
  constructor(options) {
    this.$options = options;

    // 数据的响应化
    this.$data = options.data;
    this.oberve(this.$data);

    // 模拟watcher创建
    // new Watcher();
    // this.$data.test;
    // new Watcher();
    // this.$data.foo.bar;

    new Compile(options.el, this);

    // hook
    if (options.created) {
      options.created.call(this);
    }
  }

  oberve(value) {
    if (!value || typeof value !== "object") {
      return;
    }

    // 遍历对象
    Object.keys(value).forEach((key) => {
      this.defineReactive(value, key, value[key]);
      // 代理data中的属性到vue实例上
      this.proxyData(key);
    });
  }

  // 数据响应化
  defineReactive(obj, key, value) {
    this.oberve(value);

    const dep = new Dep();

    Object.defineProperty(obj, key, {
      get() {
        Dep.target && dep.addDep(Dep.target);
        return value;
      },
      set(newValue) {
        if (newValue == value) {
          return;
        } else {
          value = newValue;
          console.log(`${key} 属性更新了：${value}`);
          dep.notify();
        }
      },
    });
  }

  proxyData(key) {
    Object.defineProperty(this, key, {
      get() {
        return this.$data[key];
      },
      set(newValue) {
        this.$data[key] = newValue;
      },
    });
  }
}

// 一个属性有一个依赖，一个依赖有多个监听者watcher
class Dep {
  constructor() {
    // 这里存放若干依赖（watcher）
    this.deps = [];
  }
  // 收集依赖
  addDep(dep) {
    this.deps.push(dep);
  }
  // 通知更新
  notify() {
    this.deps.forEach((dep) => {
      dep.update();
    });
  }
}

// Watcher
// Watcher 会被加到 Dep 的 deps 中成为依赖。
// 1个 Watcher 对应一个属性
class Watcher {
  constructor(vm, key, cb) {
    this.vm = vm;
    this.key = key;
    this.cb = cb;
    // 将当前watcher的实例指定到Dep静态属性target
    Dep.target = this;
    this.vm[this.key]; // 触发属性相对应的 getter，添加依赖
    Dep.target = null;
  }

  update() {
    console.log(`属性更新了`);
    this.cb.call(this.vm, this.vm[this.key]);
  }
}

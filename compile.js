class Compile {
  constructor(el, vm) {
    // 要遍历的宿主节点
    this.$el = document.querySelector(el);
    this.$vm = vm;
    // 编译过程
    // 这一个过程，把原来的el childNodes 搬到fragment，在fragment编译完以后再把 childNodes 搬回el。
    if (this.$el) {
      // 转换内部内容片段Fragment
      this.$fragment = this.node2Fragment(this.$el);
      // 执行编译
      this.compile(this.$fragment);
      // 将编译完的html结果追加至$el
      this.$el.appendChild(this.$fragment);
    }
  }
  node2Fragment(el) {
    // 创造一个fragment存储在内存中，vm将通过这个fragment来进行编译操作
    const frag = document.createDocumentFragment();
    // 将el中所有子元素搬家至frag中
    let child;
    while ((child = el.firstChild)) {
      frag.appendChild(child);
    }
    return frag;
  }
  compile(el) {
    const childNodes = el.childNodes;
    Array.from(childNodes).forEach((node) => {
      // 类型判断
      if (this.isElement(node)) {
        // 元素
        // console.log(`编译元素 ${node.nodeName}`);
        // 查找k-、@等开头的指令
        const nodeAttrs = node.attributes;
        Array.from(nodeAttrs).forEach((attr) => {
          const attrName = attr.name;
          const exp = attr.value;
          if (this.isDirective(attrName)) {
            // k-text等
            const dir = attrName.substring(2);
            this[dir] && this[dir](node, this.$vm, exp);
          }
          if (this.isEvent(attrName)) {
            let dir = attrName.substring(1);
            this.eventHandler(node, this.$vm, exp, dir);
          }
        });
      } else if (this.isInterpolation(node)) {
        // 文本
        // console.log(`编译文本 ${node.textContent}`);
        this.compileText(node);
      }

      // 递归子节点
      if (node.childNodes && node.childNodes.length > 0) {
        this.compile(node);
      }
    });
  }
  // 判断元素
  isElement(node) {
    return node.nodeType === 1;
  }
  // 判断插值文本
  isInterpolation(node) {
    return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent);
  }
  // 编译插值文本
  compileText(node) {
    // console.log(RegExp.$1);
    // node.textContent = this.$vm.$data[RegExp.$1];
    this.update(node, this.$vm, RegExp.$1, "text");
  }
  // 更新函数
  update(node, vm, exp, dir) {
    const updaterFn = this[dir + "Updater"];
    // 初始化
    updaterFn && updaterFn(node, vm[exp]);
    // 依赖收集
    new Watcher(vm, exp, function (value) {
      updaterFn && updaterFn(node, value);
    });
  }

  isDirective(attr) {
    return attr.indexOf("k-") == 0;
  }
  isEvent(attr) {
    return attr.indexOf("@") == 0;
  }
  // 编译text指令
  text(node, vm, exp) {
    this.update(node, vm, exp, "text");
  }
  textUpdater(node, value) {
    node.textContent = value;
  }
  // 编译model指令————双向绑定; exp 是 attr.value
  model(node, vm, exp) {
    this.update(node, vm, exp, "model");

    node.addEventListener("input", (e) => {
      vm[exp] = e.target.value;
    });
  }
  modelUpdater(node, value) {
    node.value = value;
  }
  // 编译html指令
  html(node, vm, exp) {
    this.update(node, vm, exp, "html");
  }
  htmlUpdater(node, value) {
    // 创造fragment，加到本节点上
    node.innerHTML = value;
  }
  // 编译@指令
  eventHandler(node, vm, exp, dir) {
    let fn = vm.$options.methods && vm.$options.methods[exp];
    if (dir && fn) {
      node.addEventListener(dir, fn.bind(vm));
    }
  }
}

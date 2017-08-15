# Fusion

基于`custom element`的前端组件框架

---

## 接入

`fusion.js`支持`script`引入和`require`引入，可以根据业务需要选择合适的引入方式

## 使用

```
// 以非amd方式为例

var MyFusion = registerFusion('my-fusion', options);

var myfusion = new MyFusion();
document.body.appendChild(myfusion.element);
```

通过`registerFusion`注册一个新的组件类，赋值给`MyFusion`，通过`new MyFusion()`实例化得到`myfusion`对象，该对象上的`element`属性是一个`dom`对象。也可以直接在`html`里使用`<my-fusion></my-fusion>`来实例化`MyFusion`。

### registerFusion(name, options)

该函数用来注册基于`custom element`的自定义组件，其中`name`为组件名，建议`name`的命名中包含`-`，例如`my-fusion`。

`options`可以用来定制自定义组件的各种信息。

#### options.props

`options.props`是一个对象，用来定义组件支持的属性，用法如下：

```
props: {
    a: {
        type: Number,
        value: 123,
        onChange: function (old, now) {
            console.log(old, now);
        }
    }
}
```

* `type`: 表示该属性的值的类型
* `value`: 该属性的默认值
* `onChange`: 该属性在变化之后的回调，参数`old`和`new`分别表示变化前后的值

####  options.render

`render`是一个函数，用于编写组件的渲染逻辑

```
// 参数data为组件元素上的属性的值
render: function () {
    // render logic here
}
```

#### options.created

一个组件的生命周期过程为：`created` -> `attached` -> `detached`，`created`就是最早的一个步骤，在创建组件实例时调用

示例:

```
created: function () {
    console.log('it is created!');
}
```

#### options.init

组件第一次插入到`dom`时调用

```
init: function () {
    console.log('it is inited!');
}
```

#### options.attached

组件插入到`dom`之后调用

```
attached: function () {
    console.log('it is attached to dom!');
}
```

**注意**：想象这样的场景，组件插入`dom`之后，在某些情况下需要移出`dom`，之后又要插入`dom`，这样`attach`会被调用多次，如果希望只在组件第一次插入`dom`时执行某些操作，请在`init`中编写这些逻辑，只有在确认需要组件每次插入`dom`时都要调用的逻辑才应该写在`attach`中

#### options.detached

组件从`dom`中移除后调用

```
detached: function () {
    console.log('it is detached from dom!');
}
```

### 注册组件

调用`registerFusion`来注册组件，在`options`中可以重写现有的属性来实现组件所需的逻辑

```
var MyFusion = regiterFusion('my-fusion', {
    props: {
        name: {
            type: String,
            val: 'sfe',
            onChantge: function (old, now) {
                console.log('name is changed from ' + old + ' to ' + now);
            }
        }
    },
    created: function () {
        console.log('it is created');
    },
    init: function () {
        console.log('it is inited');
    },
    attached: function () {
        console.log('it is attached');
    },
    detached: function () {
        console.log('it is detached');
    },
    render: function () {
        var css = 'my-fusion p {color: red;}';
        var styleTag = document.createElement('style');
        styleTag.innerText = css;
        document.head.appendChild(styleTag);
        var data = this.getProp();
        var tpl = '<p>My name is ' + data.name + '</p>';
        var dom = this.element;
        dom.innerHTML = tpl;
    }
});
```

可以再`html`中直接使用标签:

```
<my-fusion name="foo"></my-fusion>
```

也可以在js中实例化:

```
var myfusion = new MyFusion();
myfusion.setAttribute('name', 'foo');
document.body.appendChild(myfusion);
```

在注册组件时，`options`内的所有函数中，`this`变量指向当前组件（fusion）对象，可以通过`this`获取到组件对象上的所有属性

补充说明2个属性：

* `this.element`: 表示当前组件对应的`dom`对象
* `this.getProp`: 函数，可以传一个字符串参数，如果有参数，则返回`props`中声明过的属性的值，如果没有传参数，则以对象形式返回`props`中所有声明过的属性的值

### 获取组件实例

有2种方式获取组件实例

* 获取`dom`对象的`fusion`属性
* 通过`new`实例化

```
// 方式一
var myfusion = document.querySelector('my-fusion').fusion;

// 方式二
var myfusion = new MyFusion();
```

### 事件

组件对象上可以绑定事件、触发事件、解除事件绑定

#### on(evt, fn)

事件绑定，可以绑定浏览器原生事件，也可以绑定自定义事件，用法如下：

```
myfusion.on('click', function (e) {
    alert('it is clicked!');
});
```

#### trigger(evt[, data, canBuble])

触发事件，可以通过`data`传递数据，`data`可以是任意类型数据，事件默认会冒泡，可以设置`canBuble`为false来阻止事件冒泡

```
myfusion.trigger('click');
```

#### off(evt[, fn])

解除事件绑定, `fn`可选，如果没有传`fn`，则将解除该对象上的`evt`事件的所有绑定

```
myfusion.off('click', fn);
```

## 进阶

* [最佳实践](./docs/advanced.md)
* [从零开始搭建一个Fusion组件项目](./docs/full.md)

## 反馈

如有任何问题，欢迎提[ISSUE](https://github.com/searchfe/fusion/issues)

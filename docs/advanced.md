# Fusion最佳实践

## registerFusion(name[, base], options)

`registerFusion`实际可以接收3个参数，第二个参数为要继承的基类，因此，我们可以实现一个方便使用的基类`Base`，之后注册的组件全部都基于`Base`

示例如下：

```
// base基类
var Base = registerFusion('best-fusion', {
    css: '',
    tpl: '',
    // 如果你的前端环境有zepto或者jquery
    $: function (selector) {
        return $(this.element).find(selector);
    },
    render: function () {
        if (!this.constructor.styled && this.css) {
            var styleTag = document.createElement('style');
            styleTag.innerText = this.css;
            document.querySelector('head').appendChild(styleTag);
            this.constructor.styled = true;
        }
        // render html
        var render = etpl.compile(this.tpl);
        var data = this.getProp();
        this.element.innerHTML = render(data);
    }
});
```

以上`base 基类`引入了2个新的属性`css`和`tpl`，分别用来定义组件css样式和组件的模板，在`render`函数中，通过`this.constructor`获取到当前类的构造函数，在构造函数上增加静态属性`styled`，用于记录该组件类的css是否已经插入到文档中，这样能实现多个同类的组件实例只插入一次css.

另外，以`etpl`为例，可以在`tpl`属性上编写前端模板，方便了开发。

继承`base 基类`的组件只需要重写`css`和`tpl`属性就可以实现组件的渲染

配合编译工具、模板引擎，可以将css样式、前端模板分别写在单独的文件中，这里以`fis3`为例

```
var MyComponent = registerFusion('my-component', Base, {
    css: __inline('./component.css'),
    tpl: __inline('./component.etpl')
});
```

在此基础上，支持`less`等css预处理也相当容易，这里不再赘述。

为了方便组件开发者的开发，我们可以把继承`Base`注册组件的过程封装成函数，这样就不用每次都手动继承了，代码如下

```
function register(name, options) {
    // Base实现参考上文
    var Base = regiseterFusion(...);
    var Component = registerFusion(name, Base, options);
    return Component;
}
```

最佳实践代码请参考[fusion.best.js](../src/fusion.best.js)

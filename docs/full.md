# 从零开始搭建一个Fusion组件项目

本文档的目的是带领读者从无到有地搭建一个基于`Fusion`的前端组件项目，帮助开发者迅速地上手`Fusion`组件开发。

## 工具

在这个例子中，我们将以`Fis3`作为前端构建工具，模版引擎使用`etpl`，css预处理选择`less`

如果你偏好其他的构建工具、模板引擎、css预处理等，可以自行选择，`Fusion`框架本身对这些工具没有依赖。

## 项目目录

俗话说，一个好的目录结构是一个项目的成功基础。（好吧，其实是我自己说的）我们开始做一个项目之前，当然要规划好项目的目录结构。

好了，话不多说，直接上图

![directory](/uploads/44fdd9d0969421a211e248de798c1411/directory.png)

我们假设整个项目的名字叫做`fusion-component`，下面共有4个一级目录和2个文件，分别是：

* dist: 最终产出的文件目录
* examples: 存放示例demo的目录
* src: 源文件目录，我们在此目录下开发
* test: 存放测试脚本的目录
* fis-conf.js: fis配置脚本
* Makefile: 编译脚本

`src`下有2个子文件夹：

* deps: 项目依赖的文件，比如`fusion.js`、`etpl.js`
* component: 组件的开发目录，所有的组件都在这个目录下

## 开发规范

组件在开发者要新增组件，需要在`components`目录下新建一个子目录，子目录的名字即组件名，例如`tab`，在`tab`目录中至少需要存在一个同名的`js`文件，比如`tab.js`，另外，如果组件需要写`css`样式和前端模板，则需要存在`tab.less`和`tab.etpl`

![tab](/uploads/5d801281488c71b885720d1fc5d94f04/tab.png)

本文示例的组件开发默认基于`Fusion最佳实践`，文档地址：[最佳实践](./advanced.md)

开发者在js文件中调用最佳实践提供的`register`函数进行组件的注册

开发完成后在`examples`目录中新建一个与组件同名的子目录，并开发自己的组件demo

## fis配置

我们需要利用Fis3帮我们做工程构建，主要完成这几件事：

* 内容嵌入：`less`、`etpl`的编写放到单独的文件中，然后通过fis嵌入到js文件中，这样就不用在js中拼接模板字符串和css字符串，增加了组件的可维护性
* 预处理：把`less`编译成`css`。如果你喜欢`es6`，也同样可以利用这个功能
* 压缩资源：`uglify`你的js文件，这个不用多说了吧

所以我们项目的`fis-conf.js`最终应该包含这些内容:

```
// fis系统在编译时会对文本文件和图片类二进制文件做不同的处理，文件分类依据是后缀名, etpl不在默认的文本后缀列表中，我们需要手动加入
// 参考 http://fis.baidu.com/fis3/docs/api/config-props.html
fis.set('project.fileType.text', 'etpl');

fis.match('*.less', {
    // fis-parser-less 插件进行解析
    parser: fis.plugin('less'),
    // .less 文件后缀构建后被改成 .css 文件
    rExt: '.css'
});

fis.match('*.js', {
    // fis-optimizer-uglify-js 插件进行压缩，已内置
    optimizer: fis.plugin('uglify-js')
});
```

## Make脚本

使用make脚本来简化编译命令，不需要每次编译都输入一长串的命令，一个make全搞定

```
default:
    rm -rf ./dist/*
    fis3 release --dest=./dist --root=./src/
```

这样在项目目录下执行`make`就能自动进行编译了

## 第一个组件

准备工作都做好了，现在开始可以写第一个组件。我们以`Tab`组件为例

我们可以先开发好`less`和`etpl`

less代码：

```
@tabs-height : 38px;

bd-tab {
    .bd-tabs {
        position: relative;
    }
    .bd-tabs-nav {
        min-width: 100%;
        height: @tabs-height;
        font-size: 14px;
        white-space: nowrap;
        background-color: #f8f8f8;
        // 旧版伸缩盒模型
        display: -webkit-box;
        -webkit-box-orient: horizontal; // 子元素左右排列
        -webkit-box-direction: normal;  // 子元素顺序排列
        -webkit-box-pack: justify;      // 子元素左右方向两端对齐
        -webkit-box-align: stretch;     // 子元素垂直方向顶部对齐
        -webkit-box-lines: single;      // multiple属性不被支持!!!!!WTF!!!!!
        // 新版伸缩盒模型
        display: -webkit-flex;
        -webkit-flex-direction: row;            // 子元素左右顺序排列
        -webkit-justify-content: space-between; // 子元素左右方向两端对齐
        -webkit-align-items: stretch;           // 子元素垂直方向顶部对齐
        -webkit-align-content: flex-start;      // 子元素垂直方向顶部对齐(多行情况)
        -webkit-flex-wrap: nowrap;              // 子元素溢出时不换行
        * {
            -webkit-box-sizing: border-box;     // for android 2~3
            box-sizing: border-box;
        }
    }
    .bd-tabs-nav-li {
        display: block;
        -webkit-box-flex: 1;
        -webkit-flex: 1 1 auto;
        width: percentage(1/6);
        list-style: none;
        text-decoration: none;
        padding: 0 15px;
        height: @tabs-height;
        line-height: @tabs-height;
        color: #333;
        text-align: center;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
    }
    .bd-tabs-nav .bd-tabs-nav-selected {
        color: #38f;
        border-bottom: 1px solid #38f;
    }
}
```

etpl模板：

```
<div class="bd-tabs">
    <div>
        <ul class="bd-tabs-nav">
        <!-- for: ${items} as ${item}, ${index} -->
        <!-- if: ${index} == 0 -->
            <li class="bd-tabs-nav-li bd-tabs-nav-selected">${item.title}</li>
        <!-- else -->
            <li class="bd-tabs-nav-li">${item.title}</li>
        <!-- /if -->
        <!-- /for -->
        </ul>
    </div>
    <!-- for: ${items} as ${item}, ${index} -->
    <!-- if: ${index} == 0 -->
    <div class="bd-tabs-content">${item.content}</div>
    <!-- else -->
    <div class="bd-tabs-content" style="display: none;">${item.content}</div>
    <!-- /if -->
    <!-- /for -->
</div>
```

接下来，就可以开发组件的js了

```
register('bd-tab', {
    props: {
        items: {
            type: Array,
            val: [],
            onChange: function () {
                this.render();
            }
        }
    },
    css: __inline('./tab.less'),
    tpl: __inline('./tab.etpl'),
    created: function () {
        console.log('it is created');
    },
    init: function () {
        console.log('it is inited');
        var that = this;
        $(this.element).delegate('.bd-tabs-nav-li', 'click', function () {
            var $navs = that.$('.bd-tabs-nav-li');
            var $contents = that.$('.bd-tabs-content');
            $navs.removeClass('bd-tabs-nav-selected');
            $(this).addClass('bd-tabs-nav-selected');
            var index = $(this).index();
            $contents.hide();
            $contents.eq(index).show();
        });
        setTimeout(function () {
            that.trigger('shouldRerender', 'haha, it should be re-render now');
        }, 10000);
    },
    attached: function () {
        console.log('it is attached');
    },
    detached: function () {
        console.log('it is detached');
    }
});
```

我们可以看到，组件定义了一个数组类型的属性`items`，并且设置在`items`属性变化时重新渲染组件

`css`和`tpl`则是通过`fis`的`__inline`功能引入

`created`->`init`->`attached`->`detached`是一个组件的生命周期，我们可以在这里生命周期的函数入口注入组件相关的逻辑代码

另外，组件会在初始化之后的10s触发一个自定义事件`shouldRerender`，我们可以在业务代码中监听这个事件，执行定制的逻辑

测试demo代码放在`examples`目录中

```
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Tab Demo</title>
    </head>
    <body>
        <bd-tab items=[{"title":"nav1","content":"content1"},{"title":"nav2","content":"content2"},{"title":"nav3","content":"content3"}]></bd-tab>
        <script src="../../dist/deps/zepto.min.js"></script>
        <script src="../../dist/deps/etpl.js"></script>
        <script src="../../dist/deps/fusion.js"></script>
        <script src="../../dist/deps/fusion.best.js"></script>
        <script src="../../dist/components/tab/tab.js"></script>
        <script>
            $('bd-tab').on('shouldRerender', function (e, msg) {
                console.log(msg);
                var arr = [
                    {
                        title: 'new_nav1',
                        content: 'new_content1'
                    },
                    {
                        title: 'new_nav2',
                        content: 'new_content2'
                    }
                ];
                $(this).attr('items', JSON.stringify(arr));
            });
        </script>
    </body>
</html>
```

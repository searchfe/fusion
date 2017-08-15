// 引入document.registerElement的polyfill
__inline('./deps/document-register-element.max.js');

/**
 * @fileOverview: fusion framework core code
 * @author: zhulei05
 * @version 1.0
 * @copyright 2015 Baidu.com, Inc. All Rights Reserved
 */

define(function () {
     // 公用空函数
    var noop = function () {};

    // Utils
    var class2type = {};
    var nativeToString = class2type.toString;
    var nativeHasOwn = class2type.hasOwnProperty;
    var nativeSlice = [].slice;
    "Boolean Number String Function Array Date RegExp Object Error".split(' ').forEach(function(name, i) {
        class2type["[object " + name + "]"] = name.toLowerCase();
    });

    function type(obj) {
        return obj == null ? String(obj) :
            class2type[nativeToString.call(obj)] || "object";
    }

    function isWindow(obj) {
        return obj != null && obj == obj.window;
    }

    function isFunction(value) {
        return type(value) == "function";
    }

    function likeArray(obj) {
        var length = !!obj && 'length' in obj && obj.length;
        var typeName = type(obj);

        return 'function' != typeName && !isWindow(obj) && (
            'array' == typeName || length === 0 ||
            (typeof length == 'number' && length > 0 && (length - 1) in obj)
        );
    }

    function each(elements, callback) {
        var i;
        var key;

        if (likeArray(elements)) {
            for (i = 0; i < elements.length; i++) {
                if (callback.call(elements[i], i, elements[i]) === false) return elements;
            }
        } else {
            for (key in elements) {
                if (callback.call(elements[key], key, elements[key]) === false) return elements;
            }
        }
        return elements;
    }

    // 处理数据类型
    function handleType(type, value) {
        if (!type) {
            return;
        }
        var result;
        switch (type) {
            case String:
                result = String(value);
                break;
            case Boolean:
                result = (value === 'true' || value === true);
                break;
            case Number:
                result = Number(value);
                break;
            case Array:
            case Object:
                result = typeof value === 'string' ? JSON.parse(value) : value;
                break;
        }
        return result;
    }

    // Fusion基类
    function Fusion() {}

    Fusion.prototype = {
        elementPrototype: HTMLElement.prototype,
        props: {},
        created: noop,
        init: noop,
        _inited: false,
        attached: noop,
        detached: noop,
        render: noop,
        _handlers: {},
        on: function (name, fn) {
            this._handlers[name] || (this._handlers[name] = []);
            var handler = {};
            handler.fn = fn;
            var that = this;
            handler.proxy = function (e) {
                var ret = fn.apply(that.element, e._args == undefined ? [e] : [e].concat(e._args));
                if (ret === false) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                return ret;
            };
            this._handlers[name].push(handler);
            this.element.addEventListener(name, handler.proxy, false);
        },
        off: function (name, fn) {
            var that = this;
            if (!name) {
                each(this._handlers, function (key, ele) {
                    each(ele, function (i, handler) {
                        that.element.removeEventListener(key, handler.proxy, false);
                    });
                });
            }
            else {
                var handlers = this._handlers[name];
                var index;
                if (fn) {
                    handlers = handlers.filter(function (handler, i) {
                        if (handler.fn === fn) {
                            index = i;
                            return true;
                        }
                        return false;
                    });
                }
                handlers.forEach(function (handler, i) {
                    that.elemnt.removeEventListener(name, handler.proxy, false);
                });
                if (index !== undefined) {
                    this._handlers[name].splice(index, 1);
                }
                else {
                    this._handlers[name] = [];
                }
            }
        },
        trigger: function (name, data, canBuble) {
            var event = document.createEvent('Event');
            (canBuble === undefined) && (canBuble = true);
            event.initEvent(name, canBuble, true);
            (data != undefined) && (event._args = data);
            this.element.dispatchEvent(event);
        },
        getProp: function (name) {
            var ret;
            if (!name) {
                ret = {};
                var that = this;
                each(this.props, function (key) {
                    ret[key] = that.getProp(key);
                });
            }
            else {
                var prop = this.props[name];
                if (prop) {
                    ret = this.element.getAttribute(name) || (typeof prop.value == 'function' ? prop.value() : prop.value);
                    ret = handleType(prop.type, ret);
                }
            }

            return ret;
        },
        _super: noop
    };

    // 派生Fusion子类工厂函数
    var registerFusion = function (name, base, option) {
        var FusionConstructor;
        var FusionPrototype;
        var ElementConstructor;
        var ElementPrototype;

        if (!option) {
            option = base;
            base = Fusion;
        }

        // Fusion子类
        FusionConstructor = function (element) {
            if (element) {
                this.element = element;
            }
            else {
                element = new ElementConstructor();
                return element.fusion;
            }
        };

        FusionPrototype = Object.create(base.prototype);

        each(option, function (key, value) {
            var _super;

            if (!isFunction(value)) {
                FusionPrototype[key] = value;
            }
            else {
                _super = function () {
                    return base.prototype[key].apply(this, arguments);
                };
                FusionPrototype[key] = function () {
                    var ret;
                    var __super = this._super;

                    this._super = _super;

                    try {
                        ret = value.apply(this, arguments);
                    }
                    finally {
                        this._super = __super;
                    }

                    return ret;
                };
            }
        });

        FusionConstructor.prototype = FusionPrototype;
        FusionPrototype.constructor = FusionConstructor;

        ElementPrototype = Object.create(base.prototype.elementPrototype);
        ElementPrototype.createdCallback = function () {
            this.fusion = new FusionConstructor(this);
            this.fusion.render();
            this.fusion.created();
        };
        ElementPrototype.attachedCallback = function () {
            if (!this.fusion._inited) {
                this.fusion.init();
                this.fusion._inited = true;
            }
            this.fusion.attached();
            /**
             * 在原生不支持document.registerElement的浏览器上，我们使用了document-register-element.js
             * 由于浏览器限制，使用该兼容库来实现的生命周期回调都是异步触发的，这造成了一些时间时机问题
             * 例如在safari上：
             *    var ele = docuemnt.createElement('xxx');
             *    console.log(ele.fusion);
             * 此时ele.fusion的值为undefined
             * 
             * 所以此处提供fusionReady接口，使用组件时可以将业务逻辑写在fusionReady中，避免上述问题
             */
            if (this.fusionReady) {
                this.fusionReady();
            }
            else {
                Object.defineProperty(this, 'fusionReady', {
                    configurable: true,
                    enumerable: true,
                    set: function (val) {
                        (typeof val === 'function') && val();
                    }
                });
            }
        };
        ElementPrototype.detachedCallback = function () {
            this.fusion.detached();
        };
        ElementPrototype.attributeChangedCallback = function (name, old, now) {
            var props = this.fusion.props;
            if (props[name] && props[name].onChange) {
                var type = props[name].type;
                old = handleType(type, old);
                now = handleType(type, now);
                props[name].onChange.call(this.fusion, old, now);
            }
        };

        ElementConstructor = document.registerElement(name, {
            prototype: ElementPrototype
        });
        ElementPrototype.constructor = ElementConstructor;
        FusionPrototype.elementPrototype = ElementPrototype;

        return FusionConstructor;
    };

    return registerFusion;
});

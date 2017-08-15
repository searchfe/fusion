/**
 * @fileOverview: fusion framework best practice
 * @author: zhulei05
 * @version 1.0
 * @copyright 2015 Baidu.com, Inc. All Rights Reserved
 */

define(['fusion'], function (registerFusion) {
    var BestFusion = registerFusion('best-fusion', {
        css: '',
        tpl: '',
        $: function (selector) {
            return $(this.element).find(selector);
        },
        holdChild: false,
        render: function () {
            if (!this.constructor.styled && this.css) {
                var styleTag = document.createElement('style');
                styleTag.setAttribute('data-for', 'fusion');
                styleTag.innerText = this.css;
                document.querySelector('head').appendChild(styleTag);
                this.constructor.styled = true;
            }

            if (this.holdChild) {
                return;
            }

            // render html
            var render = B.etpl.compile(this.tpl);
            var data = this.getProp();
            this.element.innerHTML = render(data);
        }
    });

    var register = function (name, options) {
        var Fusion = registerFusion(name, BestFusion, options);
        return Fusion;
    };

    return register;
});

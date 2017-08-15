define(['fusion.best', 'deps/naboo', 'deps/tool'], function (register, Naboo, Tool) {
    Naboo.register('toggleIn', function (next, expandDom, translateDoms, hei, duration, ease) {
        var $expandDom = $(expandDom);
        $expandDom.height($expandDom.height() + hei);
        translateDoms.forEach(function (dom, i) {
            $(dom).css({
                'transform': 'translateY(-' + hei + 'px)',
                '-webkit-transform': 'translateY(-' + hei + 'px)'
            });
            Tool.css3(dom, {translateY: '0px'}, duration, ease, 0, function () {
                /* 防止多次调用next */
                if (i === 0) {
                    next();
                }
            });
        });
    });
    
    Naboo.register('toggleOut', function (next, expandDom, translateDoms, hei, duration, ease) {
        var $expandDom = $(expandDom);
        
        translateDoms.forEach(function (dom, i) {
            Tool.css3(dom, {translateY: '-' + hei + 'px'}, duration, ease, 0, function () {
                if (i === 0) {
                    $expandDom.height($expandDom.height() - hei);
                    next();
                }
                $(dom).css({
                    'transform': 'translateY(0px)',
                    '-webkit-transform': 'translateY(0px)'
                });
            })
        });
    });
    
    Naboo.register('slideIn', function (next, dom, translate, duration, ease, delay) {
        $(dom).css({
            'transform': 'translateY(' + translate + 'px)',
            '-webkit-transform': 'translateY(' + translate + 'px)'
        }).show();
        Tool.css3(dom, {translateY: '0px', opacity: 1}, duration, ease, delay,  function () {
            next();
        });
    });
    
    Naboo.register('slideOut', function (next, dom, translate, duration, ease, delay) {
        Tool.css3(dom, {translateY: translate + 'px', opacity: 0}, duration, ease, delay,  function () {
            $(dom).css({
                'transform': 'translateY(' + translate + 'px)',
                '-webkit-transform': 'translateY(' + translate + 'px)'
            }).hide();
            next();
        });
    });

    var BToggle = register('b-toggle', {
        props: {
            fullHeight: {
                type: Number,
                val: 0,
                onChange: function (old, now) {
                    this.fullHeight = now;
                }
            }
        },
        css: 'b-toggle {display: block;} .b-toggle-layer1 {overflow: hidden; z-index: 1;} .b-toggle-default-hide {display: none; opacity: 0;} .b-toggle-layer2 {z-index: 2;}',
        holdChild: true,
        fullHeight: 0,
        rollHeight: 0,
        init: function () {
            this.rollHeight = this.$('.b-toggle-layer1').height();
            this.fullHeight = this.getProp('fullHeight');

            var layer1 = this.$('.b-toggle-layer1').get(0);
            var layer2 = this.$('.b-toggle-layer2').get(0);
            var slides = this.$('.b-toggle-default-hide');
            slides = Array.prototype.slice.call(slides, 0);
            var translateDoms = [layer2];
            var that = this;
            function getTranslateDoms(currentDom) {
                var $parent = $(currentDom).parent();
                var parent = $parent.get(0);
                var $siblings = $parent.children();
                var order = $siblings.index(currentDom);
                var afterDoms = $siblings.filter(function (index) {
                    var elem = $siblings.get(index);
                    //return (index > order && elem.style);
                    if (index > order && elem.style) {
                        return true;
                    }
                    else {
                        return false;
                    }
                });
                afterDoms.length && (translateDoms = translateDoms.concat.apply(translateDoms, afterDoms));
                if (parent.tagName.toUpperCase() !== 'BODY') {
                    getTranslateDoms(parent);
                }
            }
            getTranslateDoms(this.element);
            var isShow = false;
            this.$(layer2).on('click', function () {
                var heightGap = that.fullHeight - that.rollHeight;
                isShow = !isShow;
                if (isShow) {
                    var slidesAnimation = slides.map(function (dom, i) {
                        return Naboo.slideIn(dom, -60, 0.2, 'ease-out', 0.1 * i);
                    });
                    var animations = [Naboo.toggleIn(layer1, translateDoms, heightGap, 0.2, 'ease-in')].concat(slidesAnimation);
                    Naboo.p.apply(Naboo, animations).start();
                }
                else {
                    var st = $('body').scrollTop();
                    var distance = $(this).offset().top - st;
                    distance = Math.min(distance, heightGap);
                    var slidesAnimation = slides.map(function (dom, i) {
                        return Naboo.slideOut(dom, -60, 0.2, 'ease-out', 0.1 * (slides.length - 1 - i));
                    });
                    var animations = [Naboo.toggleOut(layer1, translateDoms, distance, 0.2, 'ease-in')].concat(slidesAnimation);
                    Naboo.p.apply(Naboo, animations).start(function () {
                        if (distance < heightGap) {
                            var gap = heightGap - distance;
                            $('body').scrollTop(st - gap);
                            $(layer1).height($(layer1).height() - gap);
                        }
                    });
                }
            });
        }
    });

    return BToggle;
});

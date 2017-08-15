/**
 * @author  zhulei05
 * @file    fusion.core.js测试文件
 */

var create_spy = sinon.spy();
var init_spy = sinon.spy();
var attach_spy = sinon.spy();
var detach_spy = sinon.spy();
var change_spy = sinon.spy();
var MyFusion = registerFusion('my-fusion', {
    props: {
        a: {
            type: String,
            value: 'aladdin',
            onChange: function () {
                change_spy();
            }
        },
        b: {
            type: Number,
            value: 123
        },
        c: {
            type: Boolean,
            value: true
        }
    },
    create: function () {
        create_spy();
    },
    init: function () {
        init_spy();
    },
    attach: function () {
        attach_spy();
    },
    detach: function () {
        detach_spy();
    }
});
var my_fusion = new MyFusion();
var my_fusion2 = new MyFusion();
my_fusion.element.setAttribute('a', 'sfe');
document.body.appendChild(my_fusion.element);
document.body.removeChild(my_fusion.element);
document.body.appendChild(my_fusion.element);

var MyNewFusion = registerFusion('my-new-fusion', MyFusion, {});
var my_new_fusion = new MyNewFusion();

describe('fusion properties test', function () {
    it('should have element', function () {
        expect(my_fusion.element).to.not.equal(undefined);
    });
    it('should have props', function () {
        expect(my_fusion.props).to.not.equal(undefined);
    });
    it('should have create', function () {
        expect(my_fusion.create).to.not.equal(undefined);
    });
    it('should have attach', function () {
        expect(my_fusion.attach).to.not.equal(undefined);
    });
    it('should have init', function () {
        expect(my_fusion.init).to.not.equal(undefined);
    });
    it('should have detach', function () {
        expect(my_fusion.detach).to.not.equal(undefined);
    });
    it('should have render', function () {
        expect(my_fusion.render).to.not.equal(undefined);
    });
    it('should have props', function () {
        expect(my_fusion.props).to.not.equal(undefined);
    });
});

describe('fusion\' s lifecycle function check', function () {
    it('should call create', function () {
        expect(create_spy).to.have.been.called;
    });
    it('should call init once', function () {
        expect(init_spy).to.have.been.calledOnce;
    });
    it('should call attach', function () {
        expect(attach_spy).to.have.been.called;
    });
    it('should call detach', function () {
        expect(detach_spy).to.have.been.called;
    });
    it('should call a\'s onChange function', function () {
        expect(change_spy).to.have.been.called;
    });
});

describe('fusion\'s extend relation', function () {
    it('should new fusion have a prop', function () {
        expect(my_new_fusion.props.a).to.not.equal(undefined);
    });
});

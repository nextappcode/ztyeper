(function (window) {
    "use strict";
    var initializing = false,
        fnTest = /xyz/.test(function () {
            xyz;
        })
            ? /\bparent\b/
            : /.*/;
    var lastClassId = 0;
    window.ig.Class = function () {};
    var inject = function (prop) {
        var proto = this.prototype;
        var parent = {};
        for (var name in prop) {
            if (
                typeof prop[name] == "function" &&
                typeof proto[name] == "function" &&
                fnTest.test(prop[name])
            ) {
                parent[name] = proto[name];
                proto[name] = (function (name, fn) {
                    return function () {
                        var tmp = this.parent;
                        this.parent = parent[name];
                        var ret = fn.apply(this, arguments);
                        this.parent = tmp;
                        return ret;
                    };
                })(name, prop[name]);
            } else {
                proto[name] = prop[name];
            }
        }
    };
    window.ig.Class.extend = function (prop) {
        var Class = function () {
            if (initializing) {
                return this;
            }
            if (this.init) {
                this.init.apply(this, arguments);
            }
        };
        Class.prototype = new this();
        Class.prototype.constructor = Class;
        Class.extend = window.ig.Class.extend;
        Class.inject = inject;
        for (var i in prop) {
            if (i === "static") {
                for (var s in prop.static) {
                    Class[s] = prop.static[s];
                }
            }
            Class.inject(prop);
        }
        return Class;
    };
})(window); 
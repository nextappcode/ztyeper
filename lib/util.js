(function (window) {
    "use strict";
    Number.prototype.map = function (istart, istop, ostart, ostop) {
        return ostart + (ostop - ostart) * ((this - istart) / (istop - istart));
    };
    Number.prototype.limit = function (min, max) {
        return Math.min(max, Math.max(min, this));
    };
    Number.prototype.round = function (precision) {
        precision = Math.pow(10, precision || 0);
        return Math.round(this * precision) / precision;
    };
    Number.prototype.floor = function () {
        return Math.floor(this);
    };
    Number.prototype.ceil = function () {
        return Math.ceil(this);
    };
    Number.prototype.toInt = function () {
        return this | 0;
    };
    Number.prototype.toRad = function () {
        return (this / 180) * Math.PI;
    };
    Number.prototype.toDeg = function () {
        return (this * 180) / Math.PI;
    };
    Object.defineProperty(Array.prototype, "erase", {
        value: function (item) {
            for (var i = this.length; i--; ) {
                if (this[i] === item) {
                    this.splice(i, 1);
                }
            }
            return this;
        },
    });
    Object.defineProperty(Array.prototype, "random", {
        value: function (item) {
            return this[Math.floor(Math.random() * this.length)];
        },
    });
    Function.prototype.bind =
        Function.prototype.bind ||
        function (oThis) {
            if (typeof this !== "function") {
                throw new TypeError(
                    "Function.prototype.bind - what is trying to be bound is not callable",
                );
            }
            var aArgs = Array.prototype.slice.call(arguments, 1),
                fToBind = this,
                fNOP = function () {},
                fBound = function () {
                    return fToBind.apply(
                        this instanceof fNOP && oThis ? this : oThis,
                        aArgs.concat(Array.prototype.slice.call(arguments)),
                    );
                };
            fNOP.prototype = this.prototype;
            fBound.prototype = new fNOP();
            return fBound;
        };
    window.ig.copy = function (object) {
        if (
            !object ||
            typeof object != "object" ||
            object instanceof HTMLElement ||
            object instanceof ig.Class
        ) {
            return object;
        } else if (object instanceof Array) {
            var c = [];
            for (var i = 0, l = object.length; i < l; i++) {
                c[i] = ig.copy(object[i]);
            }
            return c;
        } else {
            var c = {};
            for (var i in object) {
                c[i] = ig.copy(object[i]);
            }
            return c;
        }
    };
    window.ig.merge = function (original, extended) {
        for (var key in extended) {
            var ext = extended[key];
            if (
                typeof ext != "object" ||
                ext instanceof HTMLElement ||
                ext instanceof ig.Class ||
                ext === null
            ) {
                original[key] = ext;
            } else {
                if (!original[key] || typeof original[key] != "object") {
                    original[key] = ext instanceof Array ? [] : {};
                }
                window.ig.merge(original[key], ext);
            }
        }
        return original;
    };
    window.ig.ksort = function (obj) {
        if (!obj || typeof obj != "object") {
            return [];
        }
        var keys = [],
            values = [];
        for (var i in obj) {
            keys.push(i);
        }
        keys.sort();
        for (var i = 0; i < keys.length; i++) {
            values.push(obj[keys[i]]);
        }
        return values;
    };
    window.ig.setVendorAttribute = function (el, attr, val) {
        var uc = attr.charAt(0).toUpperCase() + attr.substr(1);
        el[attr] =
            el["ms" + uc] =
            el["moz" + uc] =
            el["webkit" + uc] =
            el["o" + uc] =
                val;
    };
    window.ig.getVendorAttribute = function (el, attr) {
        var uc = attr.charAt(0).toUpperCase() + attr.substr(1);
        return (
            el[attr] ||
            el["ms" + uc] ||
            el["moz" + uc] ||
            el["webkit" + uc] ||
            el["o" + uc]
        );
    };
    window.ig.normalizeVendorAttribute = function (el, attr) {
        var prefixedVal = window.ig.getVendorAttribute(el, attr);
        if (!el[attr] && prefixedVal) {
            el[attr] = prefixedVal;
        }
    };
    window.ig.getImagePixels = function (image, x, y, width, height) {
        var canvas = window.ig.$new("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        var ctx = canvas.getContext("2d");
        window.ig.System.SCALE.CRISP(canvas, ctx);
        var ratio =
            window.ig.getVendorAttribute(ctx, "backingStorePixelRatio") || 1;
        window.ig.normalizeVendorAttribute(ctx, "getImageDataHD");
        var realWidth = image.width / ratio,
            realHeight = image.height / ratio;
        canvas.width = Math.ceil(realWidth);
        canvas.height = Math.ceil(realHeight);
        ctx.drawImage(image, 0, 0, realWidth, realHeight);
        return ratio === 1
            ? ctx.getImageData(x, y, width, height)
            : ctx.getImageDataHD(x, y, width, height);
    };
})(window);
(function (window) {
    "use strict";
    window.ig.module = function (name) {
        if (window.ig._current) {
            throw "Module '" + window.ig._current.name + "' defines nothing";
        }
        if (window.ig.modules[name] && window.ig.modules[name].body) {
            throw "Module '" + name + "' is already defined";
        }
        window.ig._current = {
            name: name,
            requires: [],
            loaded: false,
            body: null,
        };
        window.ig.modules[name] = window.ig._current;
        window.ig._loadQueue.push(window.ig._current);
        return window.ig;
    };
    window.ig.requires = function () {
        window.ig._current.requires = Array.prototype.slice.call(arguments);
        return window.ig;
    };
    window.ig.defines = function (body) {
        window.ig._current.body = body;
        window.ig._current = null;
        window.ig._initDOMReady();
    };
})(window); 
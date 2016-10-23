(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    function creaceCallback0() {
        var _on;
        return {
            trigger: function () { return _on && _on(); },
            on: function (fn) { return _on = fn; }
        };
    }
    function callback1() {
        var _on;
        return {
            trigger: function (arg1) { return _on && _on(arg1); },
            on: function (fn) { return _on = fn; }
        };
    }
    var identity = function (i) { return i; };
    var exactMatch = function (pattern) { return function (token) { return pattern === token ? 1 : 0; }; };
    var namedMatch = function (pattern) { return function (token) { return token ? .9 : 0; }; };
    var wildcardMatch = function (pattern) { return function (token) { return .8; }; };
    function getMachingFunction(pattern) {
        if (pattern === '*')
            return wildcardMatch(pattern);
        if (pattern.charAt(0) === ':')
            return namedMatch(pattern);
        return exactMatch(pattern);
    }
    function buildRankingFunction(route) {
        return route
            .map(function (token) { return getMachingFunction(token); })
            .map(function (matchingFunction, index) { return ({ matchingFunction: matchingFunction, index: index }); })
            .reduce(function (rankingFunction, x) { return function (tokens) { return rankingFunction(tokens) * 2 * x.matchingFunction(tokens[x.index]); }; }, function () { return 1; });
    }
    var matchRoute = function (table) { return function (tokens) {
        var sorted = table.filter(function (x) { return x.rank(tokens) > 0; }).sort(function (a, b) { return b.rank(tokens) - a.rank(tokens); });
        return sorted[0];
    }; };
    function set(map, name, value) {
        map[name] = value;
        return map;
    }
    var namedExtract = function (pattern) { return function (current, token) { return set(current, pattern.substring(1), token); }; };
    function getExtractionFunction(token) {
        if (token.charAt(0) === ':')
            return namedExtract(token);
        return identity;
    }
    function buildExtractVariablesFunction(route) {
        return route
            .map(function (token) { return getExtractionFunction(token); })
            .map(function (extract, index) { return ({ extract: extract, index: index }); })
            .reduce(function (previous, current) { return function (path) { return current.extract(previous(path), path[current.index]); }; }, function (path) { return ({}); });
    }
    function getPathBuilderFunction(token) {
        if (token.charAt(0) === ':')
            return function (map) { return map[token.substr(1)] || "<" + token + ">"; };
        return function () { return token; };
    }
    function buildPathBuilder(basePath, route) {
        return route
            .map(function (token) { return getPathBuilderFunction(token); })
            .reduce(function (previous, fn) { return function (map) { return (previous(map) + "/" + fn(map)); }; }, function (map) { return basePath; });
    }
    function buildRoute(basePath, pattern, routeDidEnterCallback) {
        var parts = pattern.split('/');
        var rank = buildRankingFunction(parts);
        var extractVariables = buildExtractVariablesFunction(parts);
        var buildPath = buildPathBuilder(basePath, parts);
        return {
            length: parts.length,
            extractVariables: extractVariables,
            pattern: pattern,
            rank: rank,
            routeDidEnterCallback: routeDidEnterCallback,
            buildPath: buildPath,
        };
    }
    var registerWithTable = function (routeTable, basePath) { return function (routePattern, callback) {
        var route = buildRoute(basePath, routePattern, callback);
        routeTable.push(route);
        return route.buildPath;
    }; };
    function createRouter(basePath, registerPathDidUpdate, shouldDispose) {
        var routeTable = [];
        var lastMatchedPath;
        var dispatchToSubRoute;
        var disposeSubrouter;
        var routeDidLeaveCallback;
        shouldDispose.on(function () {
            if (routeDidLeaveCallback) {
                routeDidLeaveCallback();
            }
        });
        registerPathDidUpdate(function (path) {
            var tokens = path.split('/');
            var route = matchRoute(routeTable)(tokens);
            var matchedPath = tokens.slice(0, route && route.length || 0).join('/');
            if (matchedPath !== lastMatchedPath) {
                disposeSubrouter && disposeSubrouter.trigger();
                if (routeDidLeaveCallback) {
                    routeDidLeaveCallback();
                }
            }
            if (route) {
                if (matchedPath !== lastMatchedPath) {
                    var dispose = disposeSubrouter = creaceCallback0();
                    var subRouter = createRouter(basePath + "/" + matchedPath, function (d) { return dispatchToSubRoute = d; }, dispose);
                    var variables = route.extractVariables(tokens);
                    routeDidLeaveCallback = route && route.routeDidEnterCallback(variables, subRouter, path);
                }
                dispatchToSubRoute(tokens.slice(route.length).join('/'));
            }
            lastMatchedPath = matchedPath;
        });
        return {
            register: registerWithTable(routeTable, basePath)
        };
    }
    var dispatch;
    exports.router = createRouter('', function (d) { return dispatch = d; }, creaceCallback0());
    function browserPathDidChange(path) {
        dispatch && dispatch(path);
    }
    exports.browserPathDidChange = browserPathDidChange;
});
//# sourceMappingURL=routelette.js.map
type pathSegment = string
type path = string
type splitPath = string[]

interface callback0 {
    on: (fn: () => void) => void
}

interface trigger0 {
    trigger: () => void
}

function creaceCallback0(): trigger0 & callback0 {
    let _on: () => void
    return {
        trigger: () => _on && _on(),
        on: (fn: () => void) => _on = fn
    }
}

function callback1<T1>() {
    let _on: (arg1: T1) => void
    return {
        trigger: (arg1: T1) => _on && _on(arg1),
        on: (fn: (arg1: T1) => void) => _on = fn
    }
}


export interface map {
    [name: string]: string
}

interface extractVariables {
    (map: map, token): map
}

interface extractionFunction {
    (tokens: string[]): map
}

interface pathChangedCallback {
    (path: string): void
}

export interface routeDidLeaveCallback {
    (): void
}

export interface routeDidEnterCallback {
    (extractedVariables: map, nestedRouter: Router, path: string): routeDidLeaveCallback | void
}

interface matchingFunction {
    (token: string): number
}

interface rankingFunction {
    (tokens: string[]): number
}

interface route {
    length: number,
    pattern: string,
    extractVariables: extractionFunction
    rank: rankingFunction,
    routeDidEnterCallback: routeDidEnterCallback,
    buildPath: (map: map) => string,
}


type RouteTable = route[]

const identity = (i) => i

/*************************
 *      Matching
 *************************/

const exactMatch = (pattern) => (token) => pattern === token ? 1 : 0
const namedMatch = (pattern) => (token) => token ? .9 : 0
const wildcardMatch = (pattern) => (token) => .8

function getMachingFunction(pattern: string): matchingFunction {
    if (pattern === '*')
        return wildcardMatch(pattern)
    if (pattern.charAt(0) === ':')
        return namedMatch(pattern)

    return exactMatch(pattern)
}

function buildRankingFunction(route: string[]): rankingFunction {
    return route //  [ 'foo', 'bar', '*' ]
        .map(token => getMachingFunction(token)) // [exactMatch, exactMatch, wildcardMatch]
        .map((matchingFunction, index) => ({ matchingFunction, index }))
        .reduce((rankingFunction: rankingFunction, x) => (tokens) => rankingFunction(tokens) * 2 * x.matchingFunction(tokens[x.index]), () => 1)
}

const matchRoute = (table: RouteTable) => (tokens: string[]) => {
    const sorted = table.filter(x => x.rank(tokens) > 0).sort((a, b) => b.rank(tokens) - a.rank(tokens))
    return sorted[0]
}

/*************************
 *   Variable extraction
 *************************/

function set(map: map, name: string, value: any) {
    map[name] = value;
    return map
}

const namedExtract = (pattern) => (current: map, token: string) => set(current, pattern.substring(1), token)

function getExtractionFunction(token): extractVariables {
    if (token.charAt(0) === ':')
        return namedExtract(token)
    return identity
}

function buildExtractVariablesFunction(route: string[]): (path: splitPath) => map {
    return route //  [ 'foo', ':bar', '*' ]
        .map(token => getExtractionFunction(token)) // [identity, namedExtract, identity]
        .map((extract, index) => ({ extract, index }))
        .reduce((previous, current) => (path) => current.extract(previous(path), path[current.index]), (path: splitPath) => ({} as map))
}

/*************************
 *       Buliding
 *************************/


function getPathBuilderFunction(token: string) {
    if (token.charAt(0) === ':')
        return (map: map) => map[token.substr(1)] || `<${token}>`

    return () => token
}

function buildPathBuilder(basePath: string, route: string[]): (map) => string {
    return route
        .map(token => getPathBuilderFunction(token))
        .reduce((previous, fn) => (map) => `${previous(map)}/${fn(map)}`, (map: map) => basePath)
}

/*************************
 *      The rest
 *************************/


function buildRoute(basePath: string, pattern: string, routeDidEnterCallback: routeDidEnterCallback): route {
    const parts = pattern.split('/')
    const rank = buildRankingFunction(parts)
    const extractVariables = buildExtractVariablesFunction(parts)
    const buildPath = buildPathBuilder(basePath, parts)
    return {
        length: parts.length,
        extractVariables,
        pattern,
        rank,
        routeDidEnterCallback,
        buildPath,
    }
}


const registerWithTable = (routeTable: RouteTable, basePath: string) => (routePattern: string, callback: routeDidEnterCallback) => {
    const route = buildRoute(basePath, routePattern, callback);
    routeTable.push(route)
    return route.buildPath
}

// This is the worst one .... It's not particularly functional with all the mutating lets.
function createRouter(
    basePath: string,
    registerPathDidUpdate: (pathDidUpdate: (path: string) => void) => void,
    shouldDispose: callback0
): Router {
    const routeTable = []
    let lastMatchedPath: string
    let dispatchToSubRoute: (path: path) => void
    let disposeSubrouter: trigger0
    let routeDidLeaveCallback: routeDidLeaveCallback | void

    shouldDispose.on(() => {
        if (routeDidLeaveCallback) {
            (<routeDidLeaveCallback>routeDidLeaveCallback)()
        }
    })

    registerPathDidUpdate((path) => {

        const tokens = path.split('/')
        const route = matchRoute(routeTable)(tokens)
        const matchedPath = tokens.slice(0, route && route.length || 0).join('/')

        if (matchedPath !== lastMatchedPath) {
            disposeSubrouter && disposeSubrouter.trigger()
            if (routeDidLeaveCallback) {
                (<routeDidLeaveCallback>routeDidLeaveCallback)()
            }
        }

        if (route) {
            if (matchedPath !== lastMatchedPath) {
                const dispose = disposeSubrouter = creaceCallback0()
                const subRouter = createRouter(`${basePath}/${matchedPath}`, (d) => dispatchToSubRoute = d, dispose)
                const variables = route.extractVariables(tokens)
                routeDidLeaveCallback = route && route.routeDidEnterCallback(variables, subRouter, path)
            }
            dispatchToSubRoute(tokens.slice(route.length).join('/'))
        }
        lastMatchedPath = matchedPath
    })

    return {
        register: registerWithTable(routeTable, basePath)
    }
}

let dispatch: (path: string) => void
export const router = createRouter('', (d) => dispatch = d, creaceCallback0());

export function browserPathDidChange(path: string) {
    dispatch && dispatch(path)
}

export interface Router {
    register: (route: string, routeDidEnterCallback: routeDidEnterCallback) => (map: map) => string,
}

type pathSegment = string
type path = string
type splitPath = string[]


interface map {
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

interface matchCallback {
    (extractedVariables: map, nestedRouter: Router, path: string): void
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
    callback: matchCallback
}


type RouteTable = route[]

const identity = (i) => i

/*************************
 *      Matching 
 *************************/

const exactMatch = (pattern) => (token) => pattern === token ? 1 : 0
const namedMatch = (pattern) => (token) => .9
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

/*************************
 *      Matching 
 *************************/

function set(map: map, name: string, value: any) {
    map[name] = value;
    return map
}

const namedExtract = (pattern) =>  (current: map, token: string) => set(current, pattern.substring(1), token)

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

function buildRoute(pattern: string, callback: matchCallback): route {
    const parts = pattern.split('/')
    const rank = buildRankingFunction(parts)
    const extractVariables = buildExtractVariablesFunction(parts)

    return {
        length: parts.length,
        extractVariables,
        pattern,
        rank,
        callback
    }
}

const normalisePath = (path: string) => path.match((/\/*(.*?)\/*$/))[1]
const getPathFromBrowser = () => normalisePath(`${normalisePath(window.location.pathname)}/${normalisePath(window.location.hash.substring(1))}`)


const matchRoute = (table: RouteTable) => (tokens: string[]) => {
    const sorted = table.filter(x => x.rank(tokens) > 0).sort((a, b) => b.rank(tokens) - a.rank(tokens))
    return sorted[0]
}

const registerWithTable = (routeTable: RouteTable) => (route: string, callback: matchCallback) => routeTable.push(buildRoute(route, callback))

function createRouter(routeTable: RouteTable, registerPathDidUpdate: (pathDidUpdate: (path: string) => void) => void): Router {
    let currentRoute: route
    let dispatchToSubRoute: (path: path) => void

    registerPathDidUpdate((path) => {
        path = normalisePath(path);
        const tokens = path.split('/')
        const route = matchRoute(routeTable)(tokens)
        
        if (currentRoute === route) {
            return
        }

        if(route)
        {
            const subRouter = createRouter([], (d) => dispatchToSubRoute = d)
            const variables = route.extractVariables(tokens)
            route && route.callback(variables, subRouter, path)

            dispatchToSubRoute(tokens.slice(route.length).join('/') )

        }
    })

    return {
        register: registerWithTable(routeTable)
    }
}

const rootTable = [] as RouteTable
let dispatch: (path: string) => void
export const router = createRouter(rootTable, (d) => dispatch = d);

window.addEventListener('popstate', () => {
    dispatch(getPathFromBrowser())
})
export const nav = (path) => () => {
    window.history.pushState(null, '', path)
    dispatch(getPathFromBrowser())
}

export const apply = () => dispatch(getPathFromBrowser())
export interface Router {
    register: (route: string, onMatch: matchCallback) => void,
 }

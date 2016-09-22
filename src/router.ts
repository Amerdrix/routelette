interface pathChangedCallback {
    (path: string)
}

interface matchCallback {
    (): void
}

interface matchingFunction {
    (token: string): number
}

interface rankingFunction {
    (tokens: string[]): number
}

type RouteTable =   [{path: string, rank: rankingFunction, callback: matchCallback}]

const exactMatch =    (pattern) => (token) =>  pattern === token ? 1 : 0
const namedMatch =    (pattern) => (token) => .9
const wildcardMatch = (pattern) => (token) => .8

function getMachingFunction(pattern: string): matchingFunction {
    if(pattern === '*')
        return wildcardMatch(pattern)
    if(pattern.charAt(0) === ':')
        return namedMatch(pattern)

    return exactMatch(pattern)
}

function buildRankingFunction(route: string):rankingFunction {
    return route.split('/') //  [ 'foo', 'bar', '*' ]
        .map(token => getMachingFunction(token)) // [exactMatch, exactMatch, wildcardMatch]
        .map((matchingFunction, index) => ({matchingFunction, index}))
        .reduce((rankingFunction: rankingFunction, x) => (tokens) => rankingFunction(tokens) * 2 * x.matchingFunction(tokens[x.index]), () => 1 )
}

function buildRoute(path: string, callback: matchCallback){
    const rank = buildRankingFunction(path)

    return {
        path,
        rank,
        callback
    }
}

const normalisePath = (path: string) => path.match((/\/*(.*?)\/*$/))[1]
const getPathFromBrowser = () => normalisePath(`${normalisePath(window.location.pathname)}/${normalisePath(window.location.hash.substring(1))}` )


const matchRoute = (table: RouteTable ) => (path: string) => {
    const normalisedPath = normalisePath(path).split('/')
    const sorted = table.filter(x => x.rank(normalisedPath) > 0).sort((a, b) =>  b.rank(normalisedPath) - a.rank(normalisedPath))
    return sorted[0]
}

const registerWithTable = (routeTable: RouteTable) => (route: string, callback: matchCallback) => routeTable.push(buildRoute(route, callback )) 

function createRouter(routeTable: RouteTable, registerPathDidUpdate: (pathDidUpdate: (path: string) => void) => void) {
    
    registerPathDidUpdate((path) => {
        const route = matchRoute(routeTable)(path)
        route && route.callback()
    })

    return {
        register: registerWithTable(routeTable)
    }
}

const rootTable = [] as RouteTable 
let dispatch: (path: string) => void
export const router =  createRouter(rootTable, (d) => dispatch = d);

window.addEventListener('popstate', () => {
    dispatch(getPathFromBrowser())
})
export const nav = (path) => () => {
    window.history.pushState(null, '', path)
    dispatch(getPathFromBrowser())
}

export const apply = () => dispatch(getPathFromBrowser())   
export interface Router{}

interface comparitor {
    (routeValue: string): number
}
interface rankingFunction {
    (parts: string[]): number
}

const wildcard = (_) => (_) => .1
const exactMatch =(pattern) => (part) => 1

function buildRankingFunction(path: string):rankingFunction {
    const parts = path.split('/')
    
    const rank = (receviedPath) => 1

    return () => 1
}

class NestedRouter implements Router {
    constructor(){

    }
}

class RootRouter implements Router {

    constructor() {
        this._table =  [] as any
        window.addEventListener('popstate', (pop) => {
             this.apply()
        } )
    }

    public register(path: string, callback){
        const rank = buildRankingFunction(path)

        this._table.push({
            path,
            rank,
            callback
        })
    }

    public apply(){
        const normalisedPath = `${window.location.pathname}/${window.location.hash.substring(1)}`.split('/').filter(x => !!x)
        const route = this._table.filter(x => x.rank(normalisedPath) > 0).sort((a, b) => a.rank(normalisedPath) - b.rank(normalisedPath))[0]

        route && route.callback()

    }

    private _table: [{path: string, rank: rankingFunction, callback: () => void}]
}

export interface Router{}
export const router = new RootRouter()

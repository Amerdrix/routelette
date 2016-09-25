const normalisePath = (path: string) => path.match((/\/*(.*?)\/*$/))[1]
const getPathFromBrowser = () => normalisePath(`${normalisePath(window.location.pathname)}/${normalisePath(window.location.hash.substring(1))}`)

let currentDepth = 0
let onPopstate

window.addEventListener('popstate', () => {  
    if (onPopstate){
        onPopstate()
        return;
    }
    const [state, title, path] = [window.history.state, window.document.title, window.location.pathname]
    const direction = state.depth - currentDepth 
    currentDepth = state.depth

    if(window.history.state && window.history.state.preventForward && direction === -1) {
        // The only way we can clear the forward navigation is by pushing new state
        // if we push new state without moving back then we will end up with a duplicate entry in the back direction
        // if we push before the pop has finished (history.back is async) then we will have a duplicate in the forward direction
        // if we move back when depth is zero, we go out of the current page and lose control (which is worse than duplicated history)
        if(state.depth === 0)
        {
            window.history.pushState(state, title, path)
            dispatch(path)
        }else{
            window.history.back()
            onPopstate = () => {
                window.history.pushState(state, title, path)    
                dispatch(path)
                onPopstate = null;
            }
        }
    }else{
        dispatch(getPathFromBrowser())
    }
})

export const nav = (path, {allowForward = true, display = true} = {} ) => () => {
    if(!allowForward){
        const [state, title, path] = [window.history.state, window.document.title, window.location.pathname]
        state.preventForward = true
        window.history.replaceState(state, title, path)
    }
    const depth =  window.history.state.depth + 1
    currentDepth = depth
    window.history.pushState({depth}, '', `/${normalisePath(path)}`)
    dispatch(path)
}

let dispatch: (path: string) => void = (_) => {}

export function onBrowserPathDidChange(fn: (path: string) => void ){
    dispatch = (p) => fn(normalisePath(p))
}

export const attach = () => {
    const [state, title, path] = [window.history.state || {}, window.document.title, window.location.pathname]
    state.depth = 0
    window.history.replaceState(state, title, path)
    dispatch(getPathFromBrowser())
}
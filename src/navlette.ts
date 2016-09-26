const normalisePath = (path: string) => path.match((/\/*(.*?)\/*$/))[1]
const getPathFromBrowser = () => normalisePath(`${normalisePath(window.location.pathname)}/${normalisePath(window.location.hash.substring(1))}`)
const getHistoryState = () => window.history.state || {}

let doubleBack: boolean
let onPopstate

window.addEventListener('popstate', () => {
    if (onPopstate) {
        onPopstate()
        return;
    }
    const state =getHistoryState()
    const path = state.path || getPathFromBrowser()

    if (state.preventForward) {

        // The only way we can clear the forward navigation is by pushing new state
        // if we push new state without moving back then we will end up with a duplicate entry in the back direction
        // if we push before the pop has finished (history.back is async) then we will have a duplicate in the forward direction
        // if we move back when depth is zero, we go out of the current page and lose control (which is worse than duplicated history)
        if (state.first) {
            if (state.applied) {
                return
            }
            state.applied = true
            window.history.replaceState(state, null, null)
            delete state['applied']
            delete state['first']
            window.history.pushState(state, null, null)
            dispatch(path)
        } else {
            window.history.back()
            onPopstate = () => {
                window.history.pushState(state, null, null)
                dispatch(path)
                onPopstate = null;
            }
        }
    } else {
        dispatch(path)
    }
})

export const nav = (path, {allowForward, display}: { allowForward: boolean, display: boolean } = { display: true, allowForward: true }) => () => {
    const state = window.history.state
    if (!allowForward) {
        state.preventForward = true
        if (state.first) {
            state.applied = false
        }
        window.history.replaceState(state, null, null)
    } else if (state.preventForward) {
        delete state['preventForward']
            window.history.replaceState(state, null, null)
    }

    const normalisedPath = `/${normalisePath(path)}`
    if (display) {
        window.history.pushState({}, '', normalisedPath)
    } else {
        window.history.pushState({ path: normalisedPath }, '', '')
    }

    dispatch(path)
}

let dispatch: (path: string) => void = (_) => { }

export function onBrowserPathDidChange(fn: (path: string) => void) {
    dispatch = (p) => fn(normalisePath(p))
}

export const attach = () => {
    const state = window.history.state || {}
    state.first = true
    window.history.replaceState(state, null, null)
    dispatch(getPathFromBrowser())
}
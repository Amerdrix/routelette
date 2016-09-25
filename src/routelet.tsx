import * as React from 'react'
import * as ReactDom from 'react-dom'
import { router, browserPathDidChange, Router } from './router'
import { nav, attach as attachNav, onBrowserPathDidChange } from './nav'

function render(element: React.ReactElement<any>) {
    const page = (<div>
        {element}
        <input type="text" onChange={(e) => { nav(e.target.value)() } } />

    </div>)

    ReactDom.render(page, document.querySelector('RouteletTest'))
}

interface RoutedComponent {
    (parentElement: HTMLElement, router: Router): void
}


const home: RoutedComponent = (parent, router) => {

}

const legacy: RoutedComponent = (parent, router) => { }


function page(name: string) {
    return (variables) => render(<div><h1 onClick={nav('secret', {allowForward: false, display: false}) }>{name}</h1> <h2>{variables.name}</h2></div>)
}

function notFound(_, __, path) {
    page("404")({ name: path })
}

router.register('', (_, route) => {
    page('Index')(_)
})

const test = router.register('test/:name', page('Test'))
router.register('secret', page('Secret'))
router.register('child/specific/:name', page('specific child'))
router.register('child', (_, route) => {
    console.log('Building routes for child')
    
    route.register('*', page("Child"))
    route.register(':name', page("Child -> "))

    route.register('child', (_, route) => {
        console.log('Building routes for nested child')

        route.register('*', page("Nested Child"))
        route.register(':name', page("Nested Child -> "))

        return () => {
            console.log('Dispose nested child routes')
        }
    })
    return () => {
        console.log('Dispose child routes')
    }
})

router.register('*', notFound)

onBrowserPathDidChange(browserPathDidChange)

attachNav()
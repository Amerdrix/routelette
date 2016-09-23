import * as React from 'react'
import * as ReactDom from 'react-dom'
import {nav, router, Router, apply as applyRoutes } from './router'

function render(element: React.ReactElement<any>){
    ReactDom.render(element, document.querySelector('RouteletTest'))
}

interface RoutedComponent {
    (parentElement: HTMLElement, router: Router): void
}


const home: RoutedComponent = (parent, router) => {

}

const legacy: RoutedComponent = (parent, router) => { }

function Page ({name}: {name: string})
{
    return <div>
        <h1 onClick={nav('/')}> {name}  </h1>       
    </div>
}

function page (name: string) {
    return (variables) => render(<div><h1>{name}</h1> <h2>{variables.name}</h2></div>)
}

function notFound(_, __, path){
    page("404")({name: path})     
}

router.register('', page('Index'))
router.register('test/:name', page('Test'))
router.register('child', (_, router) => {
    router.register(':name', page("Child -> "))
})

router.register('*', notFound)
applyRoutes()
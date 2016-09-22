import * as React from 'react'
import * as ReactDom from 'react-dom'
import {nav, router, Router, apply as applyRoutes } from './router'


interface RoutedComponent {
    (parentElement: HTMLElement, router: Router): void
}


const home: RoutedComponent = (parent, router) => {

}

const legacy: RoutedComponent = (parent, router) => { }

function Page ({name}: {name: string})
{
    return <div>
        <h1> {name} </h1>
        <a onClick={nav('/bar')}> Bob </a>
        <a onClick={nav('/foo')}> Foo </a>
        <a onClick={nav('/foo/baz')}> Foo and Baz </a>
    </div>
}

function page (name: string) {
    return () => ReactDom.render(<Page name={name} />, document.querySelector('RouteletTest'))
}

router.register('*', page("Index"))
router.register('foo', page("Foo"))
router.register('bar', page("Bar"))
router.register('*/baz', page("Foo and Baz"))


applyRoutes()
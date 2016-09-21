import * as React from 'react'
import * as ReactDom from 'react-dom'
import {router, Router } from './router'


interface RoutedComponent {
    (parentElement: HTMLElement, router: Router): void
}


const home: RoutedComponent = (parent, router) => {

}

const legacy: RoutedComponent = (parent, router) => { }


router.register('*', () => {
function HelloWorld ()
{
    return <div >Hello world </div>
}

ReactDom.render(<HelloWorld />, document.querySelector('RouteletTest'))
})

router.apply()

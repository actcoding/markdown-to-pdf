import { h } from 'hastscript'
import type { ComponentFunction } from 'rehype-components'

function make(type: string): ComponentFunction {
    return (props, children) => {
        return h('div', {
            class: `directive directive-${type}`,
            ...props,
        }, children)
    }
}

const DirectiveWarning = make('warning')
const DirectiveTip = make('tip')

export {
    DirectiveTip,
    DirectiveWarning,
}

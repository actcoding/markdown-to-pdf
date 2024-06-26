import { select as doSelect, type Node, type NodeLike } from 'unist-util-select'

export function select<T extends Node>(
    selector: string,
    tree?: Node | NodeLike | null | undefined
): T | undefined {
    return doSelect(selector, tree) as T
}

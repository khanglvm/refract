import { deepEqual } from './deepEqual.js'

/**
 * Use comparePropsForMemo/ compareAllPropsForMemo function to quickly compare prop(s) for React.memo
 * Usage example:
 * memo(Component, compareAllPropsForMemo) // compare all props
 * memo(Component, comparePropsForMemo('title')) // compare only 'title' prop
 * memo(Component, comparePropsForMemo(['title', 'content'])) // compare 'title' and 'content' props
 * */

type TPropsAreEqualsCallback<P> = (prevProps: P, nextProps: P) => boolean

type TProps<P> = [P, P] | [Array<keyof P>] | [keyof P]

type TArgArr<P> = [Array<keyof P>] | [keyof P]

function isSingleArgument<P, A extends TArgArr<P>>(arg: TProps<P>): arg is A {
    return arg.length === 1
}

// Overload 1: When comparePropsForMemo receives previous props and current props, it should return boolean
export function compareAllPropsForMemo<P extends object>(arg1: P, arg2: P): boolean {
    return compareProps(arg1, arg2)
}

// Overload 2: When comparePropsForMemo receives key(s) of prop that need to be compared, it should return a function to later compare props
export function comparePropsForMemo<P extends object>(arg: Array<keyof P> | keyof P): TPropsAreEqualsCallback<P>

// Implementation of comparePropsForMemo
export function comparePropsForMemo<P extends object, A extends TProps<P>>(...args: A): unknown {
    if (isSingleArgument(args)) {
        return (prevProps: P, nextProps: P): boolean => {
            return compareProps(prevProps, nextProps, Array.isArray(args[0]) ? args[0] : [args[0]])
        }
    }
    return compareProps(args[0], args[1])
}

function compareProps<P extends object>(prevProps: P, nextProps: P, comparePropKeys?: Array<keyof P>): boolean {
    return !(
        comparePropKeys || Object.keys(prevProps).filter((key) => Object.prototype.hasOwnProperty.call(prevProps, key))
    ).some((key) => !deepEqual(prevProps[key as keyof P], nextProps[key as keyof P]))
}

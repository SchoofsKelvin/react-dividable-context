
import * as React from 'react';

/** A function to compare two values, checking whether they're equal */
export type EqualFunction<T> = (a: T[keyof T], b: typeof a) => boolean;
const defaultEquals: EqualFunction<any> = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Follow the fields of an object using the given path
 * @param data The data object to start at
 * @param path The path of keys to follow
 */
function getValue(data: any, path: keyof any | (keyof any)[]) {
    path = Array.isArray(path) ? path : [path];
    for (const key in path) {
        if (!data) return data;
        data = data[key];
    }
    return data;
}

/** A component that never updates (unless forced to) */
class NoUpdateComponent extends React.Component {
    public shouldComponentUpdate(): false {
        return false;
    }
    public render() {
        return this.props.children;
    }
}

/** Properties of the ContextProvider */
export interface IContextProviderProps<T> {
    /** The current value consumers down the hierarchy should receive (unless overwritten by another Provider from the same context) */
    value: T;
}
/** Internal Component class */
export class ContextProvider<T> extends React.Component<IContextProviderProps<T> & { defaultValue: T }, any> {
    public render() {
        return <NoUpdateComponent children={this.props.children} />;
    }
}

export type abc = (keyof any)[] & ['abc'];

export type KeyArray<T> = (keyof T | (keyof any)[])[];

/** Properties of the ContextConsumer */
export interface IContextConsumerProps<T> {
    /**
     * The keys to listen to, with these specifications:
     * - `undefined` means to listen to everything
     * - The array can contain strings and "key arrays"
     * - Strings have to be fields of `T`, the data object
     * - Type checking doesn't check for keys in key arrays
     */
    keys?: KeyArray<T>;
    /** A function that, given the data provided by the nearest Provider (otherwise the defaultValue), should return a ReactNode */
    children: (data: T) => React.ReactNode;
}
/** Internal Component class */
export class ContextConsumer<T> extends React.Component<IContextConsumerProps<T> & { data: T, context: DividableContext<T> }, any> {
    public shouldComponentUpdate({ data }: Readonly<{ data: T }>) {
        // Not entirely what we would expect, but possible
        if (!this.props.data || !data) return true;
        // If we don't listen for any keys, we listen for everything
        if (!this.props.keys) return true;
        // We'll need the previous data and the equal method
        const { data: prev, context: { equals } } = this.props;
        for (const key in this.props.keys) {
            const prevValue = getValue(prev, key);
            const dataValue = getValue(prev, key);
            // If they don't match, something we care about changed
            if (!equals(prevValue, dataValue)) return true;
        }
        return false;
    }
    public render() {
        return this.props.children(this.props.data);
    }
}

/** A wrapper around a React Context, allowing consumers to only update for wanted keys */
export class DividableContext<T> {
    protected readonly nativecontext: React.Context<T>;
    /** The Provider component type, similar to ReactContext.Provider */
    public readonly provider: React.ComponentType<IContextProviderProps<T>>;
    /** The Provider component type, similar to ReactContext.Provider */
    public readonly Provider: React.ComponentType<IContextProviderProps<T>>;
    /** The Consumer component type, similar to ReactContext.Consumer */
    public readonly consumer: React.ComponentType<IContextConsumerProps<T>>;
    /** The Consumer component type, similar to ReactContext.Consumer */
    public readonly Consumer: React.ComponentType<IContextConsumerProps<T>>;
    constructor(protected defaultValue: T, public readonly equals: EqualFunction<T> = defaultEquals) {
        this.nativecontext = React.createContext(this.defaultValue);
        this.provider = this.Provider = this.nativecontext.Provider;
        this.consumer = this.Consumer = props => (
            <this.nativecontext.Consumer>
                {data => <ContextConsumer {...props} context={this} data={data} />}
            </this.nativecontext.Consumer>
        );
    }
    /**
     * @deprecated Utility function (for backwards compatibility).
     * @example
     * const Con = context.getConsumer(['abc']); return <Con>{func}</Con>
     * // acts the same as
     * return <context.Consumer keys={['abc']}>{func}</context.Consumer>
     * @param keys The keys this consumer should only update for
     */
    public getConsumer(keys: KeyArray<T>): React.ComponentType<IContextConsumerProps<T>> {
        return props => <this.Consumer {...props} keys={[...keys, ...(props.keys || [])]} children={props.children} />;
    }
}

/**
 * Create a DividableContext for the given defaultValue
 * @param defaultValue The default value to pass on to a Consumer should a Provider not be present
 * @param equals A function to compare two values for equality. Uses `JSON.stringify(a) === JSON.stringify(b)` by default
 */
export function create<T extends object>(defaultValue: T, equals?: EqualFunction<T>) {
    return new DividableContext(defaultValue, equals);
}

export default create;

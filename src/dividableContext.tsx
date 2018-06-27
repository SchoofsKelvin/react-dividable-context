
import * as React from 'react';

export type EqualFunction<T> = (a: T[keyof T], b: typeof a) => boolean;
const defaultEquals: EqualFunction<any> = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function getValue(data: any, path: keyof any | (keyof any)[]) {
    path = Array.isArray(path) ? path : [path];
    for (const key in path) {
        if (!data) return data;
        data = data[key];
    }
    return data;
}

class NoUpdateComponent extends React.Component {
    public shouldComponentUpdate(): false {
        return false;
    }
    public render() {
        return this.props.children;
    }
}

export interface IContextProviderProps<T> {
    value: T;
}
export class ContextProvider<T> extends React.Component<IContextProviderProps<T> & { defaultValue: T }, any> {
    public render() {
        return <NoUpdateComponent children={this.props.children} />;
    }
}

export interface IContextConsumerProps<T> {
    keys?: (keyof T)[];
    children: (data: T) => React.ReactNode;
}
export class ContextConsumer<T> extends React.Component<IContextConsumerProps<T> & { data: T, context: DividableContext<T> }, any> {
    public shouldComponentUpdate({ data }: Readonly<{ data: T }>) {
        if (!this.props.data || !data) return true;
        if (!this.props.keys) return true;
        const { data: prev, context: { equals } } = this.props;
        for (const key in this.props.keys) {
            const prevValue = getValue(prev, key);
            const dataValue = getValue(prev, key);
            if (!equals(prevValue, dataValue)) return true;
        }
        return false;
    }
    public render() {
        return this.props.children(this.props.data);
    }
}

export class DividableContext<T> {
    protected readonly nativecontext: React.Context<T>;
    public readonly provider: React.ComponentType<IContextProviderProps<T>>;
    public readonly Provider: React.ComponentType<IContextProviderProps<T>>;
    public readonly consumer: React.ComponentType<IContextConsumerProps<T>>;
    public readonly Consumer: React.ComponentType<IContextConsumerProps<T>>;
    constructor(protected defaultValue: T, public readonly equals: EqualFunction<T> = defaultEquals) {
        this.nativecontext = React.createContext(this.defaultValue);
        this.provider = this.Provider = this.nativecontext.Provider;
        this.consumer = this.Consumer = props => (
            <this.nativecontext.Consumer>
                { data => <ContextConsumer {...props} context={this} data={data}/>}
            </this.nativecontext.Consumer>
        );
    }
    public getConsumer(keys: (keyof T)[]): React.ComponentType<IContextConsumerProps<T>> {
        return props => <this.Consumer {...props} keys={[...keys, ...(props.keys || [])]} children={props.children} />;
    }
}

export function create<T extends object>(defaultValue: T, equals?: EqualFunction<T>) {
    return new DividableContext(defaultValue, equals);
}

export default create;

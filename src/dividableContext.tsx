
import * as React from 'react';

function getBit(keys: Array<string | number | symbol>, key: string | number | symbol) {
    const index = keys.indexOf(key);
    if (index !== -1) {
        return 2 ** index;
    }
    return 2 ** (keys.push(key) - 1);
}

export type EqualFunction<T> = (a: T[keyof T], b: typeof a) => boolean;
const defaultEquals: EqualFunction<any> = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export interface IConsumerProps<T> {
    children: (value: T) => React.ReactNode;
}

export type ContexterConsumer<T> = React.ComponentType<IConsumerProps<T>>;

function createConsumerClass<T>(Consumer: React.ComponentType<React.ConsumerProps<T>>, bits: number): ContexterConsumer<T> {
    const consumerProps = {
        observedBits: bits,
        unstable_observedBits: bits,
    };
    // tslint:disable-next-line:no-shadowed-variable
    return class ContexterConsumer extends React.Component<IConsumerProps<T>, any, any> {
        constructor(props: IConsumerProps<T> & { children?: React.ReactNode; }, context?: any) {
            super(props, context);
        }
        public render() {
            return <Consumer {...consumerProps}>
                {this.props.children}
            </Consumer>;
        }
    } as any;
}

class NoUpdateComponent extends React.Component {
    public shouldComponentUpdate(): false {
        return false;
    }
    public render() {
        return this.props.children;
    }
}

export class DividableContext<T> {
    public readonly provider: React.ComponentType<React.ProviderProps<T>>;
    public readonly Provider: React.ComponentType<React.ProviderProps<T>>;
    public readonly consumer = this.context.Consumer;
    public readonly Consumer = this.consumer;
    constructor(protected context: React.Context<T>, protected keys: Array<keyof T>) {
        this.provider = this.Provider = props => (
            <this.context.Provider value={props.value}>
                <NoUpdateComponent children={props.children} />
            </this.context.Provider>
        );
    }
    public getConsumer<K extends keyof T>(keys: K[]): ContexterConsumer<T> {
        const bits = keys.reduce((result, key) => result | getBit(this.keys, key), 0);
        return createConsumerClass(this.context.Consumer, bits);
    }
}

export function create<T extends object>(defaultValue: T, equals: EqualFunction<T> = defaultEquals) {
    const keys: Array<keyof T> = [];
    const context = React.createContext(defaultValue, (prev, next) => {
        let result = 0;
        for (const key in prev) {
            if (!equals(prev[key], next[key])) {
                result = result | getBit(keys, key);
            }
        }
        for (const key in next) {
            if (!equals(prev[key], next[key])) {
                result = result | getBit(keys, key);
            }
        }
        return result;
    });
    return new DividableContext(context, keys);
}

export default create;

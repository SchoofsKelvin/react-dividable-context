
# react-dividable-context

[![GitHub package version](./github.png)](https://github.com/SchoofsKelvin/react-dividable-context) 
[![NPM](./npm.png)](https://www.npmjs.com/package/react-dividable-context) 

Demo available on [GitHub Pages](http://github.morle.ga/react-dividable-context/).

## API
Similar to the [official context API](https://reactjs.org/docs/context.html) added in React 16.3, which is what gets used by this module internally.
```ts
// Check whether two values are the same
// Uses `JSON.stringify(a) === JSON.stringify(b)` by default
type EqualsFunction<T> = (a: T, b: T) => boolean;

// Create a new context
const context = create(defaultValue: T, EqualsFunction<T>);

// The provider/consumer as provided by React.createContext
const provider = <context.provider/>; // See note below!
const consumer = <context.consumer/>;

// A consumer that only updates if the given field(s) update
const partialConsumer = context.getConsumer(['fieldA', 'fieldB']);
```

**Important**: Unlike the official Provider, the one exposed by context prevents its children from updating. This allows wrapping your app in the provider and updating the `value` prop, without it having re-rendering the whole app. *All (descendant) consumers will still update.*
```ts
const context = create({});
// ...
    <context.provider value={{}}>
        <p>This will never update! {Date.now()}</p>
        <context.consumer>
            {data => <p>This one updates, though. {Date.now()}</p>}
        </context.consumer>
    </context.provider>
// ...
```

## Usage
```bash
npm install --save react-dividable-context;
# or
yarn add react-dividable-context;
```

```ts
import * as React from 'react';
import create from 'react-dividable-context';

// Our demo data
interface ITest {
  abc: string;
  def: number;
  idk: number[];
}

// Create the context, similar to React.createContext
const contexter = create({ abc: 'ABC', def: 123, idk: [0] });
const ConsumerABC = contexter.getConsumer(['abc']);
const ConsumerMixed = contexter.getConsumer(['abc', 'def']);

interface IAppState {
  test: ITest;
}
class App extends React.Component<any, IAppState> {
  constructor(props: any, context?: any) {
    super(props, context);
    this.state = { test: { abc: 'ABC', def: 123, idk: [0] } };
  }
  public render() {
      return (
          <context.provider value={this.state.value}>
            <context.consumer>
                {test => <p>Something changed! {Date.now()}</p>}
            </context.consumer>
            <ConsumerABC>
                {test => <p>Field 'abc' changed! {Date.now()}</p>}
            </ConsumerABC>
            <ConsumerMixed>
                {test => <p>Field 'abc' and/or 'def' changed! {Date.now()}</p>}
            </ConsumerMixed>
          </context.provider>
      )
  }
}
```
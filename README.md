
# react-dividable-context

[![GitHub package version](https://raw.githubusercontent.com/SchoofsKelvin/react-dividable-context/master/github.png)](https://github.com/SchoofsKelvin/react-dividable-context) 
[![NPM](https://raw.githubusercontent.com/SchoofsKelvin/react-dividable-context/master/npm.png)](https://www.npmjs.com/package/react-dividable-context) 
[![Donate](https://raw.githubusercontent.com/SchoofsKelvin/react-dividable-context/master/paypal.png)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=XUZDN9LQ3MDV8)

Demo available on [GitHub Pages](http://github.morle.ga/react-dividable-context/).

## API
Similar to the [official context API](https://reactjs.org/docs/context.html) added in React 16.3, which is what gets used by this module internally.
```ts
// Check whether two values are the same
// Uses `JSON.stringify(a) === JSON.stringify(b)` by default
type EqualsFunction<T> = (a: T, b: T) => boolean;

// Create a new context
const context = create(defaultValue: T, EqualsFunction<T>);

// The provider/consumer, similar to the ones from React Context
const provider = <context.Provider/>; // See note below!
const consumer = <context.Consumer/>;

// A consumer that only updates if the given field(s) update
const partialConsumer = context.getConsumer(['fieldA', 'fieldB']);

// Otherwise, we can also use the "main" one with the "keys" property
const listenToFieldA = <context.Consumer keys={['fieldA']} />;

// We can mix a partial and the "keys" prop too
// This one will listen to fieldA, fieldB and fieldC
const listenToSeveral = <partialConsumer keys={['fieldC']} />;

// We can also check for "sub keys"
// This'll listen to fieldA and fieldB.subA
const listenForSubKey = <context.Consumer keys={['fieldA', ['fieldB', 'subA']]} />;
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
          <context.provider value={this.state.test}>
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
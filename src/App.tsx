import * as React from 'react';
import './App.css';

import create from 'react-dividable-context';
import logo from './logo.svg';

interface ITestData {
  abc: string;
  def: number;
  idk: number[];
  sub: {
    subAbc: string;
    subDef: number;
    subIdk: number[];
  }
}

const defaultTest: ITestData = {
  abc: 'ABC',
  def: 123,
  idk: [0],
  sub: {
    subAbc: 'ABC',
    subDef: 123,
    subIdk: [0]
  },
};

const contexter = create(defaultTest);
const ConsumerABC = contexter.getConsumer(['abc', ['sub', 'subAbc']]);
// const ConsumerDEF // Let's use the keys prop for this one
const ConsumerMixed = contexter.getConsumer(['abc', ['sub', 'subAbc']]); // Also use key prop to also listen to 'def'

interface INotifierProps {
  name: string;
}

class Notifier extends React.Component<INotifierProps> {
  public render() {
    // tslint:disable-next-line:no-console
    console.log(`Notifier '${this.props.name}' got rendered`);
    return this.props.children;
  }
}

// tslint:disable-next-line:max-classes-per-file
class BlockingNotifier extends Notifier {
  public shouldComponentUpdate() {
    return false;
  }
}

interface IAppState {
  test: ITestData;
}

// tslint:disable-next-line:max-classes-per-file
class App extends React.Component<any, IAppState> {
  constructor(props: any, context?: any) {
    super(props, context);
    this.state = { test: { ...defaultTest } };
  }
  public render() {
    // tslint:disable-next-line:no-console
    console.log('Rendering App', this.state.test);
    return (
      <contexter.provider value={this.state.test}>
        <BlockingNotifier name="App children">
          <div className="App">
            <header className="App-header">
              <img src={logo} className="App-logo" alt="logo" />
              <h1 className="App-title">Welcome to React</h1>
            </header>
            <div>
              <h2>Button</h2>
              <button onClick={this.changeAbc}>Change ABC</button>
              <button onClick={this.changeDef}>Change DEF</button>
              <button onClick={this.changeIdk}>Change IDK</button>
              <button onClick={this.changeSubAbc}>Change SubABC</button>
              <button onClick={this.changeSubDef}>Change SubDEF</button>
              <button onClick={this.changeSubIdk}>Change SubIDK</button>
              <button onClick={this.changeAll}>Change all</button>
            </div>
            <contexter.consumer>
              {test => <Notifier name="Consumer">
                <h2>Consumer</h2>
                <b>{new Date().toISOString()}</b>
                <p>ABC: {test.abc} | {test.sub.subAbc}</p>
                <p>DEF: {test.def} | {test.sub.subDef}</p>
                <p>IDK: {test.idk.join(', ')} | {test.sub.subIdk.join(', ')}</p>
              </Notifier>}
            </contexter.consumer>
            <ConsumerABC>
              {test => <Notifier name="ConsumerABC">
                <h2>ConsumerABC</h2>
                <b>{new Date().toISOString()}</b>
                <p>ABC: {test.abc} | {test.sub.subAbc}</p>
              </Notifier>}
            </ConsumerABC>
            <contexter.consumer keys={['def', ['sub', 'subDef']]}>
              {test => <Notifier name="ConsumerDEF">
                <h2>ConsumerDEF</h2>
                <b>{new Date().toISOString()}</b>
                <p>DEF: {test.def} | {test.sub.subDef}</p>
              </Notifier>}
            </contexter.consumer>
            <ConsumerMixed keys={['def', ['sub', 'subDef']]}>
              {test => <Notifier name="ConsumerMixed">
                <h2>ConsumerMixed</h2>
                <b>{new Date().toISOString()}</b>
                <p>ABC: {test.abc} | {test.sub.subAbc}</p>
                <p>DEF: {test.def} | {test.sub.subDef}</p>
              </Notifier>}
            </ConsumerMixed>
          </div>
        </BlockingNotifier>
      </contexter.provider>
    )
  }
  protected changeAbc = () => this.setState(({ test }) => ({ test: { ...test, abc: Date.now().toString(16) } }));
  protected changeDef = () => this.setState(({ test }) => ({ test: { ...test, def: test.def + 1 } }));
  protected changeIdk = () => this.setState(({ test }) => ({ test: { ...test, idk: [...test.idk, test.idk.length] } }));
  protected changeSubAbc = () => this.setState(({ test }) => ({ test: { ...test, sub: { ...test.sub, subAbc: Date.now().toString(16) } } }));
  protected changeSubDef = () => this.setState(({ test }) => ({ test: { ...test, sub: { ...test.sub, subDef: test.sub.subDef + 1 } } }));
  protected changeSubIdk = () => this.setState(({ test }) => ({ test: { ...test, sub: { ...test.sub, subIdk: [...test.sub.subIdk, test.sub.subIdk.length] } } }));
  protected changeAll = () => this.setState(({ test }) => ({
    test: {
      ...test, abc: Date.now().toString(16), def: test.def + 1, idk: [...test.idk, test.idk.length],
      sub: { subAbc: Date.now().toString(16), subDef: test.sub.subDef + 1, subIdk: [...test.sub.subIdk, test.sub.subIdk.length] }
    }
  }));
}

export default App;

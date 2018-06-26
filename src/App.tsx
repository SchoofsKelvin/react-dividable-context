import * as React from 'react';
import './App.css';

import create from 'react-dividable-context';
import logo from './logo.svg';

interface ITest {
  abc: string;
  def: number;
  idk: number[];
}

const contexter = create({ abc: 'ABC', def: 123, idk: [0] });
const ConsumerABC = contexter.getConsumer(['abc']);
const ConsumerDEF = contexter.getConsumer(['def']);
const ConsumerMixed = contexter.getConsumer(['abc', 'def']);

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
  test: ITest;
}

// tslint:disable-next-line:max-classes-per-file
class App extends React.Component<any, IAppState> {
  constructor(props: any, context?: any) {
    super(props, context);
    this.state = { test: { abc: 'ABC', def: 123, idk: [0] } };
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
              <button onClick={this.changeAll}>Change all</button>
            </div>
            <contexter.consumer>
              {test => <Notifier name="Consumer">
                <h2>Consumer</h2>
                <b>{new Date().toISOString()}</b>
                {(() => {
                  // tslint:disable-next-line:no-console
                  console.log('test', test);
                })()}
                <p>ABC: {test.abc}</p>
                <p>DEF: {test.def}</p>
                <p>IDK: {test.idk && test.idk.join(', ')}</p>
              </Notifier>}
            </contexter.consumer>
            <ConsumerABC>
              {test => <Notifier name="ConsumerABC">
                <h2>ConsumerABC</h2>
                <b>{new Date().toISOString()}</b>
                <p>ABC: {test.abc}</p>
              </Notifier>}
            </ConsumerABC>
            <ConsumerDEF>
              {test => <Notifier name="ConsumerDEF">
                <h2>ConsumerDEF</h2>
                <b>{new Date().toISOString()}</b>
                <p>DEF: {test.def}</p>
              </Notifier>}
            </ConsumerDEF>
            <ConsumerMixed>
              {test => <Notifier name="ConsumerMixed">
                <h2>ConsumerMixed</h2>
                <b>{new Date().toISOString()}</b>
                <p>ABC: {test.abc}</p>
                <p>DEF: {test.def}</p>
              </Notifier>}
            </ConsumerMixed>
          </div>
        </BlockingNotifier>
      </contexter.provider>
    )
  }
  protected changeAbc = () => this.setState(({ test }) => ({ test: { ...test, abc: new Date().toString() } }));
  protected changeDef = () => this.setState(({ test }) => ({ test: { ...test, def: test.def + 1 } }));
  protected changeIdk = () => this.setState(({ test }) => ({ test: { ...test, idk: [...test.idk, test.idk.length] } }));
  protected changeAll = () => this.setState(({ test }) => ({ test: { ...test, abc: new Date().toString(), def: test.def + 1, idk: [...test.idk, test.idk.length] } }));
}

export default App;

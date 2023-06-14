import JSDOMEnvironment from 'jest-environment-jsdom';

export default class FixJSDOMEnvironment extends JSDOMEnvironment {
  constructor(...args: ConstructorParameters<typeof JSDOMEnvironment>) {
    super(...args);

    // Reason: https://github.com/jsdom/jsdom/issues/3363
    this.global.structuredClone = (val: any) => JSON.parse(JSON.stringify(val.toString()));
  }
}

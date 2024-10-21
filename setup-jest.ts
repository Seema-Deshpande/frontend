import 'jest-preset-angular/setup-jest';
import * as _ from 'lodash';
import { ngMocks } from 'ng-mocks';

ngMocks.autoSpy('jest');

window['structuredClone'] = (val) => JSON.parse(JSON.stringify(val));

Object.defineProperty(window, 'CSS', { value: null });
Object.defineProperty(window, 'getComputedStyle', {
  value: () => {
    return {
      display: 'none',
      appearance: ['-webkit-appearance']
    };
  }
});

Object.defineProperty(document, 'doctype', {
  value: '<!DOCTYPE html>'
});
Object.defineProperty(document.body.style, 'transform', {
  value: () => {
    return {
      enumerable: true,
      configurable: true
    };
  }
});

const originalConsoleError = console.error;
console.error = function (msg) {
  if (_.startsWith(msg, 'Error: Could not parse CSS stylesheet')) return;
  originalConsoleError(msg);
};

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

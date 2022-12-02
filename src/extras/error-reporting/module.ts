import '../../types.d';
import Honeybadger from '../../../node_modules/@honeybadger-io/js/dist/browser/honeybadger';

let initialized = false;

export const reportError: ErrorReportFunction = (error, context) => {
};

function initialize() {
  Honeybadger.configure({
    apiKey
  });
}

import '../../types.d';

import env from '../../generated/env';
const Honeybadger = require('@honeybadger-io/js');

declare let window: WindowWithKomojuGlobals;
let initialized = false;

// This module wraps Honeybadger since that's what we happen to use.
// If we switch to a different service, all we have to do is change this module.
export const reportError: ErrorReportFunction = (error, context) => {
  if (window.komojuErrorReporting === false) return;
  if (!initialized) initialize();
  console.error(error, context);
  Honeybadger.setContext(context);
  Honeybadger.notify(error);
};

function initialize() {
  Honeybadger.configure({
    apiKey: env.HONEYBADGER_API_KEY,
    environment: env.ENV,
    revision: env.GIT_REV,
    filters: ['number', 'cvc', 'verification_value'],
    // We don't want to receive reports for every error in every website...
    enableUncaught: false,
  });
  initialized = true;
}

# KOMOJU Hosted Fields

KOMOJU Hosted Fields (or KOMOJU Fields) is a JavaScript library that allows you to collect sensitive payment information in a PCI-compliant way. It is a drop-in replacement for the standard HTML form fields, and is designed to be easy to integrate into your website.

KOMOJU Fields is built using [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) and no dependencies, making it lean and easy to use regardless of whether you use React, Vue, or plain HTML.

## Usage

NOTE: currently under heavy development, so this example may quickly become outdated.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>KOMOJU Fields example</title>

  <!-- Include the fields.js script. -->
  <script type="module" src="https://multipay.komoju.com/fields.js"></script>
</head>
<body>
  <form id="form">
    <!-- Optional payment method picker. -->
    <komoju-picker></komoju-picker>

    <!-- Payment input fields. Contents are dynamic based on the Session's payment types. -->
    <komoju-fields
      session-id="SESSION_ID_FROM_KOMOJU_API"
      publishable-key="YOUR_PUBLISHABLE_KEY"
    ></komoju-fields>

    <!-- The komoju-input element will automatically take over the parent form submit logic. -->
    <!-- Alternatively, you can call document.querySelector('komoju-fields').submit() to submit. -->
    <button type="submit">Pay</button>
  </form>
</body>
</html>
```

Since KOMOJU Fields is built using modern web technologies, it will only work on recently updated web browsers. For a full list of supported browsers, see [Can I use Custom Elements?](https://caniuse.com/#feat=custom-elementsv1). Payments is security critical, and so supporting older browsers is not a priority for us.

### Full list of attributes

Here are the attributes accepted by the `<komoju-fields>` tag:

#### `session`

```html
<!-- Avoid a round-trip by passing the entire KOMOJU Session JSON -->
<komoju-fields
  session="{...}"
  publishable-key="YOUR_PUBLISHABLE_KEY"
></komoju-fields>
```

#### `payment-type`

This is only useful if you're creating sessions that support multiple payment types. Alternatives are:
1. use `<komoju-picker>`, or
2. create a session with only one payment type.

```html
<!-- Pre-select payment type. -->
<komoju-fields
  payment-type="konbini"
  session-id="SESSION_ID_FROM_KOMOJU_API"
  publishable-key="YOUR_PUBLISHABLE_KEY"
></komoju-fields>

<!-- You can change this payment-type attribute during runtime too. -->
<!-- This can be used to make your own payment method picker. -->
<script>
  const fields = document.querySelector('komoju-fields');
  fields.paymentType = 'credit_card';
</script>
```

#### `locale`

```html
<!-- Override the session's default_locale. -->
<komoju-fields
  locale="ja"
  session-id="SESSION_ID_FROM_KOMOJU_API"
  publishable-key="YOUR_PUBLISHABLE_KEY"
></komoju-fields>

<!-- This can also be updated at runtime. -->
<script>
  const fields = document.querySelector('komoju-fields');
  fields.locale = 'en';
</script>
```

#### `token` and `name`

```html
<!-- 'token' is a boolean attribute that activates token mode -->
<komoju-fields
  token name="komoju_token"
  session="{...}"
  publishable-key="YOUR_PUBLISHABLE_KEY"
></komoju-fields>

<!-- You can either submit the form normally, or obtain the token via JS: -->
<script>
  (async () => {
    const fields = document.querySelector('komoju-fields');
    const token = await fields.submit();
    console.log(token);
  })()
</script>
```

### Submitting the form

KOMOJU Fields does not handle form submission. Implementers have 2 options:
1. Place your `<komoju-fields>` tag inside a `<form>`, and let the `<komoju-fields>` element take over the form's submit logic.
2. Call `document.querySelector('komoju-fields').submit()` to submit the fields.

If you choose optiona 1, regular form submission will not occur.
If you choose option 2, you do not need a `<form>` tag.

Once submitted, the `<komoju-fields>` element will run validations, then attempt to submit the payment for processing. If there is a processing error, it will emit a `komoju-error` event.

```javascript
const fields = document.querySelector('komoju-fields');

// This is optional. An error message is displayed by default.
fields.addEventListener('komoju-error', (event) => {
  console.error(event.detail.error);

  // By default, <komoju-fields> will display the error message on the UI.
  // If you want to prevent this, call event.preventDefault().
});

fields.submit();
// NOTE! validation errors do not emit komoju-error. This is for server-side
// processing errors.
// You can listen for 'komoju-invalid' to handle validation errors.
```

#### Special case: token mode

If you use the `token` attribute, the `<form>` tag auto-submit will behave a little differently.

Instead of auto-redirecting, the `<form>` tag will be submitted normally, with an `<input type="hidden">` tag containing the token.

```html
<form method="post" action="/my/payment/endpoint">
  <komoju-fields
    token
    name="my_komoju_token"
    session-id="SESSION_ID_FROM_KOMOJU_API"
    publishable-key="YOUR_PUBLISHABLE_KEY"
  ></komoju-fields>

  <button type="submit">Pay</button>
</form>
```

In this example, clicking on the submit button will submit the form like normal. On your server, the token will be available the POST body alongside all other `<input>` values (e.g. `my_komoju_token=tok_abc123`).

### Turning off error reporting

In order to improve the product, KOMOJU Fields sends error reports to Honeybadger by default.

If you want to turn this off, you can add the following to your HTML:

```html
<script>
  window.komojuErrorReporting = false;
</script>
```

This will prevent KOMOJU Fields from pulling any Honeybadger or error-related code, also resulting in a decreased bundle size. Just know that if you do this, it may be harder for us to help you troubleshoot errors (of course, we try not to throw errors in the first place!).

## Hacking

```bash
npm install

# To start the server with auto-build:
bin/dev.sh # equivalent to running both bin/test-app.sh and bin/watch.sh

# If you want to use your system's esbuild, run:
ESBUILD=esbuild bin/dev.sh
# (by default it uses `npx esbuild` where 99% of the time is spent in `npx`!)
```

http://localhost:3000/ <- demo page that fetches a new session from KOMOJU

http://localhost:3000/easy <- demo page that uses a pre-generated session (fast to load, easy to rapidly iterate, but can't submit payments)

http://localhost:3000/picker <- demo page with the payment method picker and a theme

### Tech stack

* [`esbuild`](https://esbuild.github.io/) for building JavaScript bundles
* [`tsc`](https://www.typescriptlang.org/docs/handbook/compiler-options.html) more as a linter than a compiler
* [`bin/*.sh`](https://github.com/degica/komoju-fields/tree/main/bin) scripts for building, linting, etc
* [`express`](https://expressjs.com/) for serving the demo page and making real KOMOJU test sessions
* [`cypress`](https://www.cypress.io/) for automated tests

The build script produces multiple separate bundles: a **main bundle** and **one bundle for each supported payment method**. This means users only fetch the code for the payment methods that are actually used in a given session. The **main bundle** uses [**dynamic import**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) to load the payment method bundles on demand.

Build artifacts:
* `dist/fields.js` the main bundle
* `dist/fields/*/module.js` individual payment method bundles
* `dist/static/*` static assets (e.g. icons, stylesheets)
* `src/generated/*` generated TypeScript files (see `bin/generate.sh`)

To run the test server manually without `bin/test-app.sh`:
```sh
cd test-app
npm install
npm run start
```

### Architecture / philosophy

Here are some of the design decisions that went into this project.

* **No runtime dependencies**. We don't want to force implementers to use a specific framework or library. We also don't want to send an entire copy of a large framework to customers' browsers just for a couple of input tags. This project is simple enough to be built with just the browser's built-in APIs.
* **Test/build-time dependencies OK**. Test and dev are not as security or performance critical as production. Developer productivity is important as long as it doesn't sacrifice end-user performance.
* **Simple scripts for building**. We want to be able to build this project without having to learn a complex build system. Using simple shell scripts also has the advantage of more control. It's easy to say "I want 1 bundle for each payment method", or "generate this file based on this other file". And it's fast thanks to esbuild!

### Things to watch out for

* Cypress has [a lot of issues regarding Shadow DOM interaction](https://github.com/cypress-io/cypress/issues?q=is%3Aissue+is%3Aopen+label%3A%22topic%3A+shadow+dom%22+). We work around this by clicking random elements, using `{ force: true }` a lot, and emitting blur events manually.
* If multiple payment method modules import the same code, that code will be duplicated in each bundle. This is OK for small functions, but if you're importing something big, you should consider moving it to the main bundle and explicitly passing it into the payment method module.

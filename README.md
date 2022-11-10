# KOMOJU Hosted Fields

KOMOJU Hosted Fields (or KOMOJU Fields) is a JavaScript library that allows you to collect sensitive payment information in a PCI-compliant way. It is a drop-in replacement for the standard HTML form fields, and is designed to be easy to integrate into your website.

KOMOJU Fields is built using [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) and no dependencies, making it lean and easy to use regardless of whether you use React, Vue, or plain HTML.

## Usage

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

Since KOMOJU Fields is built using modern web technologies, it will only work on web browsers that have been updated since around 2020. For a full list of supported browsers, see [Can I use Custom Elements?](https://caniuse.com/#feat=custom-elementsv1). Using the latest features is great, but also payments is security-critical, so we do not support older browsers.

## Hacking

Here's a rundown of the "stack":

* `esbuild` for building the JavaScript bundle
* `tsc` more as a linter than a compiler
* `bin/*.sh` simple scripts for building and linting each bundle
* `express` for serving the demo page and making real KOMOJU test sessions

The build script produces multiple separate bundles: a **main bundle** and **one bundle for each supported payment method**. This allows us to only send the code for the payment methods that are actually used in a given session. The **main bundle** uses [**dynamic import**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) to load the payment method bundles on demand.

To run the test server:
```sh
cd test-app
npm run start
```

http://localhost:3000/ <- demo page that fetches a new session from KOMOJU
http://localhost:3000/easy <- demo page that uses a pre-generated session (fast to load, easy to rapidly iterate)

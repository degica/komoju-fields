import { promises as fs } from 'fs'
import generateTestSession from './test-session.mjs'
import fetch from 'node-fetch'
import express from 'express'
const app = express()
const port = 3000

app.use(express.urlencoded({ extended: false }))
app.set('view engine', 'ejs')
app.set('views', process.cwd())

// Log requests
app.use((req, res, next) => {
  next();
  console.log(`${req.method} ${req.path} -> ${res.statusCode}`);
  if (req.query && Object.keys(req.query).length > 0) {
    console.log(req.query);
  }
});

// Your secret key must stay on your backend. Don't leak it onto the frontend!
const KOMOJU_SECRET_KEY = 'degica-mart-test';

// Most of the time, you'd want this to be https://komoju.com.
const KOMOJU_API_URL = process.env['KOMOJU'] ?? 'https://komoju.com';

// Your publishable key is safe to share with the frontend.
const KOMOJU_PUBLISHABLE_KEY = process.env['PUBLISHABLE_KEY']
                             ?? (KOMOJU_API_URL === 'https://komoju.com'
                                 ? 'pk_d6acce1f17e4468c30833b666d9006f100e9fa8c'
                                 : 'pk_degica-mart-test');


app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  next()
})
app.use('/', express.static('../dist'))

async function showTestPage(req, res, options) {
  res.set('content-type', 'text/html')

  const komojuSessionResponse = await fetch(`${KOMOJU_API_URL}/api/v1/sessions`, {
    method: 'POST',
    headers: komojuHeaders(),
    body: JSON.stringify({
      amount: 6000,
      currency: 'USD',
      default_locale: 'en',
      payment_data: {
        external_order_num: `order-${Math.floor(Math.random() * 1000000000)}`,
      },
      payment_types: [
        'credit_card',
        'bank_transfer',
        'konbini',
        'paypay',
        'aupay',
        'alipay',
        'giropay',
      ],
      return_url: testappUrl(req, '/paymentcomplete'),
    })
  })
  const session = await komojuSessionResponse.json()
  if (session.error) {
    console.error(session);
    res.send('Error creating KOMOJU session.<br><pre>'+JSON.stringify(session, null, 2)+'</pre>');
    return;
  }

  res.render(options.template ?? 'index', {
    sessionString: '',
    session,
    publishableKey: KOMOJU_PUBLISHABLE_KEY,
    cdn: testappUrl(req, '/'),
    api: KOMOJU_API_URL,
    payment_type: options.payment_type,
  })
}

/*
 ****************************************************************
 * GET /
 *
 * This is the main example. It creates a new KOMOJU session and renders
 * payment fields for it.
 ****************************************************************
 */
app.get('/', async (req, res) => {
  showTestPage(req, res, {})
})

/*
 ****************************************************************
 * GET /picker
 *
 * Similar to the main example except it uses our payment type picker.
 ****************************************************************
 */
app.get('/picker', async (req, res) => {
  showTestPage(req, res, { template: 'picker' })
})

/*
 ****************************************************************
 * GET /token
 * POST /token
 *
 * Similar to the main example except it uses "token" mode.
 * The POST handler is for form submit.
 ****************************************************************
 */
app.get('/token', async (req, res) => {
  showTestPage(req, res, { template: 'token' })
})
app.post('/token', async (req, res) => {
  const { session_id, komoju_token } = req.body;

  const komojuPayResponse = await fetch(`${KOMOJU_API_URL}/api/v1/sessions/${session_id}/pay`, {
    method: 'POST',
    headers: komojuHeaders(),
    body: JSON.stringify({
      payment_details: komoju_token
    }),
  })
  const pay = await komojuPayResponse.json()
  if (pay.error) {
    throw new Error(JSON.stringify(pay.error))
  }
  res.redirect(pay.redirect_url)
});

/*
 ****************************************************************
 * GET /type/:payment_type
 *
 * This is the same as the main example except it pre-selects a payment type.
 ****************************************************************
 */
// Special case for credit_card: we want to be able to specify supported brands for testing brand validation.
app.get('/type/credit_card', async (req, res) => {
  const brands = req.query['brands'];
  if (brands) {
    res.render('index', {
      session: { id: '' },
      sessionString: JSON.stringify(generateTestSession({
        brands: brands.split(/\s*,\s*/),
      })),
      publishableKey: KOMOJU_PUBLISHABLE_KEY,
      cdn: testappUrl(req, '/'),
      api: KOMOJU_API_URL,
      payment_type: 'credit_card',
    })
  }
  else {
    showTestPage(req, res, { payment_type: 'credit_card' })
  }
})
app.get('/type/:payment_type', async (req, res) => {
  const { payment_type } = req.params;
  showTestPage(req, res, { payment_type })
})

/*
 ****************************************************************
 * GET /double
 *
 * This is an example where there are two <komoju-fields> tags under one form element.
 * This is similar to how WooCommerce works, so we want to test that this kind of setup
 * works.
 ****************************************************************
 */
app.get('/double', async (req, res) => {
  showTestPage(req, res, { template: 'double' })
})

app.get('/easy', async (req, res) => {
  const { currency, exchangerate } = req.query;

  res.set('content-type', 'text/html')
  res.render('index', {
    session: { id: '' },
    sessionString: JSON.stringify(generateTestSession({
      currency, exchangerate
    })),
    publishableKey: KOMOJU_PUBLISHABLE_KEY,
    cdn: testappUrl(req, '/'),
    api: KOMOJU_API_URL,
    payment_type: null,
  })
})

/*
 ****************************************************************
 * GET /paymentcomplete
 * 
 * Dummy handler for return_url. It's a basic "thanks for your payment" page.
 ****************************************************************
 */
app.get('/paymentcomplete', async (req, res) => {
  const sessionId = req.query['session_id'];

  const komojuSessionResponse = await fetch(`${KOMOJU_API_URL}/api/v1/sessions/${sessionId}`, {
    method: 'GET',
    headers: komojuHeaders(),
  })
  const session = await komojuSessionResponse.json()

  res.render('thanks', {
    session,
    publishableKey: KOMOJU_PUBLISHABLE_KEY,
    cdn: testappUrl(req, '/'),
    api: KOMOJU_API_URL,
  })
});

function komojuHeaders() {
  return {
    'authorization': `Basic ${Buffer.from(KOMOJU_SECRET_KEY + ':').toString('base64')}`,
    'content-type': 'application/json',
  }
}

function testappUrl(req, path) {
  const host = req.get('x-forwarded-host') ?? 'localhost:3000';
  const scheme = req.get('x-forwarded-scheme') ?? 'http';
  const url = new URL(path, `${scheme}://${host}`);
  return url.toString();
}

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

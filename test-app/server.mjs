import { promises as fs } from 'fs'
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

// Your publishable key is safe to share with the frontend.
const KOMOJU_PUBLISHABLE_KEY = 'pk_degica-mart-test';

// Most of the time, you'd want this to be https://komoju.com.
const KOMOJU_API_URL = process.env['KOMOJU'] ?? 'https://komoju.com';

/*
 ****************************************************************
 * GET /fields.js, /fields/*
 * 
 * These are the KOMOJU Fields JS payload.
 * In production, they're served from the KOMOJU CDN.
 ****************************************************************
 */
app.get('/fields.js', async (req, res) => {
  res.set('Content-Type', 'application/javascript')
  res.send(await fs.readFile('../dist/fields.js', 'utf8'))
});
app.get('/fields/:payment_type/module.js', async (req, res) => {
  const paymentType = req.params['payment_type'].replace(/[^a-z0-9_]/g, '')
  res.set('Content-Type', 'application/javascript')
  res.send(await fs.readFile(`../dist/fields/${paymentType}/module.js`, 'utf8'))
});

/*
 ****************************************************************
 * GET /
 * 
 * This is the main example. It creates a new KOMOJU session and renders
 * payment fields for it.
 ****************************************************************
 */
app.get('/', async (_req, res) => {
  res.set('content-type', 'text/html')

  const komojuSessionResponse = await fetch(`${KOMOJU_API_URL}/api/v1/sessions`, {
    method: 'POST',
    headers: komojuHeaders(),
    body: JSON.stringify({
      amount: 6000,
      currency: 'JPY',
      payment_data: {
        external_order_num: `order-${Math.floor(Math.random() * 100)}`,
      },
      return_url: 'http://localhost:3000/paymentcomplete',
    })
  })
  const session = await komojuSessionResponse.json()
  if (session.error) {
    console.error(session);
    res.send('Error creating KOMOJU session.<br><pre>'+JSON.stringify(session, null, 2)+'</pre>');
  }

  res.render('index', {
    session,
    publishableKey: KOMOJU_PUBLISHABLE_KEY,
    cdn: 'http://localhost:3000',
    api: KOMOJU_API_URL,
  })
})

/*
 ****************************************************************
 * GET /paymentcomplete
 * 
 * Dummy handler for return_url. It's a basic "thanks for your payment" page.
 ****************************************************************
 */
app.get('/paymentcomplete', async (_req, res) => {
  res.set('content-type', 'text/html')
  res.send('<h1>thanks for your payment!</h1>')
});

function komojuHeaders() {
  return {
    'authorization': `Basic ${Buffer.from(KOMOJU_SECRET_KEY + ':').toString('base64')}`,
    'content-type': 'application/json',
  }
}

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

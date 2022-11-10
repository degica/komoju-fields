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

const FULL_SESSION = "{\"id\":\"cx22xxvn08lpejetb1qeb15ni\",\"resource\":\"session\",\"mode\":\"payment\",\"amount\":6000,\"currency\":\"JPY\",\"session_url\":\"http://localhost:50130/sessions/cx22xxvn08lpejetb1qeb15ni\",\"return_url\":\"http://localhost:3000/paymentcomplete\",\"default_locale\":\"ja\",\"payment_methods\":[{\"type\":\"credit_card\",\"amount\":6000,\"currency\":\"JPY\",\"exchange_rate\":1},{\"type\":\"konbini\",\"customer_fee\":190,\"brands\":{\"seven-eleven\":{\"icon\":\"/assets/konbini/seven-eleven-da31532062f5984f6bbe946cb934414a8794ec777a66d7c04631e7732bef8bbf.svg\"},\"lawson\":{\"icon\":\"/assets/konbini/lawson-b078fed95aae5ab473f8af8203e011da7b71aabcbc01053856eb5276492b8795.svg\"},\"family-mart\":{\"icon\":\"/assets/konbini/family-mart-21bffdc147df8d8aac409229cd1489fb70decf4a0d256078c0ff8f29a74de2b5.svg\"},\"ministop\":{\"icon\":\"/assets/konbini/ministop-7f94431ad31371a9271fe7b8b1f4c711c3c7a3b3373e07cc7e02acfcaf3d759e.svg\"},\"daily-yamazaki\":{\"icon\":\"/assets/konbini/daily-yamazaki-da33e025c337133a7a17c3df51a0fd7be8d7636b49befb814eb6ff296801c434.svg\"},\"seicomart\":{\"icon\":\"/assets/konbini/seicomart-0dd22c56a5bee2440a4dda655bc350339cafd2ef704e2163d25df1711d29e021.svg\"}},\"amount\":6000,\"currency\":\"JPY\",\"exchange_rate\":1},{\"type\":\"paypay\",\"offsite\":true,\"additional_fields\":[],\"amount\":6000,\"currency\":\"JPY\",\"exchange_rate\":1},{\"type\":\"linepay\",\"offsite\":true,\"additional_fields\":[],\"amount\":6000,\"currency\":\"JPY\",\"exchange_rate\":1},{\"type\":\"merpay\",\"offsite\":true,\"additional_fields\":[],\"amount\":6000,\"currency\":\"JPY\",\"exchange_rate\":1},{\"type\":\"bank_transfer\",\"customer_fee\":0,\"amount\":6000,\"currency\":\"JPY\",\"exchange_rate\":1},{\"type\":\"pay_easy\",\"customer_fee\":190,\"amount\":6000,\"currency\":\"JPY\",\"exchange_rate\":1},{\"type\":\"web_money\",\"amount\":6000,\"currency\":\"JPY\",\"exchange_rate\":1},{\"type\":\"bit_cash\",\"amount\":6000,\"currency\":\"JPY\",\"exchange_rate\":1},{\"type\":\"net_cash\",\"amount\":6000,\"currency\":\"JPY\",\"exchange_rate\":1},{\"type\":\"docomo\",\"offsite\":true,\"additional_fields\":[],\"amount\":6000,\"currency\":\"JPY\",\"exchange_rate\":1},{\"type\":\"au\",\"offsite\":true,\"additional_fields\":[],\"amount\":6000,\"currency\":\"JPY\",\"exchange_rate\":1},{\"type\":\"softbank\",\"offsite\":true,\"additional_fields\":[],\"amount\":6000,\"currency\":\"JPY\",\"exchange_rate\":1},{\"type\":\"steam_prepaid_card\",\"amount\":6000,\"currency\":\"JPY\",\"exchange_rate\":1},{\"type\":\"komoju_pay\",\"installments\":[{\"amount\":2000,\"pay_at\":\"2022-11-13T13:29:20.114+09:00\"},{\"amount\":2000,\"pay_at\":\"2022-12-11T13:29:20.114+09:00\"},{\"amount\":2000,\"pay_at\":\"2023-01-08T13:29:20.114+09:00\"}],\"api_endpoint\":\"/komoju_pay/api\",\"amount\":6000,\"currency\":\"JPY\",\"exchange_rate\":1},{\"type\":\"dospara\",\"amount\":6000,\"currency\":\"JPY\",\"exchange_rate\":1},{\"type\":\"cvs\",\"amount\":56470,\"currency\":\"KRW\",\"exchange_rate\":9.411666666666667},{\"type\":\"japan_mobile\",\"offsite\":true,\"additional_fields\":[],\"amount\":6000,\"currency\":\"JPY\",\"exchange_rate\":1},{\"type\":\"nanaco\",\"amount\":6000,\"currency\":\"JPY\",\"exchange_rate\":1},{\"type\":\"culture_voucher\",\"amount\":56470,\"currency\":\"KRW\",\"exchange_rate\":9.411666666666667},{\"type\":\"credit_card_korea\",\"offsite\":false,\"additional_fields\":[\"first_two_digits_of_pin\",\"social_id_birth_date\"],\"amount\":56470,\"currency\":\"KRW\",\"exchange_rate\":9.411666666666667},{\"type\":\"mobile\",\"offsite\":true,\"additional_fields\":[\"email\"],\"amount\":56470,\"currency\":\"KRW\",\"exchange_rate\":9.411666666666667},{\"type\":\"happy_money\",\"amount\":56470,\"currency\":\"KRW\",\"exchange_rate\":9.411666666666667},{\"type\":\"zgold\",\"offsite\":true,\"additional_fields\":[],\"amount\":4106,\"currency\":\"USD\",\"exchange_rate\":0.006843333333333333},{\"type\":\"toss\",\"amount\":56470,\"currency\":\"KRW\",\"exchange_rate\":9.411666666666667},{\"type\":\"paysafe_card\",\"offsite\":true,\"additional_fields\":[],\"amount\":4096,\"currency\":\"EUR\",\"exchange_rate\":0.006826666666666667},{\"type\":\"paysafe_cash\",\"offsite\":true,\"additional_fields\":[],\"amount\":4096,\"currency\":\"EUR\",\"exchange_rate\":0.006826666666666667},{\"type\":\"payco\",\"offsite\":true,\"additional_fields\":[],\"amount\":56470,\"currency\":\"KRW\",\"exchange_rate\":9.411666666666667},{\"type\":\"nexus_transfer\",\"amount\":6000,\"currency\":\"JPY\",\"exchange_rate\":1},{\"type\":\"naverpay\",\"offsite\":true,\"additional_fields\":[],\"amount\":56470,\"currency\":\"KRW\",\"exchange_rate\":9.411666666666667},{\"type\":\"rakutenpay\",\"offsite\":true,\"additional_fields\":[],\"amount\":6000,\"currency\":\"JPY\",\"exchange_rate\":1},{\"type\":\"aupay\",\"offsite\":true,\"additional_fields\":[],\"amount\":6000,\"currency\":\"JPY\",\"exchange_rate\":1},{\"type\":\"bancontact\",\"offsite\":true,\"additional_fields\":[\"name\"],\"amount\":4096,\"currency\":\"EUR\",\"exchange_rate\":0.006826666666666667},{\"type\":\"sepa_transfer\",\"offsite\":true,\"additional_fields\":[\"name\"],\"amount\":4096,\"currency\":\"EUR\",\"exchange_rate\":0.006826666666666667},{\"type\":\"giropay\",\"offsite\":true,\"additional_fields\":[\"name\"],\"amount\":4096,\"currency\":\"EUR\",\"exchange_rate\":0.006826666666666667},{\"type\":\"ideal\",\"offsite\":true,\"additional_fields\":[\"name\"],\"amount\":4096,\"currency\":\"EUR\",\"exchange_rate\":0.006826666666666667},{\"type\":\"sofortbanking\",\"offsite\":true,\"additional_fields\":[\"name\"],\"amount\":4096,\"currency\":\"EUR\",\"exchange_rate\":0.006826666666666667},{\"type\":\"paidy\",\"offsite\":true,\"additional_fields\":[\"name\",\"phone\"],\"amount\":6000,\"currency\":\"JPY\",\"exchange_rate\":1},{\"type\":\"blik\",\"offsite\":true,\"additional_fields\":[\"name\"],\"amount\":19309,\"currency\":\"PLN\",\"exchange_rate\":0.032181666666666664},{\"type\":\"eps\",\"offsite\":true,\"additional_fields\":[\"name\"],\"amount\":4096,\"currency\":\"EUR\",\"exchange_rate\":0.006826666666666667},{\"type\":\"przelewy24\",\"offsite\":true,\"additional_fields\":[\"email\",\"name\"],\"amount\":4096,\"currency\":\"EUR\",\"exchange_rate\":0.006826666666666667},{\"type\":\"multibanco\",\"offsite\":true,\"additional_fields\":[\"name\"],\"amount\":4096,\"currency\":\"EUR\",\"exchange_rate\":0.006826666666666667},{\"type\":\"mybank\",\"offsite\":true,\"additional_fields\":[\"name\"],\"amount\":4096,\"currency\":\"EUR\",\"exchange_rate\":0.006826666666666667},{\"type\":\"payu\",\"offsite\":true,\"additional_fields\":[\"name\"],\"amount\":19309,\"currency\":\"PLN\",\"exchange_rate\":0.032181666666666664},{\"type\":\"narvesen\",\"offsite\":true,\"additional_fields\":[\"name\"],\"amount\":4096,\"currency\":\"EUR\",\"exchange_rate\":0.006826666666666667},{\"type\":\"paypost\",\"offsite\":true,\"additional_fields\":[\"name\"],\"amount\":4096,\"currency\":\"EUR\",\"exchange_rate\":0.006826666666666667},{\"type\":\"perlas\",\"offsite\":true,\"additional_fields\":[\"name\"],\"amount\":4096,\"currency\":\"EUR\",\"exchange_rate\":0.006826666666666667},{\"type\":\"paysera\",\"offsite\":true,\"additional_fields\":[\"name\"],\"amount\":4096,\"currency\":\"EUR\",\"exchange_rate\":0.006826666666666667},{\"type\":\"wechatpay\",\"offsite\":true,\"additional_fields\":[\"name\"],\"amount\":4096,\"currency\":\"EUR\",\"exchange_rate\":0.006826666666666667},{\"type\":\"unionpay\",\"offsite\":true,\"additional_fields\":[\"name\"],\"amount\":4096,\"currency\":\"EUR\",\"exchange_rate\":0.006826666666666667},{\"type\":\"enets\",\"offsite\":true,\"additional_fields\":[\"email\",\"name\",\"phone\"],\"amount\":5758,\"currency\":\"SGD\",\"exchange_rate\":0.009596666666666667},{\"type\":\"grabpayotp\",\"offsite\":true,\"additional_fields\":[\"name\"],\"amount\":5758,\"currency\":\"SGD\",\"exchange_rate\":0.009596666666666667},{\"type\":\"poli\",\"offsite\":true,\"additional_fields\":[\"name\"],\"amount\":6401,\"currency\":\"AUD\",\"exchange_rate\":0.010668333333333335},{\"type\":\"fpx\",\"offsite\":true,\"additional_fields\":[\"email\",\"name\",\"phone\"],\"amount\":19313,\"currency\":\"MYR\",\"exchange_rate\":0.03218833333333333},{\"type\":\"dragonpay\",\"offsite\":true,\"additional_fields\":[\"email\",\"name\",\"phone\"],\"amount\":238448,\"currency\":\"PHP\",\"exchange_rate\":0.39741333333333334},{\"type\":\"doku_wallet\",\"offsite\":true,\"additional_fields\":[\"email\",\"name\"],\"amount\":64486157,\"currency\":\"IDR\",\"exchange_rate\":107.47692833333332},{\"type\":\"ovo\",\"offsite\":true,\"additional_fields\":[\"email\",\"name\"],\"amount\":64486157,\"currency\":\"IDR\",\"exchange_rate\":107.47692833333332},{\"type\":\"epospay\",\"offsite\":true,\"additional_fields\":[],\"amount\":6000,\"currency\":\"JPY\",\"exchange_rate\":1},{\"type\":\"alipay\",\"offsite\":true,\"additional_fields\":[\"name\"],\"amount\":6000,\"currency\":\"JPY\",\"exchange_rate\":1},{\"type\":\"alipay_hk\",\"second_icon\":\"alipay_plus_partner\",\"offsite\":true,\"additional_fields\":[],\"amount\":6000,\"currency\":\"JPY\",\"exchange_rate\":1},{\"type\":\"tng\",\"second_icon\":\"alipay_plus_partner\",\"offsite\":true,\"additional_fields\":[],\"amount\":6000,\"currency\":\"JPY\",\"exchange_rate\":1},{\"type\":\"gcash\",\"second_icon\":\"alipay_plus_partner\",\"offsite\":true,\"additional_fields\":[],\"amount\":6000,\"currency\":\"JPY\",\"exchange_rate\":1},{\"type\":\"kakaopay\",\"second_icon\":\"alipay_plus_partner\",\"offsite\":true,\"additional_fields\":[],\"amount\":6000,\"currency\":\"JPY\",\"exchange_rate\":1},{\"type\":\"truemoney\",\"second_icon\":\"alipay_plus_partner\",\"offsite\":true,\"additional_fields\":[],\"amount\":6000,\"currency\":\"JPY\",\"exchange_rate\":1},{\"type\":\"dana\",\"second_icon\":\"alipay_plus_partner\",\"offsite\":true,\"additional_fields\":[],\"amount\":6000,\"currency\":\"JPY\",\"exchange_rate\":1},{\"type\":\"amazon_pay\",\"offsite\":true,\"additional_fields\":[],\"amount\":6000,\"currency\":\"JPY\",\"exchange_rate\":1}],\"created_at\":\"2022-11-10T13:29:17.000+09:00\",\"cancelled_at\":null,\"completed_at\":null,\"status\":\"pending\",\"expired\":false,\"metadata\":{},\"payment\":null,\"secure_token\":null}";

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
        external_order_num: `order-${Math.floor(Math.random() * 1000000000)}`,
      },
      return_url: 'http://localhost:3000/paymentcomplete',
    })
  })
  const session = await komojuSessionResponse.json()
  if (session.error) {
    console.error(session);
    res.send('Error creating KOMOJU session.<br><pre>'+JSON.stringify(session, null, 2)+'</pre>');
    return;
  }

  res.render('index', {
    sessionString: '',
    session,
    publishableKey: KOMOJU_PUBLISHABLE_KEY,
    cdn: 'http://localhost:3000',
    api: KOMOJU_API_URL,
  })
})

app.get('/easy', async (_req, res) => {
  res.set('content-type', 'text/html')
  res.render('index', {
    session: { id: '' },
    sessionString: FULL_SESSION,
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

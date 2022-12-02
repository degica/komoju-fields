// Generate a full session object, quite similar to the ones you'd get
// from the KOMOJU API.
export default function({
  brands,
  currency,
  exchangerate,
}) {
  return {
    "id": "3ahqc3wqd7byq5z39ljlo1wq1",
    "resource": "session",
    "mode": "payment",
    "amount": 6000,
    "currency": currency ?? 'JPY',
    "session_url": "http://localhost:50130/sessions/3ahqc3wqd7byq5z39ljlo1wq1",
    "return_url": "http://localhost:3000/paymentcomplete",
    "default_locale": "en",
    "payment_methods": [
      {
        "type": "credit_card",
        "brands": brands ?? [
          "visa",
          "master"
        ],
        "amount": 6000,
        "currency": currency ?? 'JPY',
        "exchange_rate": 1
      },
      {
        "type": "konbini",
        "customer_fee": 190,
        "brands": {
          "seven-eleven": {
            "icon": "/assets/konbini/seven-eleven-da31532062f5984f6bbe946cb934414a8794ec777a66d7c04631e7732bef8bbf.svg"
          },
          "lawson": {
            "icon": "/assets/konbini/lawson-b078fed95aae5ab473f8af8203e011da7b71aabcbc01053856eb5276492b8795.svg"
          },
          "family-mart": {
            "icon": "/assets/konbini/family-mart-21bffdc147df8d8aac409229cd1489fb70decf4a0d256078c0ff8f29a74de2b5.svg"
          },
          "ministop": {
            "icon": "/assets/konbini/ministop-7f94431ad31371a9271fe7b8b1f4c711c3c7a3b3373e07cc7e02acfcaf3d759e.svg"
          },
          "daily-yamazaki": {
            "icon": "/assets/konbini/daily-yamazaki-da33e025c337133a7a17c3df51a0fd7be8d7636b49befb814eb6ff296801c434.svg"
          },
          "seicomart": {
            "icon": "/assets/konbini/seicomart-0dd22c56a5bee2440a4dda655bc350339cafd2ef704e2163d25df1711d29e021.svg"
          }
        },
        "amount": exchangerate ? 6000 * exchangerate / 100 : 6000,
        "currency": "JPY",
        "exchange_rate": exchangerate ?? 1
      },
      {
        "type": "paypay",
        "offsite": true,
        "additional_fields": [],
        "amount": exchangerate ? 6000 * exchangerate / 100 : 6000,
        "currency": "JPY",
        "exchange_rate": exchangerate ?? 1
      },
      {
        "type": "bank_transfer",
        "customer_fee": 0,
        "amount": 6000,
        "currency": "JPY",
        "exchange_rate": 1
      },
      {
        "type": "aupay",
        "offsite": true,
        "additional_fields": [],
        "amount": 6000,
        "currency": "JPY",
        "exchange_rate": 1
      },
      {
        "type": "giropay",
        "offsite": true,
        "additional_fields": [
          "name"
        ],
        "amount": 4182,
        "currency": "EUR",
        "exchange_rate": 0.00697
      },
      {
        "type": "alipay",
        "offsite": true,
        "additional_fields": [
          "name"
        ],
        "amount": 6000,
        "currency": "JPY",
        "exchange_rate": 1
      }
    ],
    "created_at": "2022-11-30T11:57:07.000+09:00",
    "cancelled_at": null,
    "completed_at": null,
    "status": "pending",
    "expired": false,
    "metadata": {},
    "payment": null,
    "secure_token": null
  };
}

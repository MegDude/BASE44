## Google Sheets card capture setup

This app now posts resident card registrations to:

- `/api/card-capture`

That API forwards the payload to a Google Apps Script webhook defined by:

- `GOOGLE_SHEETS_WEBHOOK_URL`

### What gets captured

- submitted timestamp
- flow
- source
- first name
- mobile number
- email
- building
- anonymous session id
- page path
- current URL
- referrer
- user agent

### Setup

1. Create a new Google Sheet.
2. Open `Extensions -> Apps Script`.
3. Paste in the contents of:
   - `scripts/google-sheets-card-capture.gs`
4. Deploy as a web app:
   - Execute as: `Me`
   - Access: `Anyone with the link`
5. Copy the web app URL.
6. Set:
   - `GOOGLE_SHEETS_WEBHOOK_URL=<your apps script web app url>`

### Expected behavior

When the `/card` form is submitted successfully:

- a new row is appended to the `Resident Card Leads` sheet
- the local preview card is issued in the app
- the user sees a success state

If the webhook is missing or fails:

- the card is not issued
- the user sees an inline error

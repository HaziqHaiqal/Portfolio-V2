# TODO

## Track clients, orders and Care Plans in the admin portal

Right now the WhatsApp message is the only record of what a client chose. Nothing is
saved, so the admin portal cannot show orders, amounts, payments or renewal dates.

### Rules to keep

- No database row per click on "Send on WhatsApp". Rows are created only when the
  developer confirms a real client in the admin portal.
- The client must not be able to change prices by editing the WhatsApp message.
- Database changes go through the Supabase MCP (no migration files).
- New tables are admin-only (RLS): no public read or insert.

### 1. Signed quote reference in the WhatsApp message

- [ ] Server action that takes the client's selection and returns a short signed token
      (HMAC with a server-only secret). It stores nothing in the database.
- [ ] Add a line to every WhatsApp message (template modal and estimators), for
      example `Quote ref: Q-7K2M9` plus an admin link carrying the token.
- [ ] The token encodes: service (template, website or app), package or template slug,
      extras with prices, promo code and discount, build total, Care Plan
      (plan, with database, monthly or yearly, first payment) and the grand total.
- [ ] Admin page that opens the token, checks the signature and shows the quote
      exactly as the client saw it. "Edited" or invalid tokens are flagged.

### 2. New admin section: Clients & Orders (Business group)

- [ ] `clients`: name, business name, WhatsApp, email, domain, notes, created at.
- [ ] `orders`: client, quote ref, service type, line items (JSON snapshot of the
      receipt), build price, promo code, discount, total, status, created at.
  - Status flow: quoted → confirmed → deposit paid → in progress → live → cancelled.
- [ ] `order_payments`: order, kind (40% deposit, 60% at launch, extra), amount, paid
      at, method, reference. Show the outstanding balance per order.
- [ ] "Create order from quote" button on the quote page (step 1) that prefills a
      new order and its client, so nothing is typed by hand.
- [ ] Manual "New order" form for deals agreed outside the site.

### 3. Care Plan subscriptions

- [ ] `care_subscriptions`: client, order, plan (website or app), with database,
      billing (monthly or yearly), amount, start date (launch date), current period
      end, status (active, overdue, cancelled).
- [ ] `care_payments`: subscription, period start, period end, amount, paid at,
      method, reference. Recording a payment moves the period end forward by one
      month or one year.
- [ ] Subscription page: payment history, next renewal date, and a "Mark as paid"
      button.
- [ ] When an order goes live, create its subscription from the quote's Hosting &
      Care choice.

### 4. Dashboard and reminders

- [ ] Admin dashboard cards:
  - renewals due in the next 14 days
  - overdue subscriptions
  - unpaid balances (60% not yet paid)
  - projects in progress
  - monthly recurring revenue (yearly plans divided by 12)
- [ ] Daily job (Vercel Cron or Supabase `pg_cron`) that emails the developer about
      renewals due in 7 days and anything overdue.
- [ ] "Send reminder" button that opens WhatsApp with a prefilled renewal message
      for that client.
- [ ] Decide what happens when a plan is overdue (FAQ says hosting stops if the plan
      stops): grace period length, then take the site offline.

### 5. Later

- [ ] PDF invoice and receipt per payment.
- [ ] Link promo code redemptions to orders (count uses on confirm, not on apply).
- [ ] Export orders and payments to CSV for accounting.

## Online store demo

So clients can test a real checkout before ordering a custom online store.

- [x] Full store demo at `/templates/ruang`: catalogue with categories,
      variants and stock, cart, checkout, order confirmation page and an email
      preview.
- [x] Simulated payments on a "DemoPay" test page instead of a gateway sandbox:
      FPX demo banks, test cards (with a one-time password case), DuitNow QR
      and cash on delivery, each ending on a success or failed page.
- [x] Clear demo notice at checkout and on the payment page, with the test
      details to use.
- [x] Admin side of the demo: orders with status (paid, packed, shipped,
      delivered), failed payments and stock that goes down after payment. Data
      stays in the visitor's browser, with a reset button.
- [x] Reached from the template gallery only; the links from the old Custom
      package were removed.
- [x] Sold as the Ruang template (RM20,000 vs RM24,000 for the same store on the
      Systems tab, Online store category), with
      "Use this template" in the demo bar and gallery.
- [ ] Before the first Ruang sale is delivered, build the real backend the
      demo simulates: Supabase tables for products, options, stock and
      orders; product editing in the Admin portal (the demo only packs and
      ships); admin sign-in; one Malaysian gateway (Billplz, ToyyibPay or
      Stripe) with a payment webhook; order emails. Build it once so later
      sales reuse it.

## Math solving game demo

An interactive demo that shows games and learning apps can be built too.

- [ ] Decide the audience and pitch first: kids (e.g. tuition centres, schools)
      or general brain training, and which services it sells (custom web app,
      mobile app, PWA).
- [ ] Core game: questions by level (addition up to word problems), timer,
      score, streaks and instant right/wrong feedback.
- [ ] Progress that persists on the device, with a simple results screen.
- [ ] Optional: leaderboard (needs a database) and sound effects with a mute
      button.
- [ ] Works on phones and installs as a PWA using the PWA kit, so it plays
      offline.
- [ ] Add it to the Projects page or the Services page as a live demo.

## Other open items

- [ ] Deactivate or delete the `TRY10` test promo code (active until 29 Oct 2026).
- [ ] Decide whether to remove the `?colour=` and `?promo=` URL parameters.
- [ ] Decide whether to drop the unused `experiences.sort_order` column.
- [ ] Deploy the deals section and the `is_featured` switch; FRYDAY10 (23 Oct 2026)
      expires before it can show on the live site.
- [ ] Commit the services, templates and admin work (nothing is committed yet).

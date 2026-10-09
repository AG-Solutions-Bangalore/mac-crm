# Quotation updates ✅ = Complete | 🟡 = Pending

## 8. Validity + Project Notifications 🟡 Pending

- [Pending] Backend: estimate_valid_till, price_validity_date, hardware/final payment flags, due-notification trigger — backend chahiye
- [Pending] Estimate form me Valid Till date field
- [Pending] Convert dialog me Price Validity date picker (manual date)
- [Pending] Project Notifications page (Operations → Projects ke neeche): expiring/stagnant list + Extend (1 month/custom) / Client Paid → X din baad yaad dilao / Close actions
- [Pending] Projects list me validity badge/warning (expiring highlight)

## 6. Sidebar flow (Operations) 🟡 Pending

- [Pending] Backend: `"Project"` + `"Closed"` status, follow-up date/frequency, payment-done flag — backend chahiye
- [Pending] Estimates = sirf non-converted (rename + converted hide)
- [Pending] Actions me Convert to Project button → Projects me move
- [Pending] Closed Projects page (final payment done wale)
- [Pending] Follow-up: quote me reminder frequency (5/7/10/14/custom), notification par snooze ya next date
- [pending] Complaint sidebar se hide (route intact — decision: sirf hide)

## 7. Quote me inline quick-add 🟡 Pending

- [Pending] Floor/Area/Brand: dropdown footer "+ Add" (sirf naam wala dialog, auto-select) — create API ready
- [Pending] Product: quick-add dialog (naam + category + service + brand + price, auto-select)

## 5. Convert Estimate to Project 🟡 Pending

- [Pending] Backend: `PATCH /quotations/{id}/status` me `"Project"` status accept ho (ya convert API) — backend confirm chahiye
- [Pending] Actions me Convert to Project button + confirm + toast
- [Pending] Converted quotes estimates list se hide
- [Pending] Naya Projects page (`/project-list`) + sidebar item

## 1. Add Quotation form ✅

- Buyer me search + Add New Buyer option — form chhode bina naya buyer banao, auto-select ho jayega
- Product dropdown khaali ho to ab wajah batayega (e.g. Frame products Smart Switches me hai — wahi tick karo)
- Category me product hai to dropdown me dikhega, select karte hi row ka Service khud sahi ho jayega + rate auto-bharega
- Edit me Save Changes (overwrite) + Save as New (aaj ki date me naya quote)

## 2. Quotation PDF — Page 1 (Cover) ✅

- Logo white box hataya, sirf logo
- "Exclusively Prepared For" dark & clear, Client name bada (32px), neeche gap kam
- Service pills: Room Audio + Lights alag-alag, Door & Gate Automation, 800+ Projects Completed
- Client, Client Contact, Property Type, Ref, Date + Prepared By (4 persons dropdown)

## 3. Quotation PDF — Scope/Pricing ✅

- Har service ka alag total (Smart Switches total, Networking total...) + Grand Total
- Consultancy & Design % aur Installation % — 5/7/10/15 ya koi bhi custom %, PDF me % number nahi dikhega, sirf value
- Finish column (Frame/Frameless/Brass) sirf Smart Switches me, Total Price–Brand ke beech
- Brand column chauda — lambe naam (Grandstream) ek line me
- Net Project Value + Payment Milestones (30/60/10) + Bank/UPI + sign blocks

## 4. Company Profile page ✅

- Room Audio + CCTV & Security included, "Why choose MAKc?", Service Excellence (SLA word hataya), Awards

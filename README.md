v18.6: Fixed mobile quote page horizontal overflow and centered Start Your Project layout.
Ella Rae Threads v17 — Upload Ready
- Quote form submits to Cloudflare Pages Function at /api/quote
- Customers can upload logo/artwork files
- Files save to Cloudflare R2 bucket binding named UPLOADS
- Quote details are emailed through Web3Forms with secure artwork download links
- Requires Pages binding: R2 bucket -> Variable name UPLOADS -> bucket ella-rae-uploads


## v18.2 Notes
- Added strong selected-state highlighting for product, quantity, artwork status, apparel, and location buttons.
- Added selected-state styling for uploaded artwork file box.
- Added lowercase email/replyto fields to the quote notification payload for better Web3Forms handling.
- Customer auto-reply emails require a Web3Forms autoresponder setting/plan or a separate email sending service.


## v19 Quote Page Stability Notes

- Start Your Project mobile page no longer side-scrolls.
- Sticky step tracker remains visible while scrolling but no longer covers step headings.
- Mobile hamburger menu is restored on the quote page.
- Selected form choices highlight in gold.
- Thank-you message is centered and scrolls to the top after submission.

## Customer Thank-You Email

The website thank-you screen is active. A separate automatic customer email requires enabling Web3Forms autoresponder in the Web3Forms dashboard, or connecting an email provider such as Resend/Brevo/MailChannels to the Cloudflare Function.

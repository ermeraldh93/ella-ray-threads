# Ella Rae Threads Website

## Quote requests with logo uploads

This version uses a Cloudflare Pages Function for the Start Your Project form.
The form accepts artwork/logo uploads, stores them in Cloudflare R2, and sends the quote details to Web3Forms.

### Required Cloudflare setup

1. In Cloudflare, create an R2 bucket named:
   `ella-rae-quote-uploads`

2. Open your Cloudflare Pages project for Ella Rae Threads.

3. Go to **Settings → Functions → R2 bucket bindings**.

4. Add this binding:
   - Variable name: `QUOTE_UPLOADS`
   - R2 bucket: `ella-rae-quote-uploads`

5. Go to **Settings → Environment variables** and add:
   - `WEB3FORMS_ACCESS_KEY` = your Web3Forms key
   - `FILE_SECRET` = any long random password/string

6. Redeploy the site.

### Notes

- Web3Forms Free does not support direct file attachments.
- This setup stores the uploaded file in R2 and emails you a secure download link.
- Max file size is 10MB per file, up to 5 files.

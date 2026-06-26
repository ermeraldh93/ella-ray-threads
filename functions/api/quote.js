const DEFAULT_WEB3FORMS_KEY = "c640dd40-7c43-4bfd-807b-172317e3ac23";
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 5;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}

function wantsHtml(request) {
  const accept = request.headers.get("accept") || "";
  const requestedWith = request.headers.get("x-requested-with") || "";
  return accept.includes("text/html") && !requestedWith.includes("XMLHttpRequest");
}

function htmlPage({ success, title, message, status = 200 }) {
  const mark = success ? "✓" : "!";
  const accent = success ? "#bfa37a" : "#b44";
  return new Response(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} | Ella Rae Threads</title>
<style>
  body{margin:0;background:#fbfaf7;color:#111;font-family:Arial,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
  .card{width:min(760px,92vw);background:#fff;border:1px solid #e8e0d5;border-radius:32px;box-shadow:0 28px 90px rgba(0,0,0,.08);padding:54px 34px;text-align:center}
  .mark{width:76px;height:76px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:${accent};color:#111;font-size:40px;font-weight:900;margin:0 auto 24px}
  h1{font-family:Georgia,serif;font-size:clamp(38px,7vw,68px);font-weight:400;line-height:1;margin:0 0 16px}
  p{color:#6b655d;font-size:18px;line-height:1.65;max-width:600px;margin:0 auto 30px}
  .actions{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
  a{display:inline-flex;align-items:center;justify-content:center;text-decoration:none;border-radius:999px;padding:15px 24px;font-weight:900;letter-spacing:.04em}
  .primary{background:#111;color:#fff}.secondary{border:1px solid #bfa37a;color:#111;background:#fff}
  @media(max-width:640px){.card{padding:40px 22px}.actions a{width:100%}}
</style>
</head>
<body><main class="card"><div class="mark">${mark}</div><h1>${title}</h1><p>${message}</p><div class="actions"><a class="primary" href="/">Return Home</a><a class="secondary" href="/store">Browse Store</a></div></main></body></html>`, {
    status,
    headers: { "content-type": "text/html; charset=utf-8" }
  });
}

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function safeName(name = "upload") {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").slice(0, 120) || "upload";
}

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, "0")).join("");
}

async function fileToken(key, env) {
  const secret = env.FILE_SECRET || env.WEB3FORMS_ACCESS_KEY || DEFAULT_WEB3FORMS_KEY;
  return sha256(`${key}:${secret}`);
}

export async function onRequestPost({ request, env }) {
  const html = wantsHtml(request);
  try {
    const form = await request.formData();

    if (form.get("botcheck")) {
      return json({ success: false, message: "Spam detected." }, 400);
    }

    const origin = new URL(request.url).origin;
    const uploadLinks = [];
    const uploadNames = [];
    const files = form.getAll("artwork").filter(file => file && typeof file === "object" && file.name && file.size > 0).slice(0, MAX_FILES);

    if (files.length && !env.UPLOADS) {
      return json({
        success: false,
        message: "File upload storage is not configured yet. Add an R2 binding named UPLOADS in Cloudflare Pages."
      }, 500);
    }

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return json({ success: false, message: `${file.name} is too large. Max upload size is 10MB per file.` }, 400);
      }
      const key = `quote-uploads/${new Date().toISOString().slice(0,10)}/${Date.now()}-${crypto.randomUUID()}-${safeName(file.name)}`;
      await env.UPLOADS.put(key, file.stream(), {
        httpMetadata: { contentType: file.type || "application/octet-stream" },
        customMetadata: {
          originalName: file.name,
          submittedAt: new Date().toISOString()
        }
      });
      const token = await fileToken(key, env);
      uploadNames.push(file.name);
      uploadLinks.push(`${origin}/api/quote-file?key=${encodeURIComponent(key)}&token=${token}`);
    }

    const locations = form.getAll("location").map(String).join(", ");
    const payload = {
      access_key: env.WEB3FORMS_ACCESS_KEY || DEFAULT_WEB3FORMS_KEY,
      subject: "New Quote Request - Ella Rae Threads",
      from_name: "Ella Rae Threads Website",
      "Product": clean(form.get("product")),
      "Artwork Status": clean(form.get("artwork_status")),
      "Artwork Notes": clean(form.get("artwork_notes")),
      "Uploaded File Names": uploadNames.join(", ") || "No files uploaded",
      "Uploaded File Links": uploadLinks.join("\n") || "No files uploaded",
      "Quantity": clean(form.get("quantity")),
      "Embroidery Location": locations,
      "Need Apparel Supplied": clean(form.get("apparel_supplied")),
      "Deadline": clean(form.get("deadline")),
      "Additional Details": clean(form.get("notes")),
      name: clean(form.get("name")),
      email: clean(form.get("email")),
      replyto: clean(form.get("email")),
      "Name": clean(form.get("name")),
      "Company": clean(form.get("company")),
      "Email": clean(form.get("email")),
      "Phone": clean(form.get("phone")),
      "Submitted From": origin
    };

    const emailRes = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "content-type": "application/json", "accept": "application/json" },
      body: JSON.stringify(payload)
    });
    const emailData = await emailRes.json().catch(() => ({}));

    if (!emailRes.ok || emailData.success === false) {
      return json({ success: false, message: emailData.message || "Email notification failed. Please try again." }, 502);
    }

    const successMessage = "Your project request has been received. We'll review your details and artwork, then contact you within one business day.";
    if (html) return htmlPage({ success: true, title: "Thank You", message: successMessage });
    return json({
      success: true,
      message: successMessage
    });
  } catch (err) {
    const message = err?.message || "Something went wrong. Please try again.";
    if (html) return htmlPage({ success: false, title: "Submission Error", message, status: 500 });
    return json({ success: false, message }, 500);
  }
}

const DEFAULT_WEB3FORMS_KEY = "c640dd40-7c43-4bfd-807b-172317e3ac23";
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 5;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
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

    return json({
      success: true,
      message: "Thank you! Your project request has been received. We'll review it and be in touch shortly."
    });
  } catch (err) {
    return json({ success: false, message: err?.message || "Something went wrong. Please try again." }, 500);
  }
}

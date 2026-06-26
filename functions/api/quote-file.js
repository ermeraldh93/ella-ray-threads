function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}
async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, "0")).join("");
}
async function fileToken(key, env) {
  const secret = env.FILE_SECRET || env.WEB3FORMS_ACCESS_KEY || "c640dd40-7c43-4bfd-807b-172317e3ac23";
  return sha256(`${key}:${secret}`);
}
export async function onRequestGet({ request, env }) {
  try {
    if (!env.QUOTE_UPLOADS) return json({ success: false, message: "File storage is not configured." }, 500);
    const url = new URL(request.url);
    const key = url.searchParams.get("key") || "";
    const token = url.searchParams.get("token") || "";
    if (!key || !token || token !== await fileToken(key, env)) return json({ success: false, message: "Invalid file link." }, 403);
    const object = await env.QUOTE_UPLOADS.get(key);
    if (!object) return json({ success: false, message: "File not found." }, 404);
    const filename = object.customMetadata?.originalName || key.split('/').pop() || 'artwork-upload';
    return new Response(object.body, {
      headers: {
        "content-type": object.httpMetadata?.contentType || "application/octet-stream",
        "content-disposition": `attachment; filename="${filename.replace(/"/g, '')}"`,
        "cache-control": "private, max-age=0, no-store"
      }
    });
  } catch (err) {
    return json({ success: false, message: err?.message || "Unable to retrieve file." }, 500);
  }
}

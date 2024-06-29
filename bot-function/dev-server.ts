import { main } from "./main.ts";

const Port = 8080;
Deno.serve({ port: Port }, async (req) => {
  const { url, headers } = req;
  const body = await extractBody(req);

  const botReq = { path: req.url, body };
  console.log(req.headers.get("content-type"));
  console.log(JSON.stringify(botReq, null, 2));

  const res = await main(botReq);
  if (res.ok && res.body) {
    return Response.json(res.body, { status: 200 });
  }
  if (res.ok) {
    return new Response(null, { status: 200 });
  }
  console.error(res.body);
  return Response.error();
});

async function extractBody(req: Request): Promise<Record<string, unknown>> {
  const contentType = req.headers.get("content-type");
  if (contentType === "application/json") {
    return req.json();
  }
  if (contentType === "application/x-www-form-urlencoded") {
    const formData = await req.formData();
    console.log(formData);

    const payload = formData.get("payload");
    if (!payload) {
      return Object.fromEntries(formData.entries());
    }
    if (typeof payload === "string") {
      return JSON.parse(payload);
    }
    return Promise.reject(`unexpected payload type: ${typeof payload}`);
  }
  return Promise.reject(`unsupported content type: ${contentType}`);
}

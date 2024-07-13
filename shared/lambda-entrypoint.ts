import type {
  APIGatewayProxyResultV2,
} from "https://deno.land/x/lambda@1.44.4/mod.ts";

const AWS_LAMBDA_RUNTIME_API = Deno.env.get("AWS_LAMBDA_RUNTIME_API");
if (!AWS_LAMBDA_RUNTIME_API) {
  throw new Error("AWS_LAMBDA_RUNTIME_API is not defined");
}
const Api = `http://${AWS_LAMBDA_RUNTIME_API}/2018-06-01/runtime/invocation`;

// deno-lint-ignore no-explicit-any
export async function start(main: (_: any) => Promise<any>) {
  while (true) {
    const event = await fetch(`${Api}/next`);
    const requestId = event.headers.get("Lambda-Runtime-Aws-Request-Id");
    const req = await event.json();
    const res = await main(req);
    const response: APIGatewayProxyResultV2 = {
      statusCode: 200,
      headers: { "content-type": "application/json;charset=utf8" },
      body: JSON.stringify(res.body),
    };

    await fetch(`${Api}/${requestId}/response`, {
      method: "POST",
      body: JSON.stringify(response),
    });
  }
}

import { parse } from "node:querystring";
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from "https://deno.land/x/lambda@1.44.4/mod.ts";
import { main } from "./main.ts";

const AWS_LAMBDA_RUNTIME_API = Deno.env.get("AWS_LAMBDA_RUNTIME_API");
if (!AWS_LAMBDA_RUNTIME_API) {
  throw new Error("AWS_LAMBDA_RUNTIME_API is not defined");
}
const Api = `http://${AWS_LAMBDA_RUNTIME_API}/2018-06-01/runtime/invocation`;

while (true) {
  const event = await fetch(`${Api}/next`);
  const requestId = event.headers.get("Lambda-Runtime-Aws-Request-Id");
  const rawRequest: APIGatewayProxyEventV2 = await event.json();

  const body = parseRequestBody(
    rawRequest.body ?? "",
    rawRequest.headers["content-type"],
  );
  const res = await main({ body });
  console.log(
    "----------------------------------------------- RESPONSE",
    res.body,
  );

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

// from: https://github.com/slackapi/bolt-js/blob/main/src/receivers/AwsLambdaReceiver.ts
function parseRequestBody(
  stringBody: string,
  contentType: string | undefined,
  // deno-lint-ignore no-explicit-any
): any {
  if (contentType === "application/x-www-form-urlencoded") {
    const parsedBody = parse(stringBody);
    if (typeof parsedBody.payload === "string") {
      return JSON.parse(parsedBody.payload);
    }
    return parsedBody;
  }
  if (contentType === "application/json") {
    return JSON.parse(stringBody);
  }

  console.warn(`Unexpected content-type detected: ${contentType}`);
  try {
    // Parse this body anyway
    return JSON.parse(stringBody);
  } catch (e) {
    console.error(
      `Failed to parse body as JSON data for content-type: ${contentType}`,
    );
    throw e;
  }
}

import { parse } from "node:querystring";
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
  Context,
} from "https://deno.land/x/lambda@1.44.4/mod.ts";
import { main } from "./main.ts";

// deno-lint-ignore require-await
export async function handler(
  event: APIGatewayProxyEventV2,
  context: Context,
): Promise<APIGatewayProxyResultV2> {
  const body = parseRequestBody(
    event.body ?? "",
    event.headers["content-type"],
  );
  const req = {
    path: event.rawPath,
    body,
  };
  const res = await main(req);
  return {
    statusCode: 200,
    headers: { "content-type": "application/json;charset=utf8" },
    body: JSON.stringify(res.body),
  };
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

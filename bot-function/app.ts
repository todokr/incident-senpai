import {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
  Context,
} from "https://deno.land/x/lambda@1.44.1/mod.ts";

export async function handler(
  event: APIGatewayProxyEventV2,
  context: Context,
): Promise<APIGatewayProxyResultV2> {
  const chuckNorrisJoke = await fetch("https://api.chucknorris.io/jokes/random")
    .then((res) => res.json());
  const body = JSON.stringify({
    denoVersion: Deno.version.deno,
    joke: chuckNorrisJoke.value,
  });
  return {
    headers: { "content-type": "text/html;charset=utf8" },
    statusCode: 200,
    body,
  };
}

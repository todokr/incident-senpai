import { assertEquals } from "jsr:@std/assert/assert_equals";

export function mapRecord<V, R>(
  record: Record<string, V>,
  fn: ([key, value]: [string, V]) => [string, R],
): Record<string, R> {
  return Object.fromEntries(Object.entries(record).map(fn));
}

Deno.test("mapRecord", () => {
  const record = { a: 1, b: 2 };
  assertEquals(mapRecord(record, ([k, v]) => [k + "x", v * 2]), {
    ax: 2,
    bx: 4,
  });
});

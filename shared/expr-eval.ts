/**
 * Expand variables in the form of `${{input.person.name}}` in the given string.
 */
const InputVarPattern = /\${{input\.([^}]+)}}/g;

// deno-lint-ignore no-explicit-any
export function evalExpr(variableable: string, input: any): string {
  return variableable.replace(InputVarPattern, (_, varExpr) => {
    const path = varExpr.split(".");
    // deno-lint-ignore no-explicit-any
    let result: any = input;
    try {
      // deno-lint-ignore no-explicit-any
      result = path.reduce((acc: any, key: string) => {
        if (Array.isArray(acc)) {
          return acc.map((item) => item[key]);
        } else {
          return acc[key];
        }
      }, input);
    } catch (_e) {
      console.error(_e);
      result = `🚨 could not expand config variable from config.

      -----------------------------------------
      variable
      -----------------------------------------
      ${varExpr}

      -----------------------------------------
      input
      -----------------------------------------
      ${JSON.stringify(input, null, 2)}`;
    }

    if (Array.isArray(result)) {
      return result.join(", ");
    } else {
      return result;
    }
  });
}

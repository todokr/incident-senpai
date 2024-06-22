import { createHmac, timingSafeEqual } from "node:crypto";
import { Buffer } from "node:buffer";

export type VerifyResult = "Ok" | "InvalidTimestamp" | "InvalidSignature";

export class Verifier {
    constructor(private key: string) {}

    verify(
        slackSignature: string,
        timestamp: number,
        body: string,
        currentEpoch: number = Math.floor(Date.now() / 1000),
    ): VerifyResult {
        if (Math.abs(currentEpoch - timestamp) > 60 * 5) {
            return "InvalidTimestamp";
        }
        const joined = `v0:${timestamp}:${body}`;

        const signer = createHmac("sha256", this.key);
        const signed = signer.update(joined).digest("hex");
        signer.destroy();
        const signature = `v0=${signed}`;
        if (
            !timingSafeEqual(
                Buffer.from(signature),
                Buffer.from(slackSignature),
            )
        ) {
            console.error("signature mismatch");
            console.error(`expected: ${signature}`);
            console.error(`actual: ${slackSignature}`);
            return "InvalidSignature";
        }

        return "Ok";
    }
}

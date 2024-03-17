import { errorMessage } from "../server";
import { logger } from "../logging";
import { ScansRecord, ScansResponse } from "../../../types/pocketbase-types";
import { resolvesPublicIp } from "./dnsUtils";

export async function filterScans(
  scans: ScansResponse[]
): Promise<ScansResponse[]> {
  let filteredScans: ScansResponse[] = [];
  if (!isRestrictedPrivateIp()) return scans;
  await Promise.all(
    scans.map(async (scan) => {
      try {
        await resolvesPublicIp(scan.url);
        filteredScans.push(scan);
      } catch (e) {
        logger.info({
          type: "errorResolvingPublicIp",
          scanId: scan.id,
          error: e,
        });
        errorMessage(
          "Not a public IP or could not resolve hostname while SCANNER_NO_PRIVATE_IPS set to true",
          scan.id
        );
      }
    })
  );
  return filteredScans;
}
export function isRestrictedPrivateIp(): boolean {
  return process.env.SCANNER_NO_PRIVATE_IPS === "true";
}

import { ScansResponse } from "@webhood/types";
import { logger } from "../logging";
import { errorMessage } from "../server";
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

export function isObject(item: any) {
  return item && typeof item === "object" && !Array.isArray(item);
}

export function mergeDeep(...objects: any): object {
  const isObject = (obj: any) => obj && typeof obj === "object";

  return objects.reduce((prev: any, obj: any) => {
    Object.keys(obj).forEach((key) => {
      const pVal = prev[key];
      const oVal = obj[key];

      if (Array.isArray(pVal) && Array.isArray(oVal)) {
        prev[key] = pVal.concat(...oVal);
      } else if (isObject(pVal) && isObject(oVal)) {
        prev[key] = mergeDeep(pVal, oVal);
      } else {
        prev[key] = oVal;
      }
    });

    return prev;
  }, {});
}

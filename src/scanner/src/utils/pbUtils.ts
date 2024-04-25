import { ScannerConfig, ScannersResponse } from "@webhood/types";
import PocketBase from "pocketbase";
import * as errors from "../errors";
import { EnvAuthStore } from "./memoryAuthStore";

export const pb = new PocketBase(process.env.ENDPOINT, new EnvAuthStore());
pb.autoCancellation(false);

export async function getBrowserInfo(): Promise<{
  scannerObject: ScannersResponse;
  scannerConfig: ScannerConfig;
}> {
  // Get config for current scanner
  const authModel = await pb.collection("api_tokens").authRefresh({
    expand: "config",
  });
  const data = authModel.record.expand?.config;
  if (!data?.config) {
    throw new errors.WebhoodScannerInvalidConfigError("Could not get config");
  }
  return { scannerObject: data, scannerConfig: data.config as ScannerConfig };
}

// This function should only be used when you know that the config is up to date.
// usually this is called after getBrowserInfo is called
export function getScanInfoStatic() {
  const model = pb.authStore.model;
  if (!model) {
    throw new errors.WebhoodScannerInvalidConfigError("Could not get config");
  }
  return model.expand.config.config as ScannerConfig;
}

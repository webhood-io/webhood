import {
  checkForNewScans,
  checkForOldScans,
  screenshot,
  errorMessage,
  browserinit,
  pb,
  getBrowserInfo,
  refreshConfig,
} from "./server";
import * as errors from "./errors";
import { Semaphore } from "async-mutex";
import { updateScanStatus } from "./server";
import { ScansRecord } from "./types/pocketbase-types";

const initialValue = 1;
const semaphore = new Semaphore(initialValue);

function subscribeRealtime() {
  pb.collection("scans")
    .subscribe("*", async function (e) {
      if (e.action === "create") {
        console.log("New scan created", semaphore.getValue());
        if (semaphore.isLocked()) {
          // if semaphore is locked, skip the scan. The scan will be picked up by the setInterval
          console.log("Semaphore is locked, skipping");
          return;
        }
        await semaphore.runExclusive(async (value) => {
          await updateScanStatus(e.record.id, "queued");
          console.log("Semaphore value", value);
          await startScanning({ scan: e.record as ScansRecord });
        });
      }
    })
    .then(() => {
      console.log("Subscribed to changes in scans collection");
    })
    .catch((error) => {
      console.error(
        "Error while subscribing to changes in scans collection. Realtime updates will not work",
        error
      );
    });
  pb.collection("scanners")
    .subscribe(pb.authStore.model?.config, async function (e) {
      if (e.action === "update") {
        console.log("Config updated");
        await refreshConfig();
        const simultaneousScans = e.record?.config.simultaneousScans;
        if (simultaneousScans) {
          try {
            console.log("Setting semaphore value to", simultaneousScans);
            semaphore.setValue(simultaneousScans);
          } catch (e) {
            console.log("Error while setting semaphore value", e);
          }
        }
      }
    })
    .then(() => {
      console.log("Subscribed to changes in scanners collection");
    })
    .catch((error) => {
      console.error(
        "Error while subscribing to changes in scanners collection. Realtime updates will not work",
        error
      );
    });
}

async function setup() {
  const data = await refreshConfig();
  const scannerConfig = data.record.expand?.config.config;
  subscribeRealtime();
  const simultaneousScans = scannerConfig?.simultaneousScans;
  if (simultaneousScans) {
    try {
      console.log("Setting semaphore value to", simultaneousScans);
      semaphore.setValue(simultaneousScans);
    } catch (e) {
      console.log("Error while setting semaphore value", e);
    }
  }
}

setup();

export async function startScanning({ scan }: { scan: ScansRecord }) {
  if (
    scan?.options &&
    scan.options.scannerId &&
    scan.options.scannerId !== pb.authStore.model?.config
  ) {
    console.log(
      "Scan is not for this scanner, skipping",
      scan.id,
      "scannerId",
      scan.options.scannerId,
      "scannerConfigId",
      pb.authStore.model?.config
    );
    return;
  }
  if (scan) {
    const scanId = scan.id;
    console.log("New scan found", scanId, "for url", scan.url);
    try {
      updateScanStatus(scanId, "running");
    } catch (e) {
      console.log("Error while updating status", e);
    }
    const browser = await browserinit();
    const url = scan.url;
    // update status here to prevent multiple same scans from running at the same time
    try {
      await screenshot(null, url, scanId, browser);
    } catch (e) {
      console.log("error while screenhost", e);
      if (e instanceof errors.WebhoodScannerPageError) {
        errorMessage(e.message, scanId);
      } else if (e instanceof errors.WebhoodScannerTimeoutError) {
        errorMessage(e.message, scanId);
      } else if (e instanceof errors.WebhoodScannerBackendError) {
        errorMessage(e.message, scanId);
      } else if (e instanceof errors.WebhoodScannerInvalidConfigError) {
        errorMessage(e.message, scanId);
      } else {
        errorMessage("Unknown error occurred during scan", scanId);
      }
    } finally {
      console.log("Closing browser");
      browser.close();
    }
  }
}

// Check for new scans every 10 seconds
// this acts as a fallback in case realtime updates are not working for some reason
setInterval(async function () {
  const scans = await checkForNewScans(100);
  scans.forEach(async (scan) => {
    await updateScanStatus(scan.id, "queued");
    await semaphore.runExclusive(async (value) => {
      console.log("Semaphore value", value);
      await startScanning({ scan });
    });
  });
}, 10000);

// Check for old scans every 15 seconds
setInterval(async function () {
  await checkForOldScans();
}, 15000);

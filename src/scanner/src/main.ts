import {
  checkForNewScans,
  checkForOldScans,
  screenshot,
  errorMessage,
  browserinit,
  pb,
  refreshConfig,
} from "./server";
import * as errors from "./errors";
import { Semaphore } from "async-mutex";
import { updateScanStatus } from "./server";
import { ScansResponse, ScanOptions } from "@webhood/types";
import { Browser } from "puppeteer-core";
import * as os from "os";
import { logger } from "./logging";
import { filterScans } from "./utils/other";

/*
 * Main file for the scanner
 * This file is responsible for starting the scanner and checking for new scans
 * It also sets up the realtime subscriptions for the scanner
 * It also sets up the semaphore for limiting the number of simultaneous scans
 * It also sets up the setInterval for checking for new scans
 * It also sets up the setInterval for checking for old scans
 *
 * Do not import any other file in this file
 *
 */

const initialValue = 1;
const semaphore = new Semaphore(initialValue);

const maxScansCount = (): number => {
  const simultaneousScans =
    pb.authStore.model?.expand?.config.config?.simultaneousScans;
  if (isNaN(Number(simultaneousScans))) {
    return 1;
  }
  return Number(simultaneousScans);
};

function subscribeRealtime() {
  pb.collection("scans")
    .subscribe("*", async function (e) {
      if (e.action === "create") {
        logger.debug({ type: "realtimeNewScanCreated", scanId: e.record.id });
        if (semaphore.isLocked()) {
          // if semaphore is locked, skip the scan. The scan will be picked up by the setInterval
          logger.debug({ type: "semaphoreLockedSkipping" });
          return;
        }
        await semaphore.runExclusive(async (value) => {
          await intelligentCheckForNewScans();
        });
      }
    })
    .then(() => {
      logger.info({ type: "realtimeSubscribeSuccess", collection: "scans" });
    })
    .catch((error) => {
      logger.error({ type: "realtimeSubscribeError", collection: "scans" });
      console.error(
        "Error while subscribing to changes in scans collection. Realtime updates will not work",
        error
      );
    });
  pb.collection("scanners")
    .subscribe(pb.authStore.model?.config, async function (e) {
      if (e.action === "update") {
        logger.debug({ type: "configUpdated" });
        await refreshConfig();
        const simultaneousScans = e.record?.config.simultaneousScans;
        if (simultaneousScans) {
          try {
            logger.debug({ type: "setMaxListenersChanged", simultaneousScans });
            process.setMaxListeners(Number(simultaneousScans) + 1);
          } catch (e) {
            console.log("Error while setting semaphore value", e);
          }
        }
      }
    })
    .then(() => {
      logger.info({ type: "realtimeSubscribeSuccess", collection: "scanners" });
    })
    .catch((error) => {
      logger.error({ type: "realtimeSubscribeError", collection: "scanners" });
      console.error(
        "Error while subscribing to changes in scanners collection. Realtime updates will not work",
        error
      );
    });
}

async function memoryConsumption() {
  const constrainedMemory = process.constrainedMemory();
  const currentMemory = process.memoryUsage().rss / 1024 / 1024; // in MB
  console.log(
    "OS memory usage",
    (os.totalmem() - os.freemem()) / os.totalmem(),
    "free memory in mb",
    os.freemem() / 1024 / 1024,
    "total memory in mb",
    os.totalmem() / 1024 / 1024,
    "constrained memory in mb",
    constrainedMemory ? constrainedMemory / 1024 / 1024 : "not set",
    "current rss memory in mb",
    currentMemory
  );
}

type AvailableMemory = {
  availableScans: number;
  isMemoryConstrained: boolean;
};

function scansAvailableMem(): AvailableMemory {
  let available;
  const constrainedMemory = process.constrainedMemory();
  if (constrainedMemory) {
    available = constrainedMemory / 1024 / 1024; // in MB
  } else {
    available = os.freemem() / 1024 / 1024; // in MB
  }
  const neededPerScan = 150; // in MB
  const baseSize = 100; // in MB
  const availableScans = Math.floor(available / (neededPerScan + baseSize));
  logger.debug({
    type: "memoryCheck",
    availableMemory: available,
    isMemoryConstrained: constrainedMemory !== undefined,
    availableScansCalculated: availableScans,
  });
  return {
    availableScans,
    isMemoryConstrained: constrainedMemory !== undefined,
  };
}

async function setup() {
  const data = await refreshConfig();
  const scannerConfig = data.record.expand?.config.config;
  subscribeRealtime();
  const simultaneousScans = scannerConfig?.simultaneousScans;
  if (simultaneousScans) {
    try {
      logger.debug({ type: "setMaxListeners", simultaneousScans });
      process.setMaxListeners(Number(simultaneousScans) + 1);
    } catch (e) {
      logger.warn({ type: "errorSetMaxListeners" });
      console.log("Error while setting semaphore value", e);
    }
  }
}

setup();

async function startScanning({
  scan,
  browser,
}: {
  scan: ScansResponse;
  browser: Browser;
}) {
  const options = scan?.options as ScanOptions;
  if (
    options &&
    options.scannerId &&
    options.scannerId !== pb.authStore.model?.config
  ) {
    logger.info({
      type: "notForThisScanner",
      scanId: scan.id,
      scannerOptionId: options.scannerId,
      thisScannerConfigId: pb.authStore.model?.config,
    });
    return;
  }
  if (scan) {
    const scanId = scan.id;
    logger.info({ type: "newScan", scanId, url: scan.url });
    // update status here to prevent multiple same scans from running at the same time
    try {
      await updateScanStatus(scanId, "running");
    } catch (e) {
      logger.error({
        type: "scanStatusUpdateError",
        scanId,
        scanStatus: "running",
      });
      console.log("Error while updating status", e);
    }
    const url = scan.url;
    try {
      await screenshot(null, url, scanId, browser);
    } catch (e) {
      logger.info({
        type: "scanErrored",
        scanId,
      });
      console.log("error while screenhost. ScanID:", scanId, e);
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
      logger.debug({ type: "scanFinished", scanId });
    }
  }
}

async function intelligentCheckForNewScans() {
  const { availableScans, isMemoryConstrained } = scansAvailableMem();
  const maxCountSetting = maxScansCount();
  const maxSimultaneousScans = isMemoryConstrained
    ? Math.min(maxCountSetting, availableScans)
    : maxCountSetting;
  logger.debug({
    type: "scannerMemoryCheck",
    availableScans,
    maxCountSetting,
    maxSimultaneousScans,
  });
  if (availableScans < maxCountSetting) {
    if (isMemoryConstrained)
      logger.error({
        type: "outOfMemoryForScanError",
        availableScans,
        maxSimultaneousScans,
      });
    else
      logger.warn({
        type: "outOfMemoryForScanWarn",
        availableScans,
        maxSimultaneousScans,
        isMemoryConstrained,
      });
  }
  const { scanrecords: scans } = await checkForNewScans(maxSimultaneousScans);
  if (scans.length === 0) return;
  const filteredScans = await filterScans(scans);
  if (filteredScans.length === 0) return;
  try {
    const browser = await browserinit();
    await Promise.all(
      filteredScans.map(async (scan) => {
        await updateScanStatus(scan.id, "queued");
        await startScanning({ scan, browser });
      })
    );
    logger.debug({ type: "scanPromisesFinished" });
    if (browser) browser.close();
  } catch (error) {
    console.log("Error while starting scanning", error);
    logger.error({
      type: "errorTryIntelligentScans",
      error: error,
    });
  }
}

// Check for new scans every 10 seconds
// this acts as a fallback in case realtime updates are not working for some reason
setInterval(async function () {
  await intelligentCheckForNewScans();
}, 10000);

process.on("unhandledRejection", (error) => {
  console.log("(unhandledRejection listener)", error);
});

// Check for old scans every 15 seconds
setInterval(async function () {
  await checkForOldScans();
}, 15000);

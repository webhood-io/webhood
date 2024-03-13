// Filename: server.js

import {
  Browser,
  HTTPRequest,
  HTTPResponse,
  launch,
  Page,
  TimeoutError,
} from "puppeteer";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import {
  chromePath,
  getNow,
  parsedRequest,
  parsedResponse,
  startTracing,
  stopTracing,
} from "./utils/puppeteerUtils";
import { EnvAuthStore } from "./memoryAuthStore";
import PocketBase from "pocketbase";
import * as errors from "./errors";
import MemoryStream from "memorystream";
// https://github.com/pocketbase/pocketbase/discussions/178
import EventSource from "eventsource";
import { ScansRecord } from "./types/pocketbase-types";
import {
  ScanData,
  ScanStatsRecord,
  WebhoodScandataDocument,
} from "./types/extended";
import { logger } from "./logging";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

// @ts-ignore
global.EventSource = EventSource;

const width = 1920;
const height = 1080;

const GOTO_TIMEOUT = 10000; // 10 seconds

if (!process.env.ENDPOINT || !process.env.SCANNER_TOKEN) {
  console.error(
    "Please set the ENDPOINT and SCANNER_TOKEN environment variables"
  );
}

export const pb = new PocketBase(process.env.ENDPOINT, new EnvAuthStore());
pb.autoCancellation(false);

export async function refreshConfig() {
  return await pb
    .collection("api_tokens")
    .authRefresh({ expand: "config" })
    .catch((error) => {
      console.error("Error while authenticating", error);
      throw new errors.WebhoodScannerInvalidConfigError(
        "Could not authenticate to backend, please check your credentials"
      );
    })
    .then((data) => {
      return data;
    });
}
const errorMessage = (message: string, scanId: string) => {
  if (scanId) {
    updateDocument(scanId, {
      status: "error",
      error: message,
      done_at: new Date().toISOString(),
    });
  }
};
// save document
const updateDocument = async (id: string, data: any) => {
  // todo: fix typ
  const promise = new Promise((resolve, reject) => {
    pb.collection("scans")
      .update(id, data)
      .then((response) => {
        resolve(response);
      })
      .catch((error) => {
        reject(error);
      });
  });
  return promise;
};

export async function getBrowserInfo() {
  // Get config for current scanner
  const authModel = await pb.collection("api_tokens").authRefresh({
    expand: "config",
  });
  const data = authModel.record.expand?.config;
  if (!data?.config) {
    throw new errors.WebhoodScannerInvalidConfigError("Could not get config");
  }
  return data.config;
}

const browserinit = async () => {
  logger.debug({ type: "browserStarting" });
  const pathToExtension = join(
    process.cwd(),
    "fihnjjcciajhdojfnbdddfaoknhalnja"
  );
  const { ua, lang } = await getBrowserInfo();
  const browser = await puppeteer.use(StealthPlugin()).launch({
    executablePath: chromePath,
    args: [
      "--disable-gpu",
      "--start-maximized",
      `--user-agent=${
        ua ||
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36"
      }`, // TODO: change to most recent chrome version
      `--lang=${lang || "en-US"}`,
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`,
      `--window-size=${width},${height}`, // new option
      "--ignore-certificate-errors",
    ],
    defaultViewport: {
      width: width,
      height: height,
    },
    ignoreHTTPSErrors: true,
  });
  return browser;
};

async function constructFromEvaluatePage(
  scanData: ScanData,
  page: Page
): Promise<WebhoodScandataDocument> {
  return await page.evaluate(() => {
    return {
      title: document.title,
      url: document.location.href,
      origin: document.location.origin,
      protocol: document.location.protocol,
      links: Array.from(document.querySelectorAll("a"))
        .map((a) => a.href)
        .filter((a) => a),
    };
  });
}

async function screenshot(
  res: null,
  url: string,
  scanId: string,
  browser: Browser
) {
  const page = await browser.newPage();
  page.on("error", (msg) => {
    logger.error({ type: "pageLoadingErrorListener", scanId });
    throw new errors.WebhoodScannerPageError("Error while loading page:" + msg);
  });
  const memstream = new MemoryStream([]);
  let scanData = {} as ScanData;
  startTracing(page, memstream);
  let pageRes: HTTPResponse | null = null;
  try {
    pageRes = await page.goto(url, { timeout: GOTO_TIMEOUT });
  } catch (e) {
    logger.debug({ type: "pageLoadingTimeout", scanId });
    /*
     * Some pages are slow to load and will timeout, continue with the scan in any case
     * later stages need to ensure that the page is actually loaded and has not otherwise errored
     * example: https://globalcybersecurityforum.com/ takes more than 10 seconds to load
     * TODO: enable setting timeout in config or per scan
     */
  }
  // wait until page is fully loaded
  logger.debug({ type: "waitForDocumentloaded", scanId });
  try {
    await page.waitForNavigation({
      waitUntil: "domcontentloaded",
      timeout: 2000,
    });
  } catch (e) {
    logger.debug({ type: "documentLoadedTimeout", scanId });
  }
  logger.debug({
    type: "pageIsClosed",
    isClosed: page.isClosed(),
    scanId,
    next: "finalUrl",
  });
  const finalUrl = await page.evaluate(() => document.location.href);
  logger.debug({ type: "evaluateScanData", scanId });

  // construct scan data
  scanData.document = await constructFromEvaluatePage(scanData, page);
  scanData.version = "1.0";
  scanData.request = parsedRequest(getNow(), pageRes?.request());
  scanData.response = parsedResponse(getNow(), pageRes);

  if (
    !finalUrl ||
    finalUrl === "about:blank" ||
    finalUrl === "about:blank#blocked" ||
    finalUrl.includes("chrome-error://chromewebdata")
  ) {
    /*
     * about:blank is returned when the page is not loaded
     * about:blank#blocked is returned when the page is blocked
     * chrome-error://chromewebdata can be returned for various reasons. For example, googl.se returns this for some reason
     */
    logger.info({ type: "urlInvalid", finalUrl, scanId });
    throw new errors.WebhoodScannerPageError(
      "Error while getting final url, url might be invalid. Final URL was: " +
        finalUrl
    );
  }
  logger.debug({ type: "evaluatedDone", finalUrl, next: "html" });
  const html = await page.content();
  const endDateTime = new Date().toISOString();
  const imageId = uuidv4();
  let image;
  logger.debug({ type: "htmlGetSuccess", next: "screenshot" });
  try {
    image = await page.screenshot();
  } catch (e) {
    logger.error({ type: "screenshotError", scanId });
    console.log("Error while getting screenshot", scanId, e);
    throw new errors.WebhoodScannerPageError(
      "Error while getting screenshot:" + e
    );
  }
  logger.debug({ type: "screenshotSuccess", scanId, next: "saveToDb" });
  let htmlId = uuidv4();
  const formData = new FormData();
  // make sure no tracing is being written, so close page
  logger.debug({ type: "pageClose", scanId });
  await page.close();
  const trace = JSON.stringify(stopTracing(memstream));
  formData.append(
    "html",
    new File([html], `${htmlId}.html`, { type: "text/html" })
  );
  formData.append(
    "html",
    new File([trace], `trace-${scanId}.json`, { type: "application/json" })
  );
  formData.append(
    "screenshots",
    new File([image], `${imageId}.png`, { type: "image/png" })
  );
  logger.debug({ type: "dbSaveFormData", scanId });
  try {
    await updateDocument(scanId, formData);
  } catch (e) {
    logger.error({ type: "dbSaveFormDataError", scanId });
    console.log("Error while saving formData", e);
    throw new errors.WebhoodScannerBackendError(
      "Error while saving formData:" + e
    );
  }
  logger.debug({
    type: "dbSaveFormDataSuccess",
    scanId,
    next: "saveScanMetadata",
  });
  try {
    const data = {
      final_url: finalUrl,
      scandata: scanData,
      done_at: endDateTime,
      status: "done",
    };
    await updateDocument(scanId, data);
  } catch (e) {
    logger.error({ type: "saveScanMetadataError", scanId });
    console.log("Error while saving final document", e);
    throw new errors.WebhoodScannerBackendError(
      "Error while saving final document:" + e
    );
  }
  logger.debug({
    type: "saveScanMetadataSuccess",
  });
}

const onGoingScans = (stats: ScanStatsRecord[]) => {
  const runningScans = stats.filter((scan) => scan.status === "running")[0];
  const pendingScans = stats.filter((scan) => scan.status === "queued")[0];
  const runningScansCount = runningScans?.count_items || 0;
  const pendingScansCount = pendingScans?.count_items || 0;
  return runningScansCount + pendingScansCount;
};

async function checkForNewScans(maxScans: number) {
  // check for new scans that need to be processed
  // if there are any, process them
  const stats = await pb
    .collection("scanstats")
    .getFullList()
    .catch((error) => {
      logger.error({ type: "errorFetchingScanstats" });
      throw new errors.WebhoodScannerBackendError(error);
    });

  const currentlyRunningScans = onGoingScans(stats as ScanStatsRecord[]);
  const availableScans = maxScans - currentlyRunningScans;
  logger.debug({
    type: "availableScansCheck",
    availableScans,
    currentlyRunningScans,
  });
  if (availableScans <= 0) {
    logger.debug({ type: "scansNotAvailableSkip" });
    return {
      scanrecords: [],
      stats: stats as ScanStatsRecord[],
    };
  }
  const filter =
    'status="pending" && (options.scannerId=null||options.scannerId=""||options.scannerId="' +
    pb.authStore.model?.config +
    '")';
  const data = await pb
    .collection("scans")
    .getList(1, availableScans || 1, {
      filter,
      sort: "created",
    })
    .catch((error) => {
      logger.error({ type: "errorFetchingNewScans" });
      throw new errors.WebhoodScannerBackendError(error);
    });
  if (!data?.items) {
    throw new errors.WebhoodScannerBackendError(
      "Invalid response while fetching new scans"
    );
  }
  return {
    scanrecords: data.items as ScansRecord[],
    stats: stats as ScanStatsRecord[],
  };
}
async function checkForOldScans() {
  // timestamp in format Y-m-d H:i:s.uZ, for example 2021-08-31 12:00:00.000Z
  // https://github.com/pocketbase/pocketbase/issues/2625
  const fiveMinutesAgo = new Date(new Date().getTime() - 300000)
    // format to Y-m-d H:i:s.uZ
    .toISOString()
    // remove last 3 characters
    .slice(0, -5)
    // replace T with space
    .replace("T", " ");

  const records = await pb
    .collection("scans")
    .getFullList({
      filter: `(status="running" && updated<"${fiveMinutesAgo}") || (status="queued" && updated<"${fiveMinutesAgo}")`,
      $cancelKey: "oldScans",
    })
    .catch((error) => {
      logger.error({ type: "errorFetchingOldScans" });
      throw new errors.WebhoodScannerBackendError(error);
    });
  if (records && records.length >= 0) {
    // update all old scans to error
    for (let i = 0; i < records.length; i++) {
      logger.info({ type: "scanTimedOut", scanId: records[i].id });
      errorMessage("Scan timed out", records[i].id);
    }
  }
}

async function updateScanStatus(scanId: string, status: string) {
  return pb
    .collection("scans")
    .update(scanId, {
      status: status,
    })
    .catch((error) => {
      throw new errors.WebhoodScannerBackendError(error);
    });
}

export {
  checkForNewScans,
  checkForOldScans,
  browserinit,
  screenshot,
  updateDocument,
  errorMessage,
  updateScanStatus,
};

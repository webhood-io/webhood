// Filename: server.js

import { Browser, launch, TimeoutError } from 'puppeteer';
import { join } from 'path';
import {v4 as uuidv4} from 'uuid';
import { chromePath, startTracing, stopTracing } from "./utils";
import { EnvAuthStore } from './memoryAuthStore';
import PocketBase from 'pocketbase';
import * as errors from "./errors"
import MemoryStream from "memorystream"
// https://github.com/pocketbase/pocketbase/discussions/178
import EventSource from 'eventsource';
// @ts-ignore
global.EventSource = EventSource


const width = 1920;
const height = 1080;

const GOTO_TIMEOUT = 10000; // 10 seconds

if (!process.env.ENDPOINT || !process.env.SCANNER_TOKEN) {
    console.error('Please set the ENDPOINT and SCANNER_TOKEN environment variables');
}

export const pb = new PocketBase(process.env.ENDPOINT, new EnvAuthStore());

const errorMessage = (message: string, scanId: string) => {
    if(scanId) {
        updateDocument(scanId, {status: "error", error: message, done_at: new Date().toISOString()});
    }
}
// save document
const updateDocument = async (id: string, data: any) => { // todo: fix typ
    const promise = new Promise((resolve, reject) => {
        pb.collection("scans").update(id, data).then((response) => {
            resolve(response);
        }).catch((error) => {
            reject(error);
            throw new errors.WebhoodScannerBackendError(error);
        });
    });
    return promise;
}

async function getBrowserInfo() {
    const data = await pb.collection("scanners").getFirstListItem('');
    if(!data?.config) {
        throw new errors.WebhoodScannerInvalidConfigError('Invalid config');
    }
    return data.config;
}

const browserinit = async () => {
    console.log('Starting browser');
    const pathToExtension = join(process.cwd(), 'fihnjjcciajhdojfnbdddfaoknhalnja');
    const {ua, lang} = await getBrowserInfo();
    const browser = await launch({
        headless: 'new',
        executablePath: chromePath,
        args: [
            "--disable-gpu",
            "--start-maximized",
            `--user-agent=${ua || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36"}`, // TODO: change to most recent chrome version
            `--lang=${lang || "en-US"}`,
            `--disable-extensions-except=${pathToExtension}`,
            `--load-extension=${pathToExtension}`,
            `--window-size=${width},${height}`, // new option
            "--ignore-certificate-errors"
        ],
		defaultViewport: {
			width: width,
			height: height,
		},
        ignoreHTTPSErrors: true,
    });
    return browser;
}

async function screenshot(res: null, url: string, scanId: string, browser: Browser) {
    const page = await browser.newPage();
    page.on('error', msg => {
        console.log('Error while loading page (listener)');
        throw new errors.WebhoodScannerPageError('Error while loading page:' + msg);
    });
    process.on('unhandledRejection', error => {
        console.log('Error while loading page (unhandledRejection listener)');
        throw new errors.WebhoodScannerPageError('Error while loading page (unhandledRejection):' + error);
    });
    const memstream = new MemoryStream([]);
    startTracing(page, memstream)
    try {
        await page.goto(url, { timeout: GOTO_TIMEOUT });
    } catch (e) {
        console.log('Error while loading page (timeout)', e);
        throw new errors.WebhoodScannerPageError('Error while loading page:' + e);
    }

    // wait until page is fully loaded
    console.debug('Waiting for page to finish loading')
    try {
        await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 2000 });
    } catch (e) {
        console.log('Timeout while waiting for page to finish');
    }
    const finalUrl = await page.evaluate(() => document.location.href);
    const html = await page.content();
    const endDateTime = new Date().toISOString();
    const imageId = uuidv4();
    let image;
    try {
        image = await page.screenshot();
    } catch (e) {
        console.log('Error while saving screenshot');
        console.log(e);
        errorMessage( 'Error while saving screenshot', scanId);
        await browser.close();
        return;
    }
    let htmlId = uuidv4();
    const formData = new FormData();
    // make sure no tracing is being written, so close page
    await page.close()
    const trace = JSON.stringify(stopTracing(memstream))
    formData.append('html', new File([html], `${htmlId}.html`, {type: 'text/html'}));
    formData.append('html', new File([trace], `trace-${scanId}.json`, {type: 'application/json'}));
    formData.append('screenshots', new File([image], `${imageId}.png`, {type: 'image/png'}));
    await updateDocument(scanId, formData);
    await browser.close();
    try {
        const data = {
            final_url: finalUrl,
            done_at: endDateTime,
            status: "done",
        };
        await updateDocument(scanId, data);
    } catch (e) {
        console.log('Error while saving document');
        console.log(e);
        errorMessage('Error while saving document', scanId);
    }
}

async function checkForNewScans() {
    // check for new scans that need to be processed
    // if there are any, process them
    const data = await pb.collection("scans").getList(1,1,
        {filter: 'status="pending"'}
    ).catch(error => {
        console.log('Error while fetching new scans');
        throw new errors.WebhoodScannerBackendError(error);
    })
    if(!data?.items) {
        throw new errors.WebhoodScannerBackendError('Invalid response while fetching new scans');
    }
    return data.items;
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
        .replace('T', ' ');


    const records = await pb.collection("scans").getFullList({
        filter: `status="running" && created<"${fiveMinutesAgo}"`,
        '$cancelKey': "oldScans"
    }).catch(error => {
        console.log('Error while fetching old scans');
        throw new errors.WebhoodScannerBackendError(error);
    })
    if(records && records.length >= 0) {
        // update all old scans to error
        for (let i = 0; i < records.length; i++) {
            console.log('Scan timed out', records[i].id)
            errorMessage( 'Scan timed out', records[i].id)
        }
    }
}

function subscribeRealtime () {
    pb.collection('scans').subscribe('*', async function (e) {
        if(e.action === 'create') {
            console.log('New scan created');
            await checkForNewScans();
        }
    }).then(() => {
        console.log('Subscribed to changes in scans collection');
    })
    .catch(error => {
        console.error('Error while subscribing to changes in scans collection. Realtime updates will not work', error);
    })
}

export {
    subscribeRealtime,
    checkForNewScans,
    checkForOldScans,
    browserinit,
    screenshot,
    updateDocument,
    errorMessage,
}
export function updateScanStatus(scanId: string, status: string) {
    pb.collection("scans").update(scanId, {
        status: status
    }).catch(error => {
        throw new errors.WebhoodScannerBackendError(error);
    });
}

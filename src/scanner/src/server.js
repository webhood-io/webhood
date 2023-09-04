// Filename: server.js

import { launch, TimeoutError } from 'puppeteer';
import { join } from 'path';
import {v4 as uuidv4} from 'uuid';
import dotenv from 'dotenv';
import { chromePath } from "./utils.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// get root path of the project
const rootPath = join(__dirname, '..');
dotenv.config({path: join(rootPath, '.env')});
// refactor previous line to use require syntax
import PocketBase from 'pocketbase';
import { EnvAuthStore } from './memoryAuthStore.js';

// https://github.com/pocketbase/pocketbase/discussions/178
import EventSource from 'eventsource';
global.EventSource = EventSource


const width = 1920;
const height = 1080;

const GOTO_TIMEOUT = 10000; // 10 seconds

const Config = {
    followNewTab: false,
    fps: 25,
    videoFrame: {
      width: width,
      height: height
    },
    videoCrf: 18,
    videoCodec: 'libx264',
    videoPreset: 'ultrafast',
    videoBitrate: 1000,
    autopad: {
      color: 'black' | '#35A5FF',
    },
    aspectRatio: '16:9',
  };

if (!process.env.ENDPOINT || !process.env.API_KEY) {
    console.error('Please set the ENDPOINT and API_KEY environment variables');
}

export const pb = new PocketBase(process.env.ENDPOINT, new EnvAuthStore());

const log = (message) => {
    console.log(`${new Date().toISOString()} - ${message}`);
}

const errorMessage = (message, scanId) => {
    if(scanId) {
        updateDocument(scanId, {status: "error", error: message, done_at: new Date().toISOString()});
    }
}
// save document
const updateDocument = async (id, data) => {
    const promise = new Promise((resolve, reject) => {
        console.log(data)
        pb.collection("scans").update(id, data).then((response) => {
            resolve(response);
        }).catch((error) => {
            console.log(error);
            reject(error);
        });
    });
    return promise;
}

async function getBrowserInfo() {
    const data = await pb.collection("scanners").getFirstListItem('');
    return data.config;
}

const browserinit = async () => {
    console.log('Starting browser');
    const pathToExtension = join(process.cwd(), 'fihnjjcciajhdojfnbdddfaoknhalnja');
    const {ua, lang} = await getBrowserInfo();
    console.log('Browser info', ua, lang)
    const browser = await launch({
        headless: 'new',
        executablePath: chromePath,
        args: [
            "--disable-gpu",
            "--start-maximized",
            `--user-agent=${ua || ""}`,
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

async function screenshot(res, url, scanId) {
    const browser = await browserinit();
    const now = new Date().toISOString();
    const page = await browser.newPage();
    try {
        await page.goto(url, { timeout: GOTO_TIMEOUT });
    } catch (e) {
        console.log('Error while loading page');
        console.log(e);
        if(e instanceof TimeoutError) {
            console.log('Timeout while loading page, trying to continue');
        } else {
            errorMessage('Error while loading page', scanId);
            await browser.close();
            return;
        }
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
    formData.append('html', new File([html], `${htmlId}.html`, {type: 'text/html'}));
    formData.append('screenshots', new File([image], `${imageId}.png`, {type: 'image/png'}));
    await updateDocument(scanId, formData);
    await browser.close();
    try {
        const data = {
            final_url: finalUrl,
            done_at: endDateTime,
            status: "done",
        };
        const response = await updateDocument(scanId, data);
    } catch (e) {
        console.log('Error while saving document');
        console.log(e);
        errorMessage('Error while saving document');
    }
}

async function checkForNewScans() {
    // check for new scans that need to be processed
    // if there are any, process them
    const data = await pb.collection("scans").getList(1,1,
        {filter: 'status="pending"'}
    ).catch(error => {
        console.log('Error while fetching new scans');
        console.log(error);
    })
    console.log(data)
    if (data?.items.length > 0) {
        const scan = data.items[0];
        const scanId = scan.id;
        const url = scan.url;
        // update status here to prevent multiple same scans from running at the same time
        pb.collection("scans").update(scanId, {
            status: "running"
        }).catch(error => {
            console.log('Error while updating status');
            console.log(error);
        }).then(() => {
            screenshot(null, url, scanId);
        });
    } 
}
async function checkForOldScans() {
    const fiveMinutesAgo = new Date(new Date().getTime() - 300000).toISOString();
    const records = await pb.collection("scans").getFullList({
        filter: `status="running" && created<"${fiveMinutesAgo}"`,
        '$cancelKey': "oldScans"
    }).catch(error => {
        console.log('Error while fetching old scans');
        console.log(error);
    })
    if(records && records.length >= 0) {
        // update all old scans to error
        for (let i = 0; i < records.length; i++) {
            console.log('Scan timed out', records[i].id)
            errorMessage( 'Scan timed out', records[i].id)
        }
    }
}

// Check for new scans every second
setInterval(async function() {
    await checkForNewScans();
}, 10000);

// Check for old scans every 10 seconds
setInterval(async function() {
    await checkForOldScans();
}, 15000);

// Subscribe to changes in any scans record
pb.collection('scans').subscribe('*', async function (e) {
    if(e.action === 'create') {
        console.log('New scan created');
        await checkForNewScans();
    }
});

console.log("Started")
import {
    checkForNewScans,
    checkForOldScans,
    screenshot,
    errorMessage,
    browserinit,
    subscribeRealtime,
} from './server';
import * as errors from "./errors"
import { updateScanStatus } from './server';

subscribeRealtime()

// Check for new scans every second
setInterval(async function() {
    const scans = await checkForNewScans();
    const scan = scans[0];
    if(scan) {
        const browser = await browserinit();
        const scanId = scan.id;
        const url = scan.url;
        // update status here to prevent multiple same scans from running at the same time
        try {
            updateScanStatus(scanId, "running");
        } catch (e) {
            console.log('Error while updating status', e);
        }
        try {
            await screenshot(null, url, scanId, browser);
        } catch (e) {
            console.log("error while screenhost", e)
            if(e instanceof errors.WebhoodScannerPageError) {
                errorMessage(e.message, scanId);
            }
            else if(e instanceof errors.WebhoodScannerTimeoutError) {
                errorMessage(e.message, scanId);
            }
            else if(e instanceof errors.WebhoodScannerBackendError) {
                errorMessage(e.message, scanId);
            }
            else if(e instanceof errors.WebhoodScannerInvalidConfigError) {
                errorMessage(e.message, scanId);
            } 
            else {
                errorMessage('Unknown error occurred during scan', scanId);
            }
        } finally {
            console.log("Closing browser")
            browser.close();
        }
    }
}, 10000);

// Check for old scans every 10 seconds
setInterval(async function() {
    await checkForOldScans();
}, 15000);


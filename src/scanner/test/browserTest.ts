import { browserinit, screenshot } from "../src/server";
import { expect } from "chai";
import "mocha"; // required for types
import { pb } from "../src/server";
import { WebhoodScannerPageError } from "../src/errors";
import { randomSlug } from "./utils";

describe("Basic scanner tests", function() {
  this.timeout(20000);
  it("should launch browser", async () => {
    const browser = await browserinit();
    const connected = browser.connected;
    console.log("Browser is connected: ", connected);
    expect(browser.connected).to.equal(true);
    await browser.close();
  })
  it("should navigate to google.com", async () => {
    const browser = await browserinit();
    const page = await browser.newPage();
    await page.goto("https://google.com");
    expect(browser.connected).to.equal(true);
    const finalUrl = await page.evaluate(() => document.location.href);
    expect(finalUrl).to.equal("https://www.google.com/");
    await browser.close();
  })
  it("should run screenshot", async (done) => {
    const scans = pb.collection("scans");
    const data = await scans.create({
      url: "https://google.com",
      status: "pending",
      slug: randomSlug(),
    });
    const browser = await browserinit();
    await screenshot(null, data.url, data.id, browser);
    await browser.close();
    const updatedData = await scans.getOne(data.id);
    expect(updatedData.final_url).to.equal("https://www.google.com/");
    expect(updatedData.status).to.equal("done");
    expect(updatedData.screenshots).to.have.length(1);
    expect(updatedData.html).to.have.length(2); // with trace
    expect(updatedData.error).to.be.empty;
    done();
  })
});

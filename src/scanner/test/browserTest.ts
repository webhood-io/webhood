import { browserinit, screenshot } from "../src/server";
import { expect } from "chai";
import "mocha"; // required for types
import { pb } from "../src/server";
import { WebhoodScannerPageError } from "../src/errors";
import { randomSlug } from "./utils";

const browser = await browserinit();

describe("Basic scanner tests", function() {
  this.timeout(20000);
  it("should launch browser", async () => {
    const connected = browser.connected;
    console.log("Browser is connected: ", connected);
    expect(browser.connected).to.equal(true);
  })
  it("should navigate to google.com", async () => {
    const page = await browser.newPage();
    await page.goto("https://google.com");
    expect(browser.connected).to.equal(true);
    const finalUrl = await page.evaluate(() => document.location.href);
    expect(finalUrl).to.equal("https://www.google.com/");
  })
  it("should run screenshot", async () => {
    console.log("Running screenshot");
    const scans = pb.collection("scans");
    const data = await scans.create({
      url: "https://google.com",
      status: "pending",
      slug: randomSlug(),
    });
    console.log("Data created", data);
    await screenshot(null, data.url, data.id, browser);
    const updatedData = await scans.getOne(data.id);
    expect(updatedData.final_url).to.equal("https://www.google.com/");
    expect(updatedData.status).to.equal("done");
    expect(updatedData.screenshots).to.have.length(1);
    expect(updatedData.html).to.have.length(2); // with trace
    expect(updatedData.error).to.be.empty;
  })
});

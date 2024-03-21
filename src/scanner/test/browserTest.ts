import { expect } from "chai";
import "mocha"; // required for types
import { browserinit, pb, screenshot } from "../src/server";
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
    const prom = new Promise((resolve, reject) => {
      screenshot(null, data.url, data.id, browser, resolve, reject);
    });
    await prom
    const updatedData = await scans.getOne(data.id);
    expect(updatedData.final_url).to.equal("https://www.google.com/");
    expect(updatedData.status).to.equal("done");
    expect(updatedData.screenshots).to.have.length(1);
    expect(updatedData.html).to.have.length(2); // with trace
    expect(updatedData.error).to.be.empty;
  })
});

describe("E2E scanner tests", function() {
  this.timeout(60000); 
  import("../src/main");
  // remove all pending scans, otherwise they will be picked up by the scanner and they wont be finished until timeout
  before(async () => {
    const scans = pb.collection("scans");
    const allScans = await scans.getFullList({ filter: 'status="pending"'})
    await Promise.all(allScans.map((scan) => scans.update(scan.id, { status: "error" })));
  })
  it("should finish scan e2s", async () => {
    // Wait for scanner to start and subscribe to realtime
    await new Promise((resolve) => setTimeout(resolve, 10000));
    const scans = pb.collection("scans");
    const data = await scans.create({
      url: "https://google.com",
      status: "pending",
      slug: randomSlug(),
    });
    // sleep for 10 seconds
    await new Promise((resolve) => setTimeout(resolve, 10000));
  })
  it("should error on bad site", async () => {
    const scans = pb.collection("scans");
    const data = await scans.create({
      url: "https://googl.se",
      status: "pending",
      slug: randomSlug(),
    });
    // sleep for 10 seconds
    await new Promise((resolve) => setTimeout(resolve, 10000));

    let scanResults;
    scanResults = await scans.getOne(data.id);
    while(scanResults.status === "running"){
      // wait for 10 seconds more
      await new Promise((resolve) => setTimeout(resolve, 10000));
      scanResults = await scans.getOne(data.id);
    }
    expect(scanResults.status).to.equal("error");
    expect(scanResults.error).to.not.be.empty;
  });
  it("should download sample file" , async () => {
    const scans = pb.collection("scans");
    const data = await scans.create({
      url: "https://getsamplefiles.com/download/mp4/sample-5.mp4",
      status: "pending",
      slug: randomSlug(),
    });
    // sleep for 10 seconds
    await new Promise((resolve) => setTimeout(resolve, 10000));

    let scanResults;
    scanResults = await scans.getOne(data.id);
    while(scanResults.status === "running"){
      // wait for 10 seconds more
      await new Promise((resolve) => setTimeout(resolve, 10000));
      scanResults = await scans.getOne(data.id);
    }
    expect(scanResults.status).to.equal("done");
    expect(scanResults.error).to.be.empty;
    expect(scanResults.files).to.have.length(1);
  });
})


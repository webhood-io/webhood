import { ScansResponse } from "@webhood/types";
import { expect } from "chai";
import "mocha"; // required for types
import { filterScans } from "../src/utils/other";
import { pb } from "../src/utils/pbUtils";
import { randomSlug } from "./utils";

describe("other scanner tests", () => {
  it("should filter local site", async () => {
    const scansModel = pb.collection("scans");
    const localScan = await scansModel.create({
      url: "https://localhost",
      status: "pending",
      slug: randomSlug(),
    });
    const publicScan = await scansModel.create({
      url: "https://google.com",
      status: "pending",
      slug: randomSlug(),
    });
    const scans = [localScan, publicScan] as ScansResponse[];
    process.env.SCANNER_NO_PRIVATE_IPS = "true";
    const filtered = await filterScans(scans);
    process.env.SCANNER_NO_PRIVATE_IPS = "false";
    const notFiltered = await filterScans(scans);
    expect(scans).to.have.length(2);
    expect(filtered).to.have.length(1);
    expect(filtered[0].url).to.equal("https://google.com");
    expect(notFiltered).to.have.length(2);
  });
});

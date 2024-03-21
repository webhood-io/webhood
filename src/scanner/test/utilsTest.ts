import { expect } from "chai";
import {resolvesPublicIp} from "../src/utils/dnsUtils";

describe("test DNS utils", () => {
    it("should resolve google.com", async () => {
        await resolvesPublicIp("https://google.com");
    });
    it("should error on localhost", async () => {
        let error;
        try {
            await resolvesPublicIp("https://localhost");
        } catch (e) {
            error = e;
        }
        expect(error).to.not.be.undefined;
        // expect error to read "Not a public IP"
        expect(error.message).to.equal("Not a public IP");
    });
});
// get chrome path
// /usr/bin/google-chrome in linux
// /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome in mac
// C:\Program Files (x86)\Google\Chrome\Application\chrome.exe in windows

import { HTTPRequest, HTTPResponse, Page } from "puppeteer-core";
import {
  WebhoodScandataRequest,
  WebhoodScandataResponse,
} from "@webhood/types";
import MemoryStream from "memorystream";

//
const chromePath = (function () {
  if (process.platform === "win32") {
    return "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
  } else if (process.platform === "darwin") {
    return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  } else {
    return "/usr/bin/google-chrome";
  }
})();

const getNow = () => {
  return Date.now();
};

const parsedResponse = (
  now: number,
  response: HTTPResponse | null
): WebhoodScandataResponse | null => {
  if (!response) return null;
  return {
    type: "response",
    url: response.url(),
    ts: getNow() - now,
    status: response.status(),
    remoteAddress: {
      ip: response.remoteAddress().ip,
      port: response.remoteAddress().port,
    },
    headers: response.headers(),
    timing: response.timing(),
    securityDetails: {
      issuer: response.securityDetails()?.issuer(),
      protocol: response.securityDetails()?.protocol(),
      subjectAlternativeNames: response
        .securityDetails()
        ?.subjectAlternativeNames(),
      subjectName: response.securityDetails()?.subjectName(),
      validFrom: response.securityDetails()?.validFrom(),
      validTo: response.securityDetails()?.validTo(),
    },
  };
};

const parsedRequest = (
  now: number,
  request?: HTTPRequest
): WebhoodScandataRequest | null => {
  if (!request) return null;
  return {
    type: "request",
    url: request.url(),
    headers: request.headers(),
    method: request.method(),
    resourceType: request.resourceType(),
    postData: request.postData(),
    redirectChain: request
      .redirectChain()
      .map((req) => req.url())
      .filter((u) => u),
    ts: getNow() - now,
  };
};

function startTracing(page: Page, stream: MemoryStream): void {
  const now = getNow();
  /*
    await page.tracing.start({
        categories: ['devtools.timeline']
    });
    */
  /*
    page.on('response', response => {
        stream.write(JSON.stringify(
            parsedResponse(now, response)
        ) + "\n")
    })
    */
  page.on("requestfinished", (request) => {
    stream.write(
      JSON.stringify({
        request: parsedRequest(now, request),
        response: parsedResponse(now, request.response()),
        type: "requestfinished",
      }) + "\n"
    );
  });
  page.on("requestfailed", (request) => {
    stream.write(
      JSON.stringify({
        request: parsedRequest(now, request),
        response: parsedResponse(now, request.response()),
        type: "requestfailed",
      }) + "\n"
    );
  });
  return;
}
function stopTracing(stream: MemoryStream): object {
  const streamData = stream.read().toString().split("\n") as Array<string>;
  const streamDataArr = [] as Array<object>;
  streamData.forEach((element) => {
    if (element) {
      const elementObj = JSON.parse(element);
      streamDataArr.push(elementObj);
    }
  });
  stream.end("");
  return {
    version: "0.1",
    traces: streamDataArr,
  };
}

export {
  chromePath,
  startTracing,
  stopTracing,
  parsedRequest,
  parsedResponse,
  getNow,
};

import RecaptchaPlugin from "puppeteer-extra-plugin-recaptcha";
import types from "puppeteer-extra-plugin-recaptcha/dist/types";
import config from "../config/main";

const PROVIDER_ID = "webhood-cloud";

const secondsBetweenDates = (date1: Date, date2: Date) =>
  Math.abs(date1.getTime() - date2.getTime()) / 1000;

export async function getSolutions(
  captchas: types.CaptchaInfo[] = [],
  token: string = ""
): Promise<types.GetSolutionsResult> {
  console.log("Getting solutions for", captchas.length, "captchas");
  const solutions = await Promise.all(
    captchas.map((c) => getSolution(c, token))
  );
  return { solutions, error: solutions.find((s) => !!s.error) };
}

async function decodeRecaptchaAsync(
  token: string,
  vendor: string,
  sitekey: string,
  url: string,
  extraData: any = {}
): Promise<{ err: any; result: any; invalid: boolean }> {
  const apiUrl = config.cloudUrl + "/solve";
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${token}`,
    },
    body: JSON.stringify({
      vendor,
      sitekey,
      url,
      ...extraData,
    }),
  });
  const json = await response.json();
  if (!response.ok) {
    console.error("Error from cloud", json);
    return { result: null, err: json, invalid: true };
  }
  return { result: json, err: null, invalid: false };
}

async function getSolution(
  captcha: types.CaptchaInfo,
  token: string
): Promise<types.CaptchaSolution> {
  const solution: types.CaptchaSolution = {
    _vendor: captcha._vendor,
    provider: "webhood-cloud",
  };
  try {
    if (!captcha || !captcha.sitekey || !captcha.url || !captcha.id) {
      throw new Error("Missing data in captcha");
    }
    solution.id = captcha.id;
    solution.requestAt = new Date();
    const extraData: any = {};
    if (captcha.s) {
      extraData["data-s"] = captcha.s; // google site specific property
    }
    if (captcha.action) {
      extraData["action"] = captcha.action;
    }
    const { err, result, invalid } = await decodeRecaptchaAsync(
      token,
      captcha._vendor,
      captcha.sitekey,
      captcha.url,
      extraData
    );
    if (err) throw new Error(`${PROVIDER_ID} error: ${err}`);
    if (!result || !result.text || !result.id) {
      throw new Error(`${PROVIDER_ID} error: Missing response data: ${result}`);
    }
    solution.providerCaptchaId = result.id;
    solution.text = result.text;
    solution.responseAt = new Date();
    solution.hasSolution = !!solution.text;
    solution.duration = secondsBetweenDates(
      solution.requestAt,
      solution.responseAt
    );
  } catch (error) {
    console.error("Error while solving", error);
    solution.error = error.toString();
  }
  return solution;
}

export const cloudCaptchaPlugin = (apiKey: string) =>
  RecaptchaPlugin({
    provider: {
      id: "webhood-cloud",
      fn: getSolutions,
      token: apiKey,
    },
  });

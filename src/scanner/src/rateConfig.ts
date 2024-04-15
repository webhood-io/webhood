type RateConfig = {
  goto_timeout: number;
};

type RateConfigObject = {
  fast: RateConfig;
  balanced: RateConfig;
  slow: RateConfig;
};

export const rateConfig: RateConfigObject = {
  fast: {
    goto_timeout: 5_000,
  },
  balanced: {
    goto_timeout: 10_000,
  },
  slow: {
    goto_timeout: 20_000,
  },
};

const DEFAULT_RATE = "fast";

const width = 1920;
const height = 1080;

const WAIT_FOR_DOWNLOAD_TIMEOUT = 5_000; // 5 seconds. This is the time to wait for a download to start without knowing if there will be a download or not

export { DEFAULT_RATE, WAIT_FOR_DOWNLOAD_TIMEOUT, height, width };

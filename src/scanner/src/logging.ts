import pino from "pino";

const transport = () => {
  console.log(process.env.NODE_ENV);
  if (process.env.NODE_ENV === "development")
    return {
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
        },
      },
    };
};

const logLevel = () => {
  return process.env.LOG_LEVEL || "info";
};

export const logger = pino({
  level: logLevel(),
  ...transport(),
});

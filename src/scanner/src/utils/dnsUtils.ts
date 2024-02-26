import dns from "node:dns";
import ip from "ip";
import url from "node:url";

export function resolvesPublicIp(scanurl: string): Promise<string> {
  const hostname = new url.URL(scanurl).hostname;
  return new Promise((resolve, reject) => {
    dns.lookup(hostname, (err, address) => {
      if (err) {
        reject(err);
      } else {
        if (!ip.isPrivate(address)) {
          resolve(address);
        } else {
          reject(new Error("Not a public IP"));
        }
      }
    });
  });
}

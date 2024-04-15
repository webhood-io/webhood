# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v1.0.0]

### Added

- Scan options: 
  - When starting a new scan, it is now possible to configure different speeds `Fast`, `Balanced (default)` and `Slow` for the scan. The `Slow` setting may help scanning some websites that are slow to load and do not show all images or other website resources upon finishing the scan. Likewise, the `Fast` setting may sometimes be preferable if scanning websites that do no properly notify the browser that the site has loaded its most important resources (such as [DOMContentLoaded event](https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event)).

    For now the settings simply set different timeouts on the scanner, but we may fine tune the specific settings further in the future.

- Scan metadata fields:
  - Initiated at: when the scan was first initiated
  - Started scanning at: when the scan was actually picked up by a scanner
  - Finished: when the scanner finished with the scan
  - Duration in seconds between `Started` and `Finished`
  - Initiated by user: which user created the scan.
  - Scanner config: the configuration of the scanner at the time when the scan was run.
  - Scan options: any additional options passed to the specific scan (via `scan options` setting in the UI).

- Recent scans fields: 
  - username (or API key ID) of whoever started the scan.
  - name (or ID) of the scanner which performed the scan.

- Scanner settings:
  - Added dropdown menu to create and delete a scanner instance and refresh the API token for the scanner.
  - Added new `Use Cloud API` setting. This setting and its sub-configurations allow connecting to cloud.webhood.io for additional features. Currently, a Captcha solver can be used to bypass Captchas nowadays common on phishing websites to try prevent automated scanning of the site.


### Fixed

### Changed

### Removed

## [v0.9.1] - 2024-04-04

### Fixed
- 🚨 This update fixes a security vulnerability. More information will follow as a security advisory. 

## [v0.9.0] - 2024-03-21

### Added

- Configure scanner to run in `Stealth mode`. Stealth mode tries to configure the browser to appear as a real user. This is useful when you want to scan sites that block bots. The feature utilizes [puppeteer-extra-plugin-stealth](https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra-plugin-stealth).

- Configure scanner to run in `Skip cookie prompts` mode. This mode enables 'I don't care about cookies' extension to bypass prompts to accept cookies. This is useful when you want to scan sites that have cookie prompts that prevent you from seeing what is actually on the site. The feature utilizes [I don't care about cookies](https://chromewebstore.google.com/detail/fihnjjcciajhdojfnbdddfaoknhalnja) browser extension.
  - ⚠️ ️️️Note: this feature was previously enabled by default, but was not documented. It now must be explicitly enabled by setting `Skip cookie prompts` in Settings --> General in the scanner configuration UI.
 
- Added new "Details" tab in the scan results UI. The tab contains detailed information about the scanned page such as request headers, host IP address and port, links found on the page etc. The table allows you to filter different types of data and pin interesting data to the top of the table. Pinned data is saved to the browser's local storage and will be available on all scan results.

- Webhood now stores downloaded files in the database when the site automatically initiates a download. You can download the file from the scan results UI (`Metadata` tab) by clicking the `Download` link. The file is downloaded to your computer as a zip file. At the moment, the maximum file size is set to 50MB.

### Fixed

- Fixed an issue causing 'Settings saved' message to not appear when saving settings in the scanner configuration UI specifically when save was pressed more than once. 

- Added error handling on 'Add user' sheet. Previously, if the user registration failed due to backend error, the user was not notified of the failure.

- Fixed an issue where the `slug` (a link to the scan results) was not generated correctly when the URL contained port number or an IP address. The slug is now properly URL-encoded.

- Fixed some scans running twice when the user started a scan. This was caused by the scanner picking up the scan twice. The issue was fixed by adding a check to the scanner to see if the scan is already running.

### Changed

- Login page now has the Webhood logo in place of "Login" title text.

- Scan results UI now has icon that displays the scan status. The icon is located in the title of the page.

- In Scan results page, moved metadata about the scan as start and end time to the "Metadata" tab in the scan results UI.

- Buttons that open POST data and header details in the Traceviewer are now slightly more visible.

## [v0.8.1] - 2024-03-10

### Changed
- Backend healthcheck lowered to 10 seconds from 30 seconds. This is to shorten the time to initially start the whole deployment as the container starts in mere seconds and previously the first check was only run after 30 seconds. [[commit]](https://github.com/webhood-io/webhood/commit/ea8a10c22c271be4dfaa434ee434f42957456582)

### Fixed
- Inline comments in example `.env.example` broke the deployment. The comments were moved to a newline. [[commit]](https://github.com/webhood-io/webhood/commit/7bfab4a90109e0a45ef5045b89de313523fd27b5)
- HTML -tab now grays out as it shuld when the scan is not yet complete or it did not finish successfully. [[commit]](https://github.com/webhood-io/webhood/commit/febb4373b04e4a281c9da0495192fd439b444ca6


## [v0.8.0] - 2024-03-07

### Added

- Added option to limit scans of URLs that resolve to private IP addresses (`SCANNER_NO_PRIVATE_IPS`). This is useful when you want to prevent scanning of internal sites. [[commit]](https://github.com/webhood-io/webhood/commit/de52fe8188adc24c62911f17ad51ceaec584f33e)

### Changed

- Added warning to the main scanning UI when there are no scanners configured. [[commit]](https://github.com/webhood-io/webhood/pull/145/commits/9265c592f4377031ebd57300e49bfb72fb0ed14f)
- `EXTERNAL_URL` environment variable is now optional. The variable can be set to point to the external URL of the backend. This variable is only useful when the backend is located in another port/host than the UI. This variable will default to `/` [[commit]](https://github.com/webhood-io/webhood/pull/145/commits/f2dc91c7516eebef31def4b3f6a1c1357c3b2af9)

## [v0.7.1] - 2024-02-23

### Fixed

- Fixed broken scanner image which was caused by updating the base image to a newer version of Debian (Bookworm). The seccomp profile was not compatible with the new version. The issue was fixed by reverting back to Debian-Bullseye [[commit]](https://github.com/webhood-io/webhood/commit/d9dffb37a33140d2abd80c100f9fc915ddfa758c)

### Added

- Added optional `SCANNER_LOG_LEVEL` to the  [environment variables](.env.example). This variable can be used to set the logging level of the scanner. The default value is `info`. The possible values are `fatal` | `error` | `warn` | `info` | `debug` | `trace`. [[commit]](https://github.com/webhood-io/webhood/commit/5d0a964b4cecdf1f972324f67dd452f6389a3aea)


## [v0.7.0] - 2024-02-22

### Added

- Added scanner stats table in the UI [[commit]](https://github.com/webhood-io/webhood/commit/4ef9cce4f19a46cb318d65915afa269c1f410d1f)

- Added proper logging in scanner using [pino](https://github.com/pinojs/pino). The logging level is set by environment variable `LOG_LEVEL="fatal" | "error" | "warn" | "info" | "debug" | "trace"`. [[commit]](https://github.com/webhood-io/webhood/commit/e7c1fbd137f3750f7aa8b44c54d96322f63b0cb1)

- Added support scanning sites with fonts in Traditional and Simplified Chinese, Japanese and Korean


### Fixed

- Scanning logic has been overhauled to fix a bugs. The new logic works as follows:
  - Scans are run in order (oldest first)
  - Max simultaneous scans -setting is correctly enforced. 
  - New scans are picked up by the scanner every 10 seconds
  - When the user starts a new scan, it is run immediately if there are no other "immediate" scans running. Subsequent "immediate" will be picked up by the scanner 

- Fixed an issue causing the scanner to crash when the page HTML was more than 5MB in size. Added proper error handling for this case and increased the max HTML size to 20MB. [[commit]](https://github.com/webhood-io/webhood/commit/7891884772036e3870e0af190f16800288f75e53)

### Changed

-  Scanner will intelligently limit the number of simultaneous scans when the memory is [hard-constrained](https://nodejs.org/api/process.html#processconstrainedmemory) which is sometimes done in container environments. If the memory is not constrained, the scanner will output a warning if it thinks the `simultaneous scans` -setting is too high. This is done because it is easy to clog a host by setting the limit too high. As a base rule, you should have 150MB of memory available per simultaneous scan.

## [0.6.0] - 2024-02-14

### Added

- Ability to configure and run multiple scans simultaneously. [[commit]](https://github.com/webhood-io/webhood/commit/5689726bb8793ea22001e40f5f704116abbc75e0)

### Fixed

- Fixed unnecessary delay in starting a scan. Scans now start immediately after the scan is created. [[commit]](https://github.com/webhood-io/webhood/commit/5689726bb8793ea22001e40f5f704116abbc75e0)

- Fixed [favicon](src/core/public/favicon.svg) not being correctly displayed in browser tab. [[commit]](https://github.com/webhood-io/webhood/commit/5a840abcf5ee98f655290c1ca16962ad11e603c4)

## [0.5.1] - 2024-02-07

### Fixed

- Fixed an issue preventing new scanners from being created in the backend. [[commit]](https://github.com/webhood-io/webhood/commit/7cf6d53f39ab3af3948abca7f73e12cb64030388)

## [0.5.0] - 2024-01-04

⚠️ This update includes important breaking changes to the docker-compose file. It is necessary to update your [docker-compose.yml](https://github.com/webhood-io/webhood/blob/main/docker-compose.yml) file to reflect the changes in this version.

You can run the following command to compare your `docker-compose.yml` file with the latest version:

```bash
git diff main:docker-compose.yml docker-compose.yml
```

### Added

- It is now possible to configure multiple scanners to communicate with the main Webhood backend. This is useful for example when you want to run multiple scanners in different locations.

```bash
docker compose run backend create_scanner -u scanner2

docker compose run backend create_scanner_token -u scanner2
```

### Fixed

- Scanner will now output a warning if the authentication fails [[commit]](https://github.com/webhood-io/webhood/commit/97bbbe8402ebef321a5e3788ed3e91b80bbc68b3#diff-021b9439f0d6e98c111e7ca7ad1b6237f831bd0e2f16c05c9d2040492b869baa)

### Changed

- ⚠ Removed use of `migrations` volume in `docker-compose.yml`. This volume is not needed as the migrations directory is updated in the backend image. [[commit]](https://github.com/webhood-io/webhood/commit/35fdf9655468b14a282bbe09a21666088c839800)
- Minor changes to UI to make it more consistent [[commit]](https://github.com/webhood-io/webhood/commit/6542056cc69c871f31e6d90fc7a2ab616e41541d)


## [0.4.0] - 2023-12-08

### Added

- The (still officially not-yet-released) API was rewritten to use the Pocketbase backend. This decision was due to the fact that during testing of a few upcoming integrations, I found that nextjs is not flexible enough for full-fledged API use case.

### Fixed

- Fix docker-compose.yml file to use the correct environment variables for using your own TLS certificates with kong. [[commit]](https://github.com/webhood-io/webhood/commit/54da0d3849ce517bc9a8d936173551884bb2badd)
- Docker healthcheck was added to the docker-compose.yml file. Backend not being ready sometimes caused scanner to fail to subscribe to realtime events. [[commit]](https://github.com/webhood-io/webhood/commit/17c7e2123c4d4d6af29a58e5cdd3226236f4d24c)
- ⚠️ This update includes important fixes to the docker-compose file. It is recommended to update your docker-compose.yml file to reflect the changes in this version. [[commit]](https://github.com/webhood-io/webhood/pull/90/files#diff-e45e45baeda1c1e73482975a664062aa56f20c03dd9d64a827aba57775bed0d3)

### Removed

none

## [0.3.0] - 2023-10-29

### Added

- This changelog
- Trace viewer (preview). Trace viewer enables inspecting HTTP request and response metadata associated with visiting the site. Note that the feature is in preview. New versions will likely break older versions of the trace meaning you might not be able to use the UI trace viewer to view old scans.
 <img width="1402" alt="Screenshot of the new trace viewer feature" src="https://github.com/webhood-io/webhood/assets/28872014/4af17167-d797-4106-ac49-8461bd32b7af">


### Fixed

- Fix issue causing the loading of files such as images and html code in codeviewer to fail. This issue was caused by poor handling of the special short-lived file authentication token in PocketBase. This authentication token is now updated every minute to make sure it does not expire [[commit]](https://github.com/webhood-io/webhood/pull/59/commits/9d4d3117d5c1e2d029a54d62a08ac42c9b413ace).
- Static placeholder images in dashboard load properly [[commit]](https://github.com/webhood-io/webhood/pull/59/commits/571279d65399a952919527bb3b24de0476964f62).
- Bunch of scanning edge case errors causing unhandled scanner exceptions. 

### Changed
- ⚠️ `API_KEY` scanner environment variable changed to `SCANNER_TOKEN` [[commit]](https://github.com/webhood-io/webhood/pull/59/commits/ba4a2cebc00a6dfdbccaaf21015fa171277b29dc). You must update your `docker-compose.yml` and `.env` file to reflect the changed environment variable when updating to this version.

### Removed
none

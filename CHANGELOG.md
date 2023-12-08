# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

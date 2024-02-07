# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [Unreleased]

### Added

### Fixed

### Changed

### Removed

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

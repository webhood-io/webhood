<p align="center">
<img src="https://user-images.githubusercontent.com/28872014/233656281-c8a7dec2-60cc-410b-9c33-00b3954f211a.png#gh-light-mode-only">
<img src="https://user-images.githubusercontent.com/28872014/233656053-174c723d-bcc7-445b-9033-517313c2158a.png#gh-dark-mode-only">
</p>

# Webhood

[Webhood](https://webhood.io) is a free URL scanner hosted by you, whether in AWS, Azure, Google Cloud, or your own server, you control the data. Webhood is a modern, simple and private URL scanner that helps you analyze website and find if they are safe to visit.


![Latest release](https://img.shields.io/github/v/release/webhood-io/webhood?label=Latest%20release&style=for-the-badge)
![GitHub Workflow Status (with event)](https://img.shields.io/github/actions/workflow/status/webhood-io/webhood/publish.prod.yml?display_name=Build%20status&style=for-the-badge)


[![CodeQL](https://github.com/webhood-io/webhood/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/webhood-io/webhood/actions/workflows/github-code-scanning/codeql)
[![E2E tests](https://github.com/webhood-io/webhood/actions/workflows/cypress-e2e.dev.yml/badge.svg)](https://github.com/webhood-io/webhood/actions/workflows/cypress-e2e.dev.yml)
[![Component tests](https://github.com/webhood-io/webhood/actions/workflows/cyress-core.dev.yml/badge.svg)](https://github.com/webhood-io/webhood/actions/workflows/cyress-core.dev.yml)

## Demo

https://github.com/webhood-io/webhood/assets/28872014/66de2fd6-2327-4903-bab4-d92c2bc5e1a5

## Documentation

For full documentation, visit [webhood.io/docs](https://webhood.io/docs)

## Community & Support

- [Community Forum](https://github.com/webhood-io/discussions). Best for: help with building, discussion about Webhood and best practices.
- [GitHub Issues](https://github.com/webhood-io/webhood/issues). Best for: bugs and errors you encounter using Webhood.
- [Email](https://webhood.io/docs/support). Best for: problems with the app, security issues, and sensitive information that you do not want to share publicly.

## Status

- [x] Alpha: We are testing Webhood internally and with a closed set of customers
- [x] Public Alpha: Anyone can set up own deployment. Do expect bugs and missing features as well as breaking changes.
- [ ] Public Beta: Stable enough for most use-cases
- [ ] Public: General Availability

Watch "releases" of this repo to get notified of major updates.

---

## How it works

Webhood is a combination of open source tools as well as freely available, but (currently) non-open source components that make up the full deployment that includes file storage, authentication, database, URL scanner as well as rich UI. 

You can check out the [architecture diagram](https://webhood.io/docs/security) to get a better idea of how Webhood works.

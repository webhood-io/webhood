
class WebhoodScannerError extends Error {
    constructor(message) {
      super(message);
      this.name = this.constructor.name;
    }
  }
  
  class WebhoodScannerTimeoutError extends WebhoodScannerError {
    constructor(message) {
      super(message);
      this.name = this.constructor.name;
    }
  }
  
  class WebhoodScannerPageError extends WebhoodScannerError {
    constructor(message) {
      super(message);
      this.name = this.constructor.name;
    }
  }
  
  class WebhoodScannerBackendError extends WebhoodScannerError {
    constructor(message) {
      super(message);
      this.name = this.constructor.name;
    }
  }

  class WebhoodScannerInvalidConfigError extends WebhoodScannerError {
    constructor(message) {
      super(message);
      this.name = this.constructor.name;
    }
  }

  export {
    WebhoodScannerError,
    WebhoodScannerTimeoutError,
    WebhoodScannerPageError,
    WebhoodScannerBackendError,
    WebhoodScannerInvalidConfigError
  }
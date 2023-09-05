// get chrome path
// /usr/bin/google-chrome in linux
// /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome in mac
// C:\Program Files (x86)\Google\Chrome\Application\chrome.exe in windows
//
const chromePath = (function () {
    if (process.platform === 'win32') {
        return 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
    } else if (process.platform === 'darwin') {
        return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    } else {
        return '/usr/bin/google-chrome';
    }
})();


export {
    chromePath
}
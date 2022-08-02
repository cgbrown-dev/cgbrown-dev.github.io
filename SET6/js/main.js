
chrome.app.runtime.onLaunched.addListener(function () {

    chrome.app.window.create('index.html', {
        'bounds': {
          // 'width': 1280,
          // 'height': 720
          'width': 1920,
          'height': 1080
        },
        'resizable' : false,
        'state' : "fullscreen"
    });

});

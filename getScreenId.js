/* globals getScreenId */

(function() {
    window.getScreenId = function(callback) {
        // for Firefox:
        // sourceId == 'firefox'
        // screen_constraints = {...}
        if (navigator.mozGetUserMedia) {
            callback(null, 'firefox', {
                audio: true,
                video: true
            });
            return;
        }

        window.addEventListener('message', onMessageCallback);

        window.postMessage('get-sourceId', '*');


        function onMessageCallback(event) {
            console.log(event);
            if (!event.data) return;

            if (event.data.chromeMediaSourceId) {
                if (event.data.chromeMediaSourceId === 'PermissionDeniedError') {
                    callback('permission-denied');
                } else callback(null, event.data.chromeMediaSourceId, getScreenConstraints(null, event.data.chromeMediaSourceId));
            }

            if (event.data.chromeExtensionStatus) {
                callback(event.data.chromeExtensionStatus, null, getScreenConstraints(event.data.chromeExtensionStatus));
            }
        }
    };

    function getScreenConstraints(error, sourceId) {
        var screen_constraints = {
            audio: true,
            video: {
                mandatory: {
                    chromeMediaSource: error ? 'screen' : 'desktop',
                    maxWidth: window.screen.width > 1920 ? window.screen.width : 1920,
                    maxHeight: window.screen.height > 1080 ? window.screen.height : 1080
                },
                optional: []
            }
        };

        if (sourceId) {
            screen_constraints.video.mandatory.chromeMediaSourceId = sourceId;
        }
        return screen_constraints;
    }
    // this function is used in v3.0
    window.getScreenConstraints = function(callback) {
        getScreenId(function(error, sourceId, screen_constraints) {
            callback(error, screen_constraints.video);
        });
    };
})();
(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
  var hlsLoading = false;
  var hlsCallbacks = [];

  function loadLibrary(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    hlsCallbacks.push(callback);
    if (hlsLoading) return;
    hlsLoading = true;
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
    script.onload = function () {
      hlsCallbacks.splice(0).forEach(function (fn) {
        fn();
      });
    };
    script.onerror = function () {
      hlsCallbacks.splice(0).forEach(function (fn) {
        fn(false);
      });
    };
    document.head.appendChild(script);
  }

  function attach(player) {
    var video = player.querySelector('video');
    var stream = player.getAttribute('data-stream');
    var started = false;
    var hlsInstance = null;
    if (!video || !stream) return;

    function playVideo() {
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    }

    function start() {
      player.classList.add('is-playing');
      if (started) {
        playVideo();
        return;
      }
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
        playVideo();
        return;
      }
      loadLibrary(function () {
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        } else {
          video.src = stream;
          playVideo();
        }
      });
    }

    player.addEventListener('click', function (event) {
      if (event.target.closest('button') || event.target === player || event.target === video) {
        start();
      }
    });

    video.addEventListener('play', function () {
      player.classList.add('is-playing');
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  players.forEach(attach);
})();

(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  ready(function () {
    var shell = document.querySelector('.player-shell');
    if (!shell) {
      return;
    }

    var video = shell.querySelector('video');
    var button = shell.querySelector('.play-cover');
    if (!video || !button) {
      return;
    }

    var mediaUrl = video.getAttribute('data-stream');
    var hlsInstance = null;
    var attached = false;

    function attachMedia() {
      if (attached || !mediaUrl) {
        return;
      }
      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = mediaUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hlsInstance.loadSource(mediaUrl);
        hlsInstance.attachMedia(video);
        return;
      }

      video.src = mediaUrl;
    }

    function playMovie() {
      attachMedia();
      shell.classList.add('is-playing');
      video.setAttribute('controls', 'controls');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    button.addEventListener('click', playMovie);
    video.addEventListener('click', function () {
      if (!attached || video.paused) {
        playMovie();
      }
    });
    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();

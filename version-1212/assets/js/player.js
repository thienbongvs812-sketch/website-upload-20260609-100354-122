import { H as Hls } from "./hls-vendor.js";

const video = document.querySelector("[data-player]");
const overlay = document.querySelector("[data-player-overlay]");
const button = document.querySelector("[data-play-button]");
const configElement = document.getElementById("player-config");
let attached = false;
let hlsInstance = null;

const config = configElement ? JSON.parse(configElement.textContent || "{}") : {};
const sourceUrl = config.url || "";

const attachSource = () => {
    if (!video || !sourceUrl || attached) {
        return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
    } else if (Hls.isSupported()) {
        hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
        });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
    } else {
        video.src = sourceUrl;
    }

    attached = true;
};

const startPlayback = async () => {
    if (!video) {
        return;
    }

    attachSource();
    video.controls = true;

    if (overlay) {
        overlay.classList.add("is-hidden");
    }

    try {
        await video.play();
    } catch (error) {
        if (overlay) {
            overlay.classList.remove("is-hidden");
        }
    }
};

if (button) {
    button.addEventListener("click", (event) => {
        event.stopPropagation();
        startPlayback();
    });
}

if (overlay) {
    overlay.addEventListener("click", startPlayback);
}

if (video) {
    video.addEventListener("click", () => {
        if (video.paused) {
            startPlayback();
        }
    });

    window.addEventListener("pagehide", () => {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}

ig.module("impact.sound").defines(function () {
    "use strict";
    ig.Sound = ig.Class.extend({
        clips: {},
        volume: 1,
        format: null,
        init: function () {
            var formats = [
                {
                    ext: "mp3",
                    type: "audio/mpeg;",
                },
                {
                    ext: "ogg",
                    type: "audio/ogg;",
                },
                {
                    ext: "webm",
                    type: "audio/webm;",
                },
                {
                    ext: "m4a",
                    type: "audio/mp4;",
                },
            ];
            for (var i = 0; i < formats.length; i++) {
                var format = formats[i];
                if (ig.Sound.enabled && new Audio().canPlayType(format.type)) {
                    this.format = format;
                    break;
                }
            }
            if (!this.format) {
                ig.Sound.enabled = false;
            }
            if (ig.Sound.enabled && ig.Sound.useWebAudio) {
                this.audioContext = new AudioContext();
                this.boundWebAudioUnlock = this.unlockWebAudio.bind(this);
                document.addEventListener(
                    "touchend",
                    this.boundWebAudioUnlock,
                    false,
                );
                document.addEventListener(
                    "click",
                    this.boundWebAudioUnlock,
                    false,
                );
            }
        },
        unlockWebAudio: function () {
            var buffer = this.audioContext.createBuffer(1, 1, 44100);
            var source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(this.audioContext.destination);
            source.start(0);
            document.removeEventListener(
                "touchend",
                this.boundWebAudioUnlock,
                false,
            );
            document.removeEventListener(
                "click",
                this.boundWebAudioUnlock,
                false,
            );
        },
        load: function (path, multiChannel, loadCallback) {
            if (multiChannel && ig.Sound.useWebAudio) {
                return this.loadWebAudio(path, multiChannel, loadCallback);
            } else {
                return this.loadHTML5Audio(path, multiChannel, loadCallback);
            }
        },
        loadWebAudio: function (path, multiChannel, loadCallback) {
            var realPath =
                ig.prefix +
                path.replace(/[^\.]+$/, this.format.ext) +
                ig.nocache;
            if (this.clips[path]) {
                return this.clips[path];
            }
            var audioSource = new ig.Sound.WebAudioSource();
            this.clips[path] = audioSource;
            var request = new XMLHttpRequest();
            request.open("GET", realPath, true);
            request.responseType = "arraybuffer";
            var that = this;
            request.onload = function (ev) {
                that.audioContext.decodeAudioData(
                    request.response,
                    function (buffer) {
                        audioSource.buffer = buffer;
                        loadCallback(path, true, ev);
                    },
                    function (ev) {
                        loadCallback(path, false, ev);
                    },
                );
            };
            request.onerror = function (ev) {
                loadCallback(path, false, ev);
            };
            request.send();
            return audioSource;
        },
        loadHTML5Audio: function (path, multiChannel, loadCallback) {
            var realPath =
                ig.prefix +
                path.replace(/[^\.]+$/, this.format.ext) +
                ig.nocache;
            if (this.clips[path]) {
                if (this.clips[path] instanceof ig.Sound.WebAudioSource) {
                    return this.clips[path];
                }
                if (
                    multiChannel &&
                    this.clips[path].length < ig.Sound.channels
                ) {
                    for (
                        var i = this.clips[path].length;
                        i < ig.Sound.channels;
                        i++
                    ) {
                        var a = new Audio(realPath);
                        a.load();
                        this.clips[path].push(a);
                    }
                }
                return this.clips[path][0];
            }
            var clip = new Audio(realPath);
            if (loadCallback) {
                if (ig.ua.mobile) {
                    setTimeout(function () {
                        loadCallback(path, true, null);
                    }, 0);
                } else {
                    clip.addEventListener(
                        "canplaythrough",
                        function cb(ev) {
                            clip.removeEventListener(
                                "canplaythrough",
                                cb,
                                false,
                            );
                            loadCallback(path, true, ev);
                        },
                        false,
                    );
                    clip.addEventListener(
                        "error",
                        function (ev) {
                            loadCallback(path, true, ev);
                        },
                        false,
                    );
                }
            }
            clip.preload = "auto";
            clip.load();
            this.clips[path] = [clip];
            if (multiChannel) {
                for (var i = 1; i < ig.Sound.channels; i++) {
                    var a = new Audio(realPath);
                    a.load();
                    this.clips[path].push(a);
                }
            }
            return clip;
        },
        get: function (path) {
            var channels = this.clips[path];
            if (channels && channels instanceof ig.Sound.WebAudioSource) {
                return channels;
            }
            for (var i = 0, clip; (clip = channels[i++]); ) {
                if (clip.paused || clip.ended) {
                    if (clip.ended) {
                        clip.currentTime = 0;
                    }
                    return clip;
                }
            }
            channels[0].pause();
            channels[0].currentTime = 0;
            return channels[0];
        },
    });
    ig.Sound.enabled = true;
    ig.Sound.useWebAudio = false;
    ig.Sound.channels = 4;
    ig.Sound.WebAudioSource = ig.Class.extend({
        volume: 1,
        loop: false,
        buffer: null,
        source: null,
        ended: false,
        init: function () {
            Object.defineProperty(this, "loop", {
                get: this.getLooping.bind(this),
                set: this.setLooping.bind(this),
            });
            Object.defineProperty(this, "volume", {
                get: this.getVolume.bind(this),
                set: this.setVolume.bind(this),
            });
        },
        play: function () {
            if (!this.buffer) {
                return;
            }
            this.ended = false;
            this.source = ig.soundManager.audioContext.createBufferSource();
            this.source.buffer = this.buffer;
            this.source.connect(ig.soundManager.audioContext.destination);
            this.source.loop = this.loop;
            this.source.start(0);
            this.source.gain.value = this.volume;
        },
        pause: function () {
            if (this.source) {
                this.source.stop(0);
            }
        },
        stop: function () {
            if (this.source) {
                this.source.stop(0);
            }
            this.ended = true;
        },
        getLooping: function () {
            return this._loop;
        },
        setLooping: function (l) {
            this._loop = l;
            if (this.source) {
                this.source.loop = l;
            }
        },
        getVolume: function () {
            return this._volume;
        },
        setVolume: function (v) {
            this._volume = v;
            if (this.source) {
                this.source.gain.value = v;
            }
        },
    });
});
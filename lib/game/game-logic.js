ig.baked = true;
ig.module("game.game-logic")
    .requires(
        "impact.game",
        "impact.font",
        "game.menus.about",
        "game.menus.game-over",
        "game.menus.pause",
        "game.menus.title",
        "game.entities.enemy-missle",
        "game.entities.enemy-mine",
        "game.entities.enemy-destroyer",
        "game.entities.enemy-oppressor",
        "game.entities.player",
        "game.keyboard",
        "game.xhr",
        "game.ease",
        "plugins.silent-loader",
        "plugins.rise-loader",
        "game.document-scanner",
        "game.words.en",
        "game.words.es",
        "game.utils", // Nuevo require
        "game.constants" // Nuevo require
    )
    .defines(function () {
        Number.zeroes = "000000000000";
        Number.prototype.zeroFill = function (d) {
            var s = this.toString();
            return Number.zeroes.substr(0, d - s.length) + s;
        };
        ZType = ig.Game.extend({
            font: new ig.Font("media/fonts/avenir-18-white.png"),
            fontTitle: new ig.Font("media/fonts/avenir-36-blue.png"),
            separatorBar: new ig.Image("media/ui/bar-blue.png"),
            idleTimer: null,
            spawnTimer: null,
            targets: {},
            currentTarget: null,
            yScroll: 0,
            yScroll2: 0,
            gradient: new ig.Image("media/background/gradient.png"),
            stars: new ig.Image("media/background/stars.jpg"),
            grid: new ig.Image("media/background/grid.png"),
            music1: new ig.Sound("media/music/endure.ogg", false),
            music2: new ig.Sound("media/music/orientation.ogg", false),
            cancelSound: new ig.Sound("media/sounds/cancel.ogg"),
            spawnSound: new ig.Sound("media/sounds/spawn.ogg"),
            menu: null,
            mode: 0,
            score: 0,
            streak: 0,
            hits: 0,
            misses: 0,
            multiplier: 1,
            wave: {},
            gameTime: 0,
            kills: 0,
            emps: 0,
            personalBest: 0,
            isPersonalBest: false,
            waitingForItunes: false,
            adPage: null,
            difficulty: ig.ua.mobile ? "MOBILE" : "DESKTOP",
            keyboard: null,
            _screenShake: 0,
            wordlist: null,
            init: function () {
                if (ig.doc && ig.doc.fragments.length < 2) {
                    ig.doc = null;
                }
                this.fontTitle.letterSpacing = -2;
                this.font.letterSpacing = -1;

                this._setupBackground();
                this._setupAudio();
                this._setupInput();
                this._setupKeyboard();
                this._setupPlatformSpecificFeatures();
                this._setupWordlists();

                this.personalBest = parseInt(localStorage.getItem("highscore")) | 0;
                this.setTitle();

                if (ig.doc) {
                    this.reAllWordCharacter = /^[a-zßàáâãäåæçèéêëìíîïðñòóôõöøùúûüý]+$/i;
                    this.reSplitNonWord = /[^0-9a-zßàáâãäåæçèéêëìíîïðñòóôõöøùúûüý]/i;
                    ig.doc.fastForwardScanAnimation();
                }
            },

            _setupBackground: function() {
                var bgmap = new ig.BackgroundMap(620, [[1]], this.grid);
                bgmap.repeat = true;
                this.backgroundMaps.push(bgmap);
            },

            _setupAudio: function() {
                ig.music.add(this.music1);
                ig.music.add(this.music2);
                ig.music.loop = true;
                ig.music.random = true;

                var soundVolume = localStorage.getItem("soundVolume");
                var musicVolume = localStorage.getItem("musicVolume");
                if (soundVolume !== null && musicVolume !== null) {
                    ig.soundManager.volume = parseFloat(soundVolume);
                    ig.music.volume = parseFloat(musicVolume);
                }
            },

            _setupInput: function() {
                window.addEventListener("keypress", this.keypress.bind(this), false);
                window.addEventListener("keydown", this.keydown.bind(this), false);
                ig.input.bind(ig.KEY.ENTER, "ok");
                ig.input.bind(ig.KEY.SPACE, "ok");
                ig.input.bind(ig.KEY.MOUSE1, "click");
                ig.input.bind(ig.KEY.ESC, "menu");
                ig.input.bind(ig.KEY.UP_ARROW, "up");
                ig.input.bind(ig.KEY.DOWN_ARROW, "down");
                ig.input.bind(ig.KEY.LEFT_ARROW, "left");
                ig.input.bind(ig.KEY.RIGHT_ARROW, "right");
                ig.system.canvas.onclick = function () {
                    window.focus();
                };
            },

            _setupKeyboard: function() {
                this.keyboard = new ig.Keyboard(this.virtualKeydown.bind(this));
            },

            _setupPlatformSpecificFeatures: function() {
                if (window.Ejecta) {
                    this.gameCenter = new Ejecta.GameCenter();
                    this.gameCenter.authenticate();
                    if (!localStorage.getItem("removeAds")) {
                        this.adPage = new Ejecta.AdMobPage(
                            "ca-app-pub-8533552145182353/1344920700",
                        );
                    }
                }
                if (window.Cocoon && window.Cocoon.Ad) {
                    Cocoon.Ad.configure({
                        android: {
                            interstitial:
                                "ca-app-pub-8533552145182353/1042008307",
                        },
                    });
                    this.cocoonInterstitial = Cocoon.Ad.createInterstitial();
                }
            },

            _setupWordlists: function() {
                this.wordlist = {};
                for (var length in ig.WORDS.EN) {
                    this.wordlist[length] = ig.WORDS.EN[length].slice();
                }
                for (var length in ig.WORDS.ES) {
                    if (this.wordlist[length]) {
                        this.wordlist[length] = this.wordlist[length].concat(ig.WORDS.ES[length]);
                    } else {
                        this.wordlist[length] = ig.WORDS.ES[length].slice();
                    }
                }
            },
            reset: function () {
                this.entities = [];
                this.currentTarget = null;
                this.wave = ig.copy(ZType.WAVES[this.difficulty]);
                var first = "a".charCodeAt(0),
                    last = "z".charCodeAt(0);
                for (var i = first; i <= last; i++) {
                    this.targets[String.fromCharCode(i)] = [];
                }
                for (var c in this._umlautTable) {
                    this.targets[c] = [];
                }
                this.score = 0;
                this.rs = 0;
                this.streak = 0;
                this.longestStreak = 0;
                this.hits = 0;
                this.misses = 0;
                this.kills = 0;
                this.multiplier = 1;
                this.gameTime = 0;
                this.isPersonalBest = false;
                this.speedFactor = 1;
                this.lastKillTimer = new ig.Timer();
                this.spawnTimer = new ig.Timer();
                this.idleTimer = new ig.Timer();
                this.waveEndTimer = null;
            },
            nextWave: function () {
                this.wave.wave++;
                this.wave.spawnWait = (this.wave.spawnWait * 0.97).limit(
                    0.2,
                    1,
                );
                this.wave.currentSpawnWait = this.wave.spawnWait;
                this.wave.spawn = [];
                this.speedFactor *= this.wave.speedIncrease;
                if (ig.doc) {
                    for (var i = 0; i < 10 && this.wave.spawn.length < 2; i++) {
                        this.nextDocFragment();
                    }
                    this.wave.spawn.reverse();
                } else {
                    var dec = 0;
                    for (var t = 0; t < this.wave.numEnemies; t++) {
                        var type = this.chooseRandomEnemy();
                        this.wave.spawn.push(type);
                    }
                }
                this.wave.numEnemies = (this.wave.numEnemies * this.wave.enemyIncrease).round();
                this.waveEndTimer = null;
            },

            _umlautTable: {
                "ä": "a", "ö": "o", "ü": "u", "á": "a", "é": "e", "í": "i", "ó": "o", "ú": "u", "ñ": "n", "ç": "c", "ß": "s"
            },

            translateUmlaut: function(char) {
                return this._umlautTable[char] || char;
            },

            chooseRandomEnemy: function() {
                var enemies = [EntityEnemyMissle, EntityEnemyMine, EntityEnemyDestroyer, EntityEnemyOppressor];
                var r = Math.random();
                if (this.wave.wave < 3) {
                    return EntityEnemyMissle;
                } else if (this.wave.wave < 6) {
                    return r < 0.8 ? EntityEnemyMissle : EntityEnemyMine;
                } else if (this.wave.wave < 10) {
                    return r < 0.5 ? EntityEnemyMissle : (r < 0.8 ? EntityEnemyMine : EntityEnemyDestroyer);
                } else {
                    return r < 0.4 ? EntityEnemyMissle : (r < 0.7 ? EntityEnemyMine : (r < 0.9 ? EntityEnemyDestroyer : EntityEnemyOppressor));
                }
            },

            spawnEnemy: function(type, x, y, settings) {
                return this.parent(type, x, y, settings);
            },

            registerTarget: function(char, entity) {
                this.targets[char].push(entity);
            },

            unregisterTarget: function(char, entity) {
                this.targets[char].erase(entity);
            },

            setGameOver: function() {
                this.menu = new MenuGameOver();
                ig.music.fadeOut(1);
                if (this.score > this.personalBest) {
                    this.isPersonalBest = true;
                    localStorage.setItem("highscore", this.score);
                    if (window.Ejecta) {
                        this.gameCenter.reportScore(this.score, "ztype.highscore");
                    }
                }
                if (window.Cocoon && this.cocoonInterstitial) {
                    this.cocoonInterstitial.show();
                }
            },

            setTitle: function() {
                this.menu = new MenuTitle();
                ig.music.play();
                this.reset();
            },

            setGame: function() {
                this.menu = null;
                ig.music.fadeOut(1);
                this.reset();
                this.spawnPlayer();
                this.spawnTimer.set(this.wave.spawnWait);
            },

            spawnPlayer: function() {
                this.player = this.spawnEntity(EntityPlayer, ig.system.width / 2, ig.system.height - 60);
            },

            screenShake: function(amount) {
                this._screenShake = amount;
            },

            keypress: function(event) {
                if (this.menu) {
                    return;
                }
                var char = String.fromCharCode(event.charCode);
                this.keydown(event, char);
            },

            virtualKeydown: function(key) {
                if (this.menu) {
                    return;
                }
                this.keydown(null, key);
            },

            keydown: function(event, char) {
                if (this.menu) {
                    return;
                }
                if (char === " ") {
                    this.player.spawnEMP();
                    return;
                }
                if (char === "escape") {
                    this.menu = new MenuPause();
                    return;
                }
                this._handleCharacterInput(char);
            },

            _handleCharacterInput: function(char) {
                if (this.currentTarget) {
                    this._processTargetedEnemyInput(char);
                } else {
                    this._processUntargetedEnemyInput(char);
                }
            },

            _processTargetedEnemyInput: function(char) {
                if (this.currentTarget.isHitBy(char)) {
                    this.hits++;
                    this.streak++;
                    this.longestStreak = Math.max(this.streak, this.longestStreak);
                    this.score += this.multiplier * 10;
                    if (this.currentTarget.dead) {
                        this.kills++;
                        this.score += this.multiplier * 100;
                        this.multiplier++;
                        this.keyboard.showMultiplier(this.multiplier);
                    }
                    this.player.shoot(this.currentTarget);
                } else {
                    this.misses++;
                    this.streak = 0;
                    this.multiplier = 1;
                    this.player.miss();
                }
            },

            _processUntargetedEnemyInput: function(char) {
                var target = this.targets[char.toLowerCase()];
                if (target && target.length > 0) {
                    target[0].target();
                    this.hits++;
                    this.streak++;
                    this.longestStreak = Math.max(this.streak, this.longestStreak);
                    this.score += this.multiplier * 10;
                    this.player.shoot(this.currentTarget);
                } else {
                    this.misses++;
                    this.streak = 0;
                    this.multiplier = 1;
                    this.player.miss();
                }
            },

            update: function() {
                if (this.menu) {
                    this.menu.update();
                    return;
                }
                this.parent();
                this._updateGameTimeAndScrolling();
                this._updateSpawnLogic();
                this._updateWaveEnd();
                this._updateCurrentTarget();
                this._updateIdleTimer();
            },

            _updateGameTimeAndScrolling: function() {
                this.gameTime += ig.system.tick;
                this.yScroll -= ig.system.tick * 10;
                this.yScroll2 -= ig.system.tick * 30;
                if (this.yScroll < -this.stars.height) {
                    this.yScroll += this.stars.height;
                }
                if (this.yScroll2 < -this.gradient.height) {
                    this.yScroll2 += this.gradient.height;
                }
            },

            _updateSpawnLogic: function() {
                if (this.spawnTimer.delta() > 0) {
                    this.spawnTimer.set(this.wave.currentSpawnWait);
                    if (this.wave.spawn.length) {
                        var type = this.wave.spawn.pop();
                        var x = Math.random() * (ig.system.width - 60) + 30;
                        var y = -30;
                        this.spawnEnemy(type, x, y);
                        this.spawnSound.play();
                    } else if (this.entities.length <= 1) { // Only player left
                        this.waveEndTimer = new ig.Timer(3);
                    }
                }
            },

            _updateWaveEnd: function() {
                if (this.waveEndTimer && this.waveEndTimer.delta() > 0) {
                    this.nextWave();
                }
            },

            _updateCurrentTarget: function() {
                if (this.currentTarget && this.currentTarget.dead) {
                    this.currentTarget = null;
                }
            },

            _updateIdleTimer: function() {
                if (this.idleTimer.delta() > 60 && !this.currentTarget) {
                    this.setTitle();
                }
            },

            draw: function() {
                this._drawBackgroundElements();
                this.parent();
                this._drawGameStats();
                this._drawCurrentTargetLabel();
                this._applyScreenShake();
                this._drawKeyboard();
                this._drawMenu();
            },

            _drawBackgroundElements: function() {
                this.stars.draw(0, this.yScroll);
                this.stars.draw(0, this.yScroll + this.stars.height);
                this.gradient.draw(0, this.yScroll2);
                this.gradient.draw(0, this.yScroll2 + this.gradient.height);
            },

            _drawGameStats: function() {
                this.font.draw("SCORE " + this.score.zeroFill(6), 10, 10);
                this.font.draw("WAVE " + this.wave.wave.zeroFill(3), 10, 30);
                this.font.draw("KILLS " + this.kills.zeroFill(3), 10, 50);
                this.font.draw("x" + this.multiplier, 10, 70);
                this.font.draw("EMPS " + this.emps, 10, 90);
                this.font.draw("BEST " + this.personalBest.zeroFill(6), ig.system.width - 10, 10, ig.Font.ALIGN.RIGHT);
                this.font.draw("STREAK " + this.streak.zeroFill(3), ig.system.width - 10, 30, ig.Font.ALIGN.RIGHT);
                this.font.draw("TIME " + this.gameTime.round().zeroFill(3), ig.system.width - 10, 50, ig.Font.ALIGN.RIGHT);
                this.font.draw("FPS " + ig.system.fps, ig.system.width - 10, 70, ig.Font.ALIGN.RIGHT);
            },

            _drawCurrentTargetLabel: function() {
                if (this.currentTarget) {
                    this.currentTarget.drawLabel();
                }
            },

            _applyScreenShake: function() {
                if (this._screenShake) {
                    var s = this._screenShake * 2;
                    ig.system.context.translate(Math.random() * s - s / 2, Math.random() * s - s / 2);
                    this._screenShake = Math.max(0, this._screenShake - ig.system.tick * 20);
                }
            },

            _drawKeyboard: function() {
                this.keyboard.expectedKeys = [];
                for (var charCode in this.targets) {
                    if (this.targets[charCode].length) {
                        this.keyboard.expectedKeys.push(charCode);
                    }
                }
                this.keyboard.draw();
            },

            _drawMenu: function() {
                if (this.menu) {
                    this.menu.draw();
                }
            },

            nextDocFragment: function() {
                if (!ig.doc) {
                    return;
                }
                var fragment = ig.doc.fragments.shift();
                if (!fragment) {
                    ig.doc = null;
                    return;
                }
                ig.doc.highlightFragment(fragment);
                var words = fragment.text.match(this.reAllWordCharacter);
                if (!words || !words.length) {
                    this.nextDocFragment();
                    return;
                }
                var word = words.random();
                var type = this.chooseRandomEnemy();
                this.wave.spawn.push(type);
                this.spawnEnemy(type, Math.random() * (ig.system.width - 60) + 30, -30, { word: word });
            }
        });
    });

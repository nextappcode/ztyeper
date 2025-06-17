ig.baked = true;
ig.module("game.text.en")
    .requires("game.constants")
    .defines(function () {
        "use strict";
        ig.TEXT.EN = {
            MENU_ITEM_BACK_TO_MENU: "back to menu",
            MENU_ITEM_RESTORE_IAP: "Restore In-App Purchases",
            MENU_ITEM_SKIP: "skip",
            MENU_ITEM_SOUND_VOLUME: "Sound",
            MENU_ITEM_MUSIC_VOLUME: "Music",
            MENU_ITEM_RESUME: "resume",
            MENU_ITEM_START_GAME: "start game",
            GAME_PAUSED: "GAME PAUSED",
            FINAL_SCORE: "FINAL SCORE",
            YOU_REACHED: "YOU REACHED",
            ACCURACY: "ACCURACY",
            LONGEST_STREAK: "LONGEST STREAK",
            NEW_PERSONAL_BEST: "NEW PERSONAL BEST",
            WAVE: "WAVE",
            WAVE_CLEAR: "CLEAR",
            TYPE_WORDS_TO_SHOOT: "Type the words to shoot!",
            PRESS_ENTER_FOR_EMP: "Press ENTER for EMP",
            LOADING_STATS: "LOADING STATS",
            TREND_OVER_GAMES: "(trend over {totalGames} games)",
            NO_STATS_FOUND: "NO STATS FOUND – PLAY SOME MORE",
            SCORES_OVER_GAMES: "SCORES OVER {numGames} GAMES",
            SCORE: "SCORE",
            STREAK: "STREAK"
        };
    });

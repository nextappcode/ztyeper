ig.baked = true;
ig.module("game.text.es")
    .requires("game.constants")
    .defines(function () {
        "use strict";
        ig.TEXT.ES = {
            MENU_ITEM_BACK_TO_MENU: "volver al menú",
            MENU_ITEM_RESTORE_IAP: "Restaurar Compras en la Aplicación",
            MENU_ITEM_SKIP: "saltar",
            MENU_ITEM_SOUND_VOLUME: "Sonido",
            MENU_ITEM_MUSIC_VOLUME: "Música",
            MENU_ITEM_RESUME: "reanudar",
            MENU_ITEM_START_GAME: "empezar juego",
            GAME_PAUSED: "JUEGO PAUSADO",
            FINAL_SCORE: "PUNTUACIÓN FINAL",
            YOU_REACHED: "HAS ALCANZADO",
            ACCURACY: "PRECISIÓN",
            LONGEST_STREAK: "RACHA MÁS LARGA",
            NEW_PERSONAL_BEST: "NUEVO RÉCORD PERSONAL",
            WAVE: "OLA",
            WAVE_CLEAR: "COMPLETADA",
            TYPE_WORDS_TO_SHOOT: "¡Escribe las palabras para disparar!",
            PRESS_ENTER_FOR_EMP: "¡Pulsa ENTER para EMP!",
            LOADING_STATS: "CARGANDO ESTADÍSTICAS",
            TREND_OVER_GAMES: "(tendencia en {totalGames} partidas)",
            NO_STATS_FOUND: "NO SE ENCONTRARON ESTADÍSTICAS – JUEGA MÁS",
            SCORES_OVER_GAMES: "PUNTUACIONES EN {numGames} PARTIDAS",
            SCORE: "PUNTUACIÓN",
            STREAK: "RACHA"
        };
    });

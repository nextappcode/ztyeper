ig.baked = true;
ig.module("game.constants").defines(function () {
    "use strict";
    ZType.WAVES = {
        "DESKTOP": {
            wave: 0,
            spawnWait: 1,
            numEnemies: 1,
            enemyIncrease: 1.4,
            speedIncrease: 1.1
        },
        "MOBILE": {
            wave: 0,
            spawnWait: 1.5,
            numEnemies: 1,
            enemyIncrease: 1.2,
            speedIncrease: 1.05
        }
    };

    ig.TEXT = {};
});

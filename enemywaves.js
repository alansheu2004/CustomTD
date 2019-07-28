var defaultrounds = [ROUND1, ROUND2, ROUND3];

var ROUND1 = new EnemyWave(
    new EnemyBunch(0, RED, 20, 1),
    new EnemyBunch(21, RED, 3, 0.3)
);

var ROUND2 = new EnemyWave(
    new EnemyBunch(0, RED, 5, 0.4),
    new EnemyBunch(3, RED, 5, 0.4),
    new EnemyBunch(6, RED, 5, 0.4),
    new EnemyBunch(10, RED, 16, 0.5),
    new EnemyBunch(15, BLUE, 1, 0)
);

var ROUND3 = new EnemyWave(
    new EnemyBunch(0, RED, 30, 0.5),
    new EnemyBunch(0, BLUE, 15, 1),
    new EnemyBunch(16, BLUE, 8, 0.5),
);

function EnemyWave(enemybunches) {
    this.enemybunches = enemybunches;
}

function EnemyBunch(time, enemy, number, spacing) { //time and spacing in seconds
    this.time = time;
    this.enemy = enemy;
    this.number = number;
    this.spacing = spacing;
}
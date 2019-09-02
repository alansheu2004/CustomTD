var ROUND1 = new EnemyWave([
    new EnemyBunch(0, RED, 15, 0.75),
    new EnemyBunch(11.5, RED, 5, 0.2)
]);

var ROUND2 = new EnemyWave([
    new EnemyBunch(0, RED, 6, 0.4),
    new EnemyBunch(3, RED, 6, 0.4),
    new EnemyBunch(6, RED, 6, 0.4),
    new EnemyBunch(10, RED, 16, 0.5),
    new EnemyBunch(20, BLUE, 1, 0)
]);

var ROUND3 = new EnemyWave([
    new EnemyBunch(0, RED, 30, 0.5),
    new EnemyBunch(0, BLUE, 15, 1),
    new EnemyBunch(16, BLUE, 10, 0.3),
    new EnemyBunch(17, GREEN, 1, 0),
]);

var ROUND4 = new EnemyWave([
    new EnemyBunch(0, BLUE, 50, 0.5),
    new EnemyBunch(5, GREEN, 10, 1),
    new EnemyBunch(15, GREEN, 16, 0.5),
    new EnemyBunch(25, GREEN, 20, 0.3),
    new EnemyBunch(30, YELLOW, 3, 1),
]);

var ROUND5 = new EnemyWave([
    new EnemyBunch(0, PINK, 3, 0.25),
    new EnemyBunch(1, YELLOW, 10, 1),
    new EnemyBunch(3, GREEN, 10, 0.2),
    new EnemyBunch(6, GREEN, 10, 0.2),
    new EnemyBunch(9, GREEN, 15, 0.25),
    new EnemyBunch(10, YELLOW, 20, 0.5),
    new EnemyBunch(18, PINK, 15, 0.5),
]);

var defaultWaves = [ROUND1, ROUND2, ROUND3, ROUND4, ROUND5];

function EnemyWave(enemybunches) {
    this.enemybunches = enemybunches;
}

function EnemyBunch(time, enemy, number, spacing) { //time and spacing in seconds
    this.time = time;
    this.enemy = enemy;
    this.number = number;
    this.spacing = spacing;
}
var ROUND1 = new EnemyWave([
    new EnemyBunch(0, FLAG_ZOMBIE, 1, 0),
    new EnemyBunch(5, ZOMBIE, 10, 3),
    new EnemyBunch(40, ZOMBIE, 5, 1)
]);

var ROUND2 = new EnemyWave([
    new EnemyBunch(0, FLAG_ZOMBIE, 1, 0),
    new EnemyBunch(5, ZOMBIE, 10, 1),
    new EnemyBunch(20, CONE_HEAD_ZOMBIE, 5, 5),
    new EnemyBunch(35, ZOMBIE, 10, 2)
]);

var ROUND3 = new EnemyWave([
    new EnemyBunch(0, FLAG_ZOMBIE, 1, 0),
    new EnemyBunch(5, CONE_HEAD_ZOMBIE, 10, 2),
    new EnemyBunch(20, POLE_VAULT_ZOMBIE, 5, 3),
    new EnemyBunch(30, ZOMBIE, 20, 0.5)
]);

var ROUND4 = new EnemyWave([
    new EnemyBunch(0, FLAG_ZOMBIE, 1, 0),
    new EnemyBunch(5, POLE_VAULT_ZOMBIE, 10, 3),
    new EnemyBunch(15, CONE_HEAD_ZOMBIE, 20, 1),
    new EnemyBunch(30, POLE_VAULT_ZOMBIE, 20, 0.5),
    new EnemyBunch(40, BUCKET_HEAD_ZOMBIE, 5, 5)
]);

var ROUND5 = new EnemyWave([
    new EnemyBunch(0, FLAG_ZOMBIE, 1, 0),
    new EnemyBunch(5, CONE_HEAD_ZOMBIE, 10, 3),
    new EnemyBunch(10, POLE_VAULT_ZOMBIE, 10, 5),
    new EnemyBunch(40, BUCKET_HEAD_ZOMBIE, 10, 3)
]);

var ROUND6 = new EnemyWave([
    new EnemyBunch(0, FLAG_ZOMBIE, 1, 0),
    new EnemyBunch(5, FOOTBALL_ZOMBIE, 10, 5)
]);

var defaultWaves = [ROUND1, ROUND2, ROUND3, ROUND4, ROUND5, ROUND6];

function EnemyWave(enemybunches) {
    this.enemybunches = enemybunches;
}

function EnemyBunch(time, enemy, number, spacing) { //time and spacing in seconds
    this.time = time;
    this.enemy = enemy;
    this.number = number;
    this.spacing = spacing;
}
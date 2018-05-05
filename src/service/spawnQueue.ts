// function countCreepsInGameOrQueue(filter) {
//     return _.size(Game.creeps) + _.size(Memory.spawnQueue);
// }

// function maintainCreepCount(desiredCount) {
//     var count = countCreepsInGameOrQueue();
//     if (count < desiredCount) {
//         Memory.spawnQueue.push(
//             [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE],
//         );
//     }
// }

// function doNextSpawn() {
//     const spawner = Game.spawns['Spawn1'];
//     if (Memory.spawnQueue.length && !spawner.spawning) {
//         const rc = spawner.spawnCreep(
//             Memory.spawnQueue[0],
//             `Creep${Game.time}`,
//         );
//         if (rc === OK) {
//             Memory.spawnQueue.shift();
//         }
//     }
// }

export default function run() {
  // if (!Memory.spawnQueue) {
  //     Memory.spawnQueue = [];
  // }
  // doNextSpawn();
  // maintainCreepCount(10);
  const creepCount = _.size(Game.creeps);
  if (creepCount < 12) {
    const body =
      creepCount < 3
        ? [WORK, CARRY, MOVE]
        : creepCount < 6
          ? [WORK, WORK, CARRY, CARRY, MOVE, MOVE]
          : creepCount < 9
            ? [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]
            : [
                WORK,
                WORK,
                WORK,
                WORK,
                CARRY,
                CARRY,
                CARRY,
                CARRY,
                MOVE,
                MOVE,
                MOVE,
                MOVE
              ];
    Game.spawns.Spawn1.spawnCreep(body, `Creep${Game.time}`);
  }
}

import { countCreeps, getSpawn } from "../util/spawn";
import { trySpawnThisTick } from "./spawnQueue";

export default function run() {
  const creepCount = countCreeps({
    memoryFilter: m => m && m.generic
  });
  if (creepCount < 6) {
    const body =
      creepCount < 4
        ? [WORK, WORK, CARRY, CARRY, MOVE, MOVE]
        : [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
    trySpawnThisTick({
      body,
      memory: { generic: true },
      name: `Creep${Game.time}`
    });
  }
}

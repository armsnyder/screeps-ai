import { countCreepsAliveOrEnqueued, getSpawn } from "../util/spawn";
import { enqueue } from "./spawnQueue";

export default function run() {
  const creepCount = countCreepsAliveOrEnqueued({
    memoryFilter: m => !m || !m.nonBalanced
  });
  if (creepCount < 6) {
    const body =
      creepCount < 2
        ? [WORK, CARRY, MOVE]
        : creepCount < 4
          ? [WORK, WORK, CARRY, CARRY, MOVE, MOVE]
          : [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
    enqueue({ body, name: `Creep${Game.time}` });
  }
}

import { getSpawn } from "../util/spawn";

export interface EnqueuedSpawn {
  name: string;
  body: BodyPartConstant[];
  memory?: CreepMemory;
}

declare global {
  interface Memory {
    spawnQueue?: EnqueuedSpawn[];
    spawning?: EnqueuedSpawn;
  }
}

export function enqueue(spawnDefinition: EnqueuedSpawn) {
  if (!Memory.spawnQueue) {
    Memory.spawnQueue = [];
  }
  Memory.spawnQueue.push(spawnDefinition);
}

export function getSpawnQueue(): EnqueuedSpawn[] {
  return _.get(Memory, "spawnQueue", []);
}

export function getSpawning(): EnqueuedSpawn | undefined {
  return Memory.spawning;
}

function doNextSpawn() {
  const spawn = getSpawn();
  const queue = Memory.spawnQueue;
  if (queue && queue.length && spawn && !spawn.spawning) {
    let rc = spawn.spawnCreep(queue[0].body, queue[0].name, {
      memory: queue[0].memory
    });
    if (rc === ERR_NOT_ENOUGH_ENERGY) {
      const simplifiedBody = _.uniq(queue[0].body);
      rc = spawn.spawnCreep(simplifiedBody, queue[0].name, {
        memory: queue[0].memory
      });
    }
    if (rc === OK) {
      Memory.spawning = queue.shift();
    }
  }
}

function cleanUpSpawning() {
  const spawn = getSpawn();
  if (spawn && !spawn.spawning && Memory.spawning) {
    delete Memory.spawning;
  }
}

export default function() {
  cleanUpSpawning();
  doNextSpawn();
}

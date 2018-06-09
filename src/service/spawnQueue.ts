import { getSpawn } from "../util/spawn";

interface EnqueuedSpawn {
  name: string;
  body: BodyPartConstant[];
  memory?: CreepMemory;
}

export function trySpawnThisTick(spawnDefinition: EnqueuedSpawn) {
  Game.cache.spawnQueue.requests.push(spawnDefinition);
}

export function init() {
  Game.cache.spawnQueue = {
    requests: []
  };
}

function chooseCreepToSpawn(): EnqueuedSpawn | undefined {
  let candidate: EnqueuedSpawn | undefined;
  const { requests } = Game.cache.spawnQueue as {
    requests: EnqueuedSpawn[];
  };
  if (!_.size(Game.creeps)) {
    candidate = _.find(requests, { memory: { role: "harvester" } });
  }
  if (candidate) {
    return candidate;
  }
  candidate = _.find(requests, { memory: { role: "mover" } });
  if (candidate) {
    return candidate;
  }
  return _.sample(requests);
}

export function doNextSpawn() {
  const spawn = getSpawn();
  if (spawn && !spawn.spawning) {
    const creepToSpawn = chooseCreepToSpawn();
    if (creepToSpawn) {
      let rc = spawn.spawnCreep(creepToSpawn.body, creepToSpawn.name, {
        memory: creepToSpawn.memory
      });
      if (rc === ERR_NOT_ENOUGH_ENERGY) {
        const simplifiedBody = _.uniq(creepToSpawn.body);
        rc = spawn.spawnCreep(simplifiedBody, creepToSpawn.name, {
          memory: creepToSpawn.memory
        });
      }
    }
  }
}

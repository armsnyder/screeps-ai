import {
  EnqueuedSpawn,
  getSpawning,
  getSpawnQueue
} from "../service/spawnQueue";

export function getSpawn(): StructureSpawn | undefined {
  return _.head(_.values(Game.spawns));
}

export function countCreepsAliveOrEnqueued({
  nameFilter,
  memoryFilter
}: {
  nameFilter?: (name: string) => boolean;
  memoryFilter?: (memory?: CreepMemory) => boolean;
}): number {
  let total = 0;
  if (nameFilter && memoryFilter) {
    total += (_.values(Game.creeps) as Creep[]).filter(
      c => memoryFilter(c.memory) && nameFilter(c.name)
    ).length;
    total += getSpawnQueue().filter(
      c => memoryFilter(c.memory) && nameFilter(c.name)
    ).length;
    const spawning = getSpawning();
    if (
      spawning &&
      memoryFilter(spawning.memory) &&
      nameFilter(spawning.name)
    ) {
      total++;
    }
  } else if (nameFilter) {
    total += (_.values(Game.creeps) as Creep[]).filter(c => nameFilter(c.name))
      .length;
    total += getSpawnQueue().filter(c => nameFilter(c.name)).length;
    const spawning = getSpawning();
    if (spawning && nameFilter(spawning.name)) {
      total++;
    }
  } else if (memoryFilter) {
    total += (_.values(Game.creeps) as Creep[]).filter(c =>
      memoryFilter(c.memory)
    ).length;
    total += getSpawnQueue().filter(c => memoryFilter(c.memory)).length;
    const spawning = getSpawning();
    if (spawning && memoryFilter(spawning.memory)) {
      total++;
    }
  } else {
    throw Error("nameFilter and memoryFilter cannot both be undefined");
  }
  return total;
}

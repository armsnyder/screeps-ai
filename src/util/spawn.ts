export function getSpawn(): StructureSpawn | undefined {
  return _.head(_.values(Game.spawns));
}

export function countCreeps({
  nameFilter,
  memoryFilter
}: {
  nameFilter?: (name: string) => boolean | undefined;
  memoryFilter?: (memory?: CreepMemory) => boolean | undefined;
}): number {
  if (nameFilter && memoryFilter) {
    return (_.values(Game.creeps) as Creep[]).filter(
      c => memoryFilter(c.memory) && nameFilter(c.name)
    ).length;
  } else if (nameFilter) {
    return (_.values(Game.creeps) as Creep[]).filter(c => nameFilter(c.name))
      .length;
  } else if (memoryFilter) {
    return (_.values(Game.creeps) as Creep[]).filter(c =>
      memoryFilter(c.memory)
    ).length;
  } else {
    throw Error("nameFilter and memoryFilter cannot both be undefined");
  }
}

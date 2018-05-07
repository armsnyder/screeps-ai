export function getSpawn(): StructureSpawn | undefined {
  return _.head(_.values(Game.spawns));
}

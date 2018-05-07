function getShouldPlaceRoad(creep: Creep) {
  if (creep.fatigue === 0) {
    return false;
  }
  const roads = creep.pos
    .lookFor(LOOK_STRUCTURES)
    .filter((s: Structure) => s.structureType === STRUCTURE_ROAD);
  if (roads.length) {
    return false;
  }
  const constructionSites = creep.pos.lookFor(LOOK_CONSTRUCTION_SITES);
  if (constructionSites.length) {
    return false;
  }
  return true;
}

export default function run() {
  _.values(Game.creeps).forEach(creep => {
    if (getShouldPlaceRoad(creep)) {
      creep.room.createConstructionSite(creep.pos, STRUCTURE_ROAD);
    }
  });
}

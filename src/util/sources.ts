import { getMoveOpts } from "../service/creepColorizer";

export function moveToAndHarvestNearestSource(creep: Creep) {
  const closestSource = creep.pos.findClosestByPath(FIND_SOURCES, {
    filter: source => source.energy > 0
  });
  if (closestSource) {
    if (creep.harvest(closestSource) === ERR_NOT_IN_RANGE) {
      creep.moveTo(closestSource, getMoveOpts(creep));
    }
  }
}

export function moveToAndGetEnergyFromNearestContainer(creep: Creep) {
  const target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: s =>
      (s.structureType === STRUCTURE_CONTAINER ||
        s.structureType === STRUCTURE_STORAGE) &&
      s.store[RESOURCE_ENERGY] > 0
  });
  if (target) {
    if (creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
      creep.moveTo(target, getMoveOpts(creep));
    }
  } else {
    const target2 = creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: s =>
        (s.structureType === STRUCTURE_SPAWN ||
          s.structureType === STRUCTURE_EXTENSION) &&
        s.energy > 0
    });
    if (target2) {
      if (creep.withdraw(target2, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(target2, getMoveOpts(creep));
      }
    }
  }
}

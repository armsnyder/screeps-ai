import { getMoveOpts } from "../service/creepColorizer";
import { moveToAndHarvestNearestSource } from "../util/sources";

declare global {
  interface CreepMemory {
    harvesting: boolean;
  }
}

export default function(creep: Creep) {
  creep.say("🌟");
  if (!creep.memory.harvesting && creep.carry.energy === 0) {
    creep.memory.harvesting = true;
  }
  if (creep.memory.harvesting && creep.carry.energy === creep.carryCapacity) {
    creep.memory.harvesting = false;
  }
  if (creep.memory.harvesting) {
    moveToAndHarvestNearestSource(creep);
  } else {
    let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: s =>
        (s.structureType === STRUCTURE_CONTAINER ||
          s.structureType === STRUCTURE_STORAGE) &&
        s.store[RESOURCE_ENERGY] < s.storeCapacity
    });
    if (!target) {
      target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: structure =>
          (structure.structureType === STRUCTURE_EXTENSION ||
            structure.structureType === STRUCTURE_SPAWN) &&
          structure.energy < structure.energyCapacity
      });
    }
    if (target) {
      const transferRc = creep.transfer(target, RESOURCE_ENERGY);
      if (transferRc === ERR_NOT_IN_RANGE) {
        creep.moveTo(target, getMoveOpts(creep));
      }
    } else {
      creep.memory.harvesting = true;
    }
  }
}

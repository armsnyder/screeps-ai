import { getMoveOpts } from "../service/creepColorizer";
import { moveToAndGetEnergyFromNearestContainer } from "../util/sources";

export default function run(creep: Creep) {
  creep.say("⛽");
  if (!creep.memory.reloading && creep.carry.energy === 0) {
    creep.memory.reloading = true;
  }
  if (creep.memory.reloading && creep.carry.energy === creep.carryCapacity) {
    creep.memory.reloading = false;
  }
  if (creep.memory.reloading) {
    moveToAndGetEnergyFromNearestContainer(creep);
  } else {
    const target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: structure =>
        (structure.structureType === STRUCTURE_EXTENSION ||
          structure.structureType === STRUCTURE_SPAWN ||
          structure.structureType === STRUCTURE_TOWER) &&
        structure.energy < structure.energyCapacity
    });
    if (target) {
      const transferRc = creep.transfer(target, RESOURCE_ENERGY);
      if (transferRc === ERR_NOT_IN_RANGE) {
        creep.moveTo(target, getMoveOpts(creep));
      }
    }
  }
}

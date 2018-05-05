import { getMoveOpts } from "../service/creepColorizer";
import { moveToAndGetEnergyFromNearestContainer } from "../util/sources";

declare global {
  interface CreepMemory {
    transferring: boolean;
  }
}

export default function run(creep: Creep) {
  creep.say("⛽");
  if (creep.memory.transferring && creep.carry.energy === 0) {
    creep.memory.transferring = false;
  }
  if (
    !creep.memory.transferring &&
    creep.carry.energy === creep.carryCapacity
  ) {
    creep.memory.transferring = true;
  }
  if (creep.memory.transferring) {
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
  } else {
    moveToAndGetEnergyFromNearestContainer(creep);
  }
}

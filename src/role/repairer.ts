import { getMoveOpts } from "../service/creepColorizer";
import { moveToAndGetEnergyFromNearestContainer } from "../util/sources";

declare global {
  interface CreepMemory {
    repairing: boolean;
    target: string;
  }
}

export default function(creep: Creep) {
  creep.say("🔧");
  if (creep.memory.repairing && creep.carry.energy === 0) {
    creep.memory.repairing = false;
  }
  if (!creep.memory.repairing && creep.carry.energy === creep.carryCapacity) {
    creep.memory.repairing = true;
  }
  if (creep.memory.repairing) {
    const hitsLost = structure => structure.hitsMax - structure.hits;
    if (
      !creep.memory.target ||
      hitsLost(Game.getObjectById(creep.memory.target)) === 0
    ) {
      let structures = creep.room.find(FIND_STRUCTURES, {
        filter: s => "ticksToDecay" in s
      });
      structures.sort((a, b) => hitsLost(b) - hitsLost(a));
      if (structures.length && !hitsLost(structures[0])) {
        structures = creep.room.find(FIND_STRUCTURES, {
          filter: s => "ticksToDecay" in s
        });
      }
      structures.sort((a, b) => hitsLost(b) - hitsLost(a));
      if (structures.length) {
        creep.memory.target = structures[0].id;
      }
    }
    if (creep.memory.target) {
      const target: Structure = Game.getObjectById(creep.memory.target);
      if (creep.repair(target) === ERR_NOT_IN_RANGE) {
        creep.moveTo(target, getMoveOpts(creep));
      }
    }
  } else {
    moveToAndGetEnergyFromNearestContainer(creep);
  }
}

import { getMoveOpts } from "../service/creepColorizer";
import { moveToAndGetEnergyFromNearestContainer } from "../util/sources";

export default function(creep: Creep) {
  creep.say("🔧");
  if (!creep.memory.reloading && creep.carry.energy === 0) {
    creep.memory.reloading = true;
  }
  if (creep.memory.reloading && creep.carry.energy === creep.carryCapacity) {
    creep.memory.reloading = false;
  }
  if (creep.memory.reloading) {
    moveToAndGetEnergyFromNearestContainer(creep);
  } else {
    const hitsLost = (structure: Structure) =>
      structure.hitsMax - structure.hits;
    if (
      !creep.memory.target ||
      hitsLost(Game.getObjectById(creep.memory.target) as Structure) === 0
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
      const target = Game.getObjectById(creep.memory.target) as Structure;
      if (creep.repair(target) === ERR_NOT_IN_RANGE) {
        creep.moveTo(target, getMoveOpts(creep));
      }
    }
  }
}

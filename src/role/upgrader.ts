import { getMoveOpts } from "../service/creepColorizer";
import { moveToAndGetEnergyFromNearestContainer } from "../util/sources";

declare global {
  interface CreepMemory {
    upgrading: boolean;
  }
}

export default function(creep: Creep) {
  creep.say("📈");
  if (creep.memory.upgrading && creep.carry.energy === 0) {
    creep.memory.upgrading = false;
  }
  if (!creep.memory.upgrading && creep.carry.energy === creep.carryCapacity) {
    creep.memory.upgrading = true;
  }
  if (creep.memory.upgrading) {
    const upgradeRc = creep.upgradeController(creep.room.controller);
    if (upgradeRc === ERR_NOT_IN_RANGE) {
      creep.moveTo(creep.room.controller, getMoveOpts(creep));
    }
  } else {
    moveToAndGetEnergyFromNearestContainer(creep);
  }
}

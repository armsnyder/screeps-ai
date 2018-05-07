import { getMoveOpts } from "../service/creepColorizer";
import { moveToAndGetEnergyFromNearestContainer } from "../util/sources";

export default function(creep: Creep) {
  creep.say("📈");
  if (!creep.memory.reloading && creep.carry.energy === 0) {
    creep.memory.reloading = true;
  }
  if (creep.memory.reloading && creep.carry.energy === creep.carryCapacity) {
    creep.memory.reloading = false;
  }
  if (creep.memory.reloading) {
    moveToAndGetEnergyFromNearestContainer(creep);
  } else if (creep.room.controller) {
    const upgradeRc = creep.upgradeController(creep.room.controller);
    if (upgradeRc === ERR_NOT_IN_RANGE) {
      creep.moveTo(creep.room.controller, getMoveOpts(creep));
    }
  }
}

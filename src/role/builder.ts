import { getMoveOpts } from "../service/creepColorizer";
import { moveToAndGetEnergyFromNearestContainer } from "../util/sources";

declare global {
  interface CreepMemory {
    building: boolean;
  }
}

export default function run(creep: Creep) {
  creep.say("⚒️");
  if (creep.memory.building && creep.carry.energy === 0) {
    creep.memory.building = false;
  }
  if (!creep.memory.building && creep.carry.energy === creep.carryCapacity) {
    creep.memory.building = true;
  }
  if (creep.memory.building) {
    const closestSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
    if (closestSite) {
      if (creep.build(closestSite) === ERR_NOT_IN_RANGE) {
        creep.moveTo(closestSite, getMoveOpts(creep));
      }
    }
  } else {
    moveToAndGetEnergyFromNearestContainer(creep);
  }
}

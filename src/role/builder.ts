import { getMoveOpts } from "../service/creepColorizer";
import { moveToAndGetEnergyFromNearestContainer } from "../util/sources";

export default function run(creep: Creep) {
  creep.say("⚒️");
  if (!creep.memory.reloading && creep.carry.energy === 0) {
    creep.memory.reloading = true;
  }
  if (creep.memory.reloading && creep.carry.energy === creep.carryCapacity) {
    creep.memory.reloading = false;
  }
  if (creep.memory.reloading) {
    moveToAndGetEnergyFromNearestContainer(creep);
  } else {
    const closestSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
    if (closestSite) {
      if (creep.build(closestSite) === ERR_NOT_IN_RANGE) {
        creep.moveTo(closestSite, getMoveOpts(creep));
      }
    }
  }
}

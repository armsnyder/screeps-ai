import roleBuilder from "../role/builder";
import roleHarvester from "../role/harvester";
import roleRepairer from "../role/repairer";
import roleSupplier from "../role/supplier";
import roleUpgrader from "../role/upgrader";

declare global {
  interface CreepMemory {
    role: string;
  }
}

function runCreep(creep: Creep) {
  switch (creep.memory.role) {
    case "harvester":
      return roleHarvester(creep);
    case "upgrader":
      return roleUpgrader(creep);
    case "builder":
      return roleBuilder(creep);
    case "repairer":
      return roleRepairer(creep);
    case "supplier":
      return roleSupplier(creep);
  }
}

export default function run() {
  _.values(Game.creeps).forEach(runCreep);
}

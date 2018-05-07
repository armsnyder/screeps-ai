import roleBuilder from "../role/builder";
import roleRepairer from "../role/repairer";
import roleSupplier from "../role/supplier";
import roleUpgrader from "../role/upgrader";

function runCreep(creep: Creep) {
  switch (creep.memory.role) {
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
  (_.values(Game.creeps) as Creep[]).forEach(runCreep);
}

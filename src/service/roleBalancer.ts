import { allRoles, defaultRole } from "../util/roles";

function getBuilderPressure() {
  const constructionSiteCount = _.size(Game.constructionSites);
  if (!constructionSiteCount) {
    return 0;
  }
  const k = 0.1;
  const builderPressure = 2 / (1 + Math.E ** (-k * constructionSiteCount)) - 1;
  return builderPressure;
}

function getSupplierPressure() {
  const { room } = Game.spawns.Spawn1;
  if (
    room.find(FIND_HOSTILE_CREEPS) &&
    (Game.getObjectById("5aeb9ed3eaccbf11e1955a7c") as StructureTower).energy <
      500
  ) {
    return 0.5;
  }
  if (room.energyAvailable === room.energyCapacityAvailable) {
    return 0;
  }
  const factor = 1 - room.energyAvailable / room.energyCapacityAvailable;
  return 0.25 + 0.75 * factor;
}

function getRepairerPressure() {
  const allStructures = Game.spawns.Spawn1.room.find(FIND_STRUCTURES, {
    filter: structure => structure.structureType !== STRUCTURE_WALL
  });
  const totalHitsMax = _.sum(allStructures.map(s => s.hitsMax));
  const totalHits = _.sum(allStructures.map(s => s.hits));
  return 1 - 1.0 * totalHits / totalHitsMax;
}

function getUpgraderPressure() {
  return 0.5;
}

function getPressure(role: string) {
  switch (role) {
    case "builder":
      return getBuilderPressure();
    case "supplier":
      return getSupplierPressure();
    case "repairer":
      return getRepairerPressure();
    case "upgrader":
      return getUpgraderPressure();
    default:
      return 0.5;
  }
}

function countCreepsOfRole(role: string) {
  return _.filter(Game.creeps, { memory: { role } }).length;
}

function getBalanceAnalysis(): BalanceAnalysis {
  const roles = {} as { [role: string]: { pressure: number } };
  let totalPressure = 0;
  allRoles.forEach(role => {
    const pressure = getPressure(role) * Memory.roleBalancer.weights[role];
    roles[role] = { pressure };
    totalPressure += pressure;
  });
  const creepsCount = _.size(Game.creeps);
  let mostNeededCreeps = 1;
  let neededRoles = [] as string[];
  let mostOverLimitCreeps = 1;
  let overLimitRoles = [] as string[];
  _.keys(roles).forEach(role => {
    const creepsOfRole = _.filter(Game.creeps, { memory: { role } }).length;
    const desiredCreepsOfRole =
      roles[role].pressure / totalPressure * creepsCount;
    const minCreepsOfRole = Math.floor(desiredCreepsOfRole);
    const maxCreepsOfRole = Math.ceil(desiredCreepsOfRole);
    const neededCreeps = minCreepsOfRole - creepsOfRole;
    if (neededCreeps > mostNeededCreeps) {
      mostNeededCreeps = neededCreeps;
      neededRoles = [];
    }
    if (neededCreeps === mostNeededCreeps) {
      neededRoles.push(role);
    }
    const overLimitCreeps = creepsOfRole - maxCreepsOfRole;
    if (overLimitCreeps > mostOverLimitCreeps) {
      mostOverLimitCreeps = overLimitCreeps;
      overLimitRoles = [];
    }
    if (overLimitCreeps === mostOverLimitCreeps) {
      mostOverLimitCreeps = overLimitCreeps;
      overLimitRoles.push(role);
    }
  });
  return { neededRoles, overLimitRoles };
}

interface BalanceAnalysis {
  neededRoles: string[];
  overLimitRoles: string[];
}

function findLeastUnNeededRole(balanceAnalysis: BalanceAnalysis) {
  if (balanceAnalysis.neededRoles.length) {
    return _.sample(balanceAnalysis.neededRoles);
  } else if (balanceAnalysis.overLimitRoles.length) {
    const nextRole = _.sample(
      _.difference(allRoles, balanceAnalysis.overLimitRoles)
    );
    return nextRole;
  }
}

function findLeastNeededRole(balanceAnalysis: BalanceAnalysis) {
  if (balanceAnalysis.overLimitRoles.length) {
    return _.sample(balanceAnalysis.overLimitRoles);
  } else if (balanceAnalysis.neededRoles.length) {
    const nextRole = _.sample(
      _.difference(allRoles, balanceAnalysis.neededRoles)
    );
    return nextRole;
  }
}

function findRoleFor(creep: Creep) {
  const balanceAnalysis = getBalanceAnalysis();
  const role = findLeastUnNeededRole(balanceAnalysis) || defaultRole;
  creep.memory.role = role;
}

function balanceExistingCreeps() {
  const balanceAnalysis = getBalanceAnalysis();
  if (balanceAnalysis.neededRoles.length) {
    const nextRole = _.sample(balanceAnalysis.neededRoles);
    const roleToConvert = findLeastNeededRole(balanceAnalysis);
    const creepToConvert = _.sample(
      _.filter(Game.creeps, { memory: { role: roleToConvert } })
    );
    if (creepToConvert) {
      creepToConvert.memory.role = nextRole;
    }
  } else if (balanceAnalysis.overLimitRoles.length) {
    const roleToConvert = _.sample(balanceAnalysis.overLimitRoles);
    const nextRole = findLeastUnNeededRole(balanceAnalysis);
    const creepToConvert = _.sample(
      _.filter(Game.creeps, { memory: { role: roleToConvert } })
    );
    if (creepToConvert && nextRole) {
      creepToConvert.memory.role = nextRole;
    }
  }
}

function initializeMemory() {
  if (!Memory.roleBalancer) {
    Memory.roleBalancer = {};
  }
  if (!Memory.roleBalancer.weights) {
    Memory.roleBalancer.weights = {};
  }
  Memory.roleBalancer.weights = _.pick(Memory.roleBalancer.weights, allRoles);
  allRoles.forEach(role => {
    if (!Memory.roleBalancer.weights[role]) {
      Memory.roleBalancer.weights[role] = 1;
    }
  });
}

export default function run() {
  initializeMemory();
  const unassignedCreep = _.find(
    _.values(Game.creeps),
    creep => !creep.memory.role && !creep.memory.nonBalanced
  );
  if (unassignedCreep) {
    findRoleFor(unassignedCreep);
  } else {
    balanceExistingCreeps();
  }
}

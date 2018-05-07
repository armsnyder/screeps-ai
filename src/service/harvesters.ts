declare global {
  interface Memory {
    harvestersBySource?: { [sourceId: string]: string };
  }
}

function cleanUpDeadCreeps(spawn: StructureSpawn) {
  _.keys(Memory.harvestersBySource).forEach(sourceId => {
    const name = _.get(Memory, `harvestersBySource[${sourceId}]`) as string;
    if (
      Memory.harvestersBySource &&
      !Game.creeps[name] &&
      !(spawn.spawning && spawn.spawning.name === name)
    ) {
      delete Memory.harvestersBySource[sourceId];
    }
  });
}

function spawnIfNeeded(spawn: StructureSpawn) {
  const sourceNeedsCreep = spawn.room
    .find(FIND_SOURCES)
    .find(source => !_.has(Memory, `harvestersBySource[${source.id}]`));
  if (sourceNeedsCreep) {
    if (!spawn.spawning) {
      const name = `Harvester${Game.time}`;
      const spawnRC = spawn.spawnCreep(
        [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE],
        name,
        {
          memory: { nonBalanced: true }
        }
      );
      if (spawnRC === OK) {
        _.set(Memory, `harvestersBySource[${sourceNeedsCreep.id}]`, name);
      }
    }
  }
}

function doHarvesting() {
  _.keys(Memory.harvestersBySource).forEach(sourceId => {
    const creep =
      Game.creeps[_.get(Memory, `harvestersBySource[${sourceId}]`) as string];
    if (creep && creep.carry.energy < creep.carryCapacity) {
      const sourceObj = Game.getObjectById(sourceId) as Source;
      if (creep.harvest(sourceObj) === ERR_NOT_IN_RANGE) {
        creep.moveTo(sourceObj);
      }
    }
  });
}

export default function() {
  const spawn = Game.spawns.Spawn1;
  cleanUpDeadCreeps(spawn);
  spawnIfNeeded(spawn);
  doHarvesting();
}

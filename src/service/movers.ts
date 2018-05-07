declare global {
  interface Memory {
    moversByHarvester?: { [harvesterName: string]: string };
    orphanedMovers?: string[];
  }
}

function deepConcatCustomizer(objValue: any, srcValue: any) {
  if (_.isArray(objValue)) {
    return objValue.concat(srcValue);
  }
}

function cleanUpDeadCreeps(spawn: StructureSpawn) {
  _.entries(Memory.moversByHarvester).forEach(([harvester, mover]) => {
    if (
      !Game.creeps[mover] &&
      !(spawn.spawning && spawn.spawning.name === mover)
    ) {
      _.unset(Memory, `moversByHarvester[${harvester}]`);
    }
  });
}

function discoverOrphans() {
  _.entries(Memory.moversByHarvester).forEach(([harvester, mover]) => {
    if (!Game.creeps[harvester]) {
      _.unset(Memory, `moversByHarvester[${harvester}]`);
      _.mergeWith(Memory, { orphanedMovers: [mover] }, deepConcatCustomizer);
    }
  });
}

function spawnOrLinkIfNeeded(spawn: StructureSpawn) {
  _.values(_.get(Memory, "harvestersBySource", {})).forEach(harvester => {
    if (!_.get(Memory, `moversByHarvester[${harvester}`)) {
      const orphanedMovers = Memory.orphanedMovers;
      if (orphanedMovers && orphanedMovers.length) {
        const name = orphanedMovers.shift();
        _.set(Memory, `moversByHarvester[${harvester}`, name);
      } else if (!spawn.spawning) {
        const name = `Mover${Game.time}`;
        const spawnRC = spawn.spawnCreep(
          [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE],
          name,
          {
            memory: { nonBalanced: true }
          }
        );
        if (spawnRC === OK) {
          _.set(Memory, `moversByHarvester[${harvester}`, name);
        }
      }
    }
  });
}

function doMoving() {
  _.entries(Memory.moversByHarvester).forEach(([harvesterName, moverName]) => {
    const moverCreep = Game.creeps[moverName];
    const harvesterCreep = Game.creeps[harvesterName];
    if (moverCreep && harvesterCreep) {
      if (moverCreep.memory.reloading) {
        if (
          harvesterCreep.transfer(moverCreep, RESOURCE_ENERGY) ===
          ERR_NOT_IN_RANGE
        ) {
          moverCreep.moveTo(harvesterCreep);
        } else {
          harvesterCreep.memory.reloading = false;
        }
      } else {
        const target = moverCreep.pos.findClosestByPath(FIND_STRUCTURES, {
          filter: s =>
            (s.structureType === STRUCTURE_CONTAINER ||
              s.structureType === STRUCTURE_STORAGE) &&
            s.store[RESOURCE_ENERGY] < s.storeCapacity
        });
        if (target) {
          if (
            moverCreep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE
          ) {
            moverCreep.moveTo(target);
          }
        } else {
          const target2 = moverCreep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: s =>
              (s.structureType === STRUCTURE_SPAWN ||
                s.structureType === STRUCTURE_EXTENSION) &&
              s.energy < s.energyCapacity
          });
          if (target2) {
            if (
              moverCreep.transfer(target2, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE
            ) {
              moverCreep.moveTo(target2);
            }
          }
        }
      }
    }
  });
}

export default function() {
  const spawn = Game.spawns.Spawn1;
  cleanUpDeadCreeps(spawn);
  discoverOrphans();
  spawnOrLinkIfNeeded(spawn);
  doMoving();
}

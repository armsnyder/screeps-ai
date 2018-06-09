import { countCreeps, getSpawn } from "../util/spawn";
import { trySpawnThisTick } from "./spawnQueue";

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
  _.keys(Memory.moversByHarvester).forEach(harvester => {
    const mover = _.get(Memory, `moversByHarvester[${harvester}]`) as string;
    if (Memory.moversByHarvester) {
      const moverCount = countCreeps({
        nameFilter: n => n === mover
      });
      if (!moverCount) {
        delete Memory.moversByHarvester[harvester];
      }
    }
  });
}

function discoverOrphans() {
  _.keys(Memory.moversByHarvester).forEach(harvester => {
    const harvesterCount = countCreeps({
      nameFilter: n => n === harvester
    });
    if (Memory.moversByHarvester && !harvesterCount) {
      const mover = Memory.moversByHarvester[harvester];
      if (!Memory.orphanedMovers) {
        Memory.orphanedMovers = [];
      }
      Memory.orphanedMovers.push(mover);
      delete Memory.moversByHarvester[harvester];
    }
  });
}

function spawnOrLinkIfNeeded(spawn: StructureSpawn) {
  _.values(_.get(Memory, "harvestersBySource", {})).forEach(harvester => {
    if (!_.get(Memory, `moversByHarvester[${harvester}]`)) {
      const orphanedMovers = Memory.orphanedMovers;
      if (orphanedMovers && orphanedMovers.length) {
        const name = orphanedMovers.shift();
        _.set(Memory, `moversByHarvester[${harvester}]`, name);
      } else {
        const name = `Mover${Game.time}`;
        trySpawnThisTick({
          body: [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE],
          memory: { role: "mover" },
          name
        });
        _.set(Memory, `moversByHarvester[${harvester}]`, name);
      }
    }
  });
}

function doMoving() {
  _.keys(Memory.moversByHarvester).forEach(harvesterName => {
    if (!Memory.moversByHarvester) {
      return;
    }
    const moverCreep = Game.creeps[Memory.moversByHarvester[harvesterName]];
    const harvesterCreep = Game.creeps[harvesterName];
    if (moverCreep && harvesterCreep) {
      if (!moverCreep.memory.reloading && moverCreep.carry.energy === 0) {
        moverCreep.memory.reloading = true;
      }
      if (moverCreep.memory.reloading) {
        if (
          harvesterCreep.transfer(moverCreep, RESOURCE_ENERGY) ===
          ERR_NOT_IN_RANGE
        ) {
          moverCreep.moveTo(harvesterCreep);
        } else {
          moverCreep.memory.reloading = false;
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
  const spawn = getSpawn();
  if (!spawn) {
    return;
  }
  cleanUpDeadCreeps(spawn);
  discoverOrphans();
  spawnOrLinkIfNeeded(spawn);
  doMoving();
}

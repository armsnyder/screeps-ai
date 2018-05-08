import { countCreepsAliveOrEnqueued, getSpawn } from "../util/spawn";
import { enqueue } from "./spawnQueue";

declare global {
  interface Memory {
    harvestersBySource?: { [sourceId: string]: string };
  }
}

function cleanUpDeadCreeps() {
  _.keys(Memory.harvestersBySource).forEach(sourceId => {
    const name = _.get(Memory, `harvestersBySource[${sourceId}]`) as string;
    if (Memory.harvestersBySource) {
      const harvesterCount = countCreepsAliveOrEnqueued({
        nameFilter: n => n === name
      });
      if (!harvesterCount) {
        delete Memory.harvestersBySource[sourceId];
      }
    }
  });
}

function spawnIfNeeded() {
  const spawn = getSpawn();
  if (!spawn) {
    return;
  }
  const sourceNeedsCreep = spawn.room
    .find(FIND_SOURCES)
    .find(source => !_.has(Memory, `harvestersBySource[${source.id}]`));
  if (sourceNeedsCreep) {
    const name = `Harvester${Game.time}`;
    enqueue({
      body: [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE],
      memory: { nonBalanced: true },
      name
    });
    _.set(Memory, `harvestersBySource[${sourceNeedsCreep.id}]`, name);
  }
}

function doHarvesting() {
  _.keys(Memory.harvestersBySource).forEach(sourceId => {
    const creep =
      Game.creeps[_.get(Memory, `harvestersBySource[${sourceId}]`) as string];
    if (creep) {
      if (creep.carry.energy < creep.carryCapacity) {
        const sourceObj = Game.getObjectById(sourceId) as Source;
        if (creep.harvest(sourceObj) === ERR_NOT_IN_RANGE) {
          creep.moveTo(sourceObj);
        }
      } else if (_.size(Game.creeps) === 1) {
        const spawn = getSpawn();
        if (spawn) {
          if (creep.transfer(spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(spawn);
          }
        }
      }
    }
  });
}

export default function() {
  cleanUpDeadCreeps();
  spawnIfNeeded();
  doHarvesting();
}

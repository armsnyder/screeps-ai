import FuelTransportMission from "./FuelTransportMission";
import Lazy from "./Lazy";
import Mission from "./Mission";
import MissionContext from "./MissionContext";
import RoomCache from "./RoomCache";
import SpawnRequest from "./SpawnRequest";

interface State {
  boredom: { [creep: string]: number };
  sourcesByCreep: { [creep: string]: string };
  creepsBySource: { [source: string]: string };
}

export default class HarvestMission extends Mission<State> {
  public get spawnRequest() {
    const { safeSources, spawn } = this.roomCache;
    if (!spawn) {
      return SpawnRequest.NONE;
    }
    const needed = safeSources.length - _.size(this.state.sourcesByCreep);
    if (needed === 0) {
      return SpawnRequest.NONE;
    }
    const assignedSources = new Set(_.values(
      this.state.sourcesByCreep
    ) as string[]);
    const sourceNeedingAssignment = spawn.pos.findClosestByPath(safeSources, {
      filter: (source: Source) => !assignedSources.has(source.id),
      ignoreCreeps: true
    });
    if (!sourceNeedingAssignment) {
      return SpawnRequest.NONE;
    }
    let priority;
    if (needed === safeSources.length) {
      priority = 1;
    } else {
      priority = 5;
    }
    const desiredBodies = [
      [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE], // 750
      [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE], // 650
      [WORK, WORK, WORK, CARRY, CARRY, MOVE], // 450
      [WORK, WORK, CARRY, MOVE], // 300
      [WORK, CARRY, MOVE] // 200
    ];
    return new SpawnRequest(
      "Harvester",
      priority,
      ((name: string) => this.onSpawn(name, sourceNeedingAssignment.id)).bind(
        this
      ),
      desiredBodies
    );
  }

  public run() {
    _.keys(this.state.sourcesByCreep).forEach(creepName => {
      const creep = this.game.creeps[creepName];
      const source = this.game.getObjectById(
        this.state.sourcesByCreep[creepName]
      ) as Source;
      if (creep.carry.energy < creep.carryCapacity) {
        if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
          creep.moveTo(source);
        }
        _.set(this.state.boredom, creepName, 2);
      } else {
        const { spawn } = this.roomCache;
        if (spawn && spawn.energy < spawn.energyCapacity) {
          if (this.state.boredom[creepName] > 0) {
            this.state.boredom[creepName] -= 1;
          } else if (
            creep.transfer(spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE
          ) {
            creep.moveTo(spawn);
          }
        }
      }
    });
  }

  public get creepAssignments(): Map<Creep, Source> {
    return new Map<Creep, Source>(_.pairs(this.state.sourcesByCreep)
      .filter(([k, v]) => this.game.creeps[k])
      .map(([k, v]) => [
        this.game.creeps[k],
        this.game.getObjectById(v)
      ]) as Array<[Creep, Source]>);
  }

  public getAssignee(sourceId: string): Creep {
    return Game.creeps[this.state.creepsBySource[sourceId]];
  }

  protected get defaultState() {
    return {
      boredom: {},
      creepsBySource: {},
      sourcesByCreep: {}
    };
  }

  protected get creeps(): Iterable<string> {
    return _.keys(this.state.sourcesByCreep);
  }

  protected deleteCreep(creep: string): void {
    const source = this.state.sourcesByCreep[creep];
    if (source) {
      delete this.state.creepsBySource[source];
    }
    delete this.state.sourcesByCreep[creep];
    delete this.state.boredom[creep];
  }

  private onSpawn(creepName: string, sourceId: string) {
    this.state.sourcesByCreep[creepName] = sourceId;
    this.state.creepsBySource[sourceId] = creepName;
  }
}

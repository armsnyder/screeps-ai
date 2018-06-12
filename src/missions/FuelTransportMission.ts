import HarvestMission from "./HarvestMission";
import Mission from "./Mission";
import MissionContext from "./MissionContext";
import RoomCache from "./RoomCache";
import SpawnRequest from "./SpawnRequest";

interface State {
  reloading: { [creep: string]: boolean };
  sourceByTransporter: { [transporter: string]: string };
  transportersBySource: { [source: string]: string[] };
}

export default class FuelTransportMission extends Mission<State> {
  public readonly name = "fuelTransport";

  public get spawnRequest() {
    const { spawn } = this.roomCache;
    if (!spawn) {
      throw Error();
    }
    const harvesterAssignments = this.harvestMission.creepAssignments;
    if (!harvesterAssignments.size) {
      return SpawnRequest.NONE;
    }
    const sourcesNeedingTransport = Array.from(harvesterAssignments.entries())
      .filter(([creep, source]) =>
        this.doesHarvesterNeedMoreCreeps(creep, source)
      )
      .map(([creep, source]) => source);
    if (!sourcesNeedingTransport.length) {
      return SpawnRequest.NONE;
    }
    const targetSource = spawn.pos.findClosestByPath(sourcesNeedingTransport);
    const priority = _.size(this.state.transportersBySource) ? 8 : 3;
    return new SpawnRequest(
      "Transporter",
      priority,
      ((name: string) => this.onSpawn(name, targetSource)).bind(this),
      [
        [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE], // 300
        [CARRY, CARRY, MOVE, MOVE], // 200
        [CARRY, MOVE] // 100
      ]
    );
  }

  public run() {
    for (const creepName of _.keys(this.state.sourceByTransporter)) {
      const transporterCreep = this.game.creeps[creepName];
      const harvesterCreep = this.harvestMission.getAssignee(
        this.state.sourceByTransporter[creepName]
      );
      if (transporterCreep && harvesterCreep) {
        if (
          !this.state.reloading[creepName] &&
          transporterCreep.carry.energy === 0
        ) {
          this.state.reloading[creepName] = true;
        }
        if (this.state.reloading[creepName]) {
          if (
            harvesterCreep.carry.energy < harvesterCreep.carryCapacity ||
            harvesterCreep.transfer(transporterCreep, RESOURCE_ENERGY) ===
              ERR_NOT_IN_RANGE
          ) {
            transporterCreep.moveTo(harvesterCreep);
          } else {
            this.state.reloading[creepName] = false;
          }
        } else {
          const target = transporterCreep.pos.findClosestByPath(
            FIND_STRUCTURES,
            {
              filter: s =>
                (s.structureType === STRUCTURE_CONTAINER ||
                  s.structureType === STRUCTURE_STORAGE) &&
                s.store[RESOURCE_ENERGY] < s.storeCapacity
            }
          );
          if (target) {
            if (
              transporterCreep.transfer(target, RESOURCE_ENERGY) ===
              ERR_NOT_IN_RANGE
            ) {
              transporterCreep.moveTo(target);
            }
          } else {
            const target2 = transporterCreep.pos.findClosestByPath(
              FIND_STRUCTURES,
              {
                filter: s =>
                  (s.structureType === STRUCTURE_SPAWN ||
                    s.structureType === STRUCTURE_EXTENSION) &&
                  s.energy < s.energyCapacity
              }
            );
            if (target2) {
              if (
                transporterCreep.transfer(target2, RESOURCE_ENERGY) ===
                ERR_NOT_IN_RANGE
              ) {
                transporterCreep.moveTo(target2);
              }
            }
          }
        }
      }
    }
  }

  protected get defaultState() {
    return {
      reloading: {},
      sourceByTransporter: {},
      transportersBySource: {}
    };
  }

  protected get creeps(): Iterable<string> {
    return _.keys(this.state.sourceByTransporter);
  }

  protected deleteCreep(creep: string): void {
    const source = this.state.sourceByTransporter[creep];
    if (source) {
      const transporterIndex = this.state.transportersBySource[source].indexOf(
        creep
      );
      this.state.transportersBySource[source].splice(transporterIndex, 1);
      if (!this.state.transportersBySource[source].length) {
        delete this.state.transportersBySource[source];
      }
    }
    delete this.state.sourceByTransporter[creep];
    delete this.state.reloading[creep];
  }

  private onSpawn(name: string, targetSource: Source) {
    if (!this.state.transportersBySource[targetSource.id]) {
      this.state.transportersBySource[targetSource.id] = [];
    }
    this.state.transportersBySource[targetSource.id].push(name);
    this.state.sourceByTransporter[name] = targetSource.id;
  }

  private doesHarvesterNeedMoreCreeps(
    harvester: Creep,
    source: Source
  ): boolean {
    const harvesterFillUpTime =
      1.0 * this.predictHarvesterFillUpTime(harvester);
    const existingTransporters: Creep[] = _.get(
      this.state.transportersBySource,
      source.id,
      []
    ).map(name => this.game.creeps[name]);
    const closestContainer = source.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: s =>
        s.structureType === STRUCTURE_CONTAINER ||
        s.structureType === STRUCTURE_SPAWN ||
        s.structureType === STRUCTURE_STORAGE,
      ignoreCreeps: true
    });
    if (!closestContainer) {
      return false;
    }
    const { path } = this.pathFinder.search(source.pos, closestContainer.pos);
    let percentFulfilled = 0;
    let i = 0;
    while (percentFulfilled < 1 && i < existingTransporters.length) {
      const transporter = existingTransporters[i];
      const travelTime = this.predictRoundTripTravelTimeOnFullCapacity(
        transporter,
        path
      );
      percentFulfilled += harvesterFillUpTime / travelTime;
      i += 1;
    }
    return percentFulfilled < 1;
  }

  private predictHarvesterFillUpTime(creep: Creep): number {
    const unitsPerTick = creep.body.filter(part => part.type === WORK).length;
    return Math.ceil(creep.carryCapacity * 1.0 / unitsPerTick);
  }

  private predictRoundTripTravelTimeOnFullCapacity(
    creep: Creep,
    path: RoomPosition[]
  ) {
    const creepWeight = creep.body.filter(part => part.type !== MOVE).length;
    const movePartCount = creep.body.filter(part => part.type === MOVE).length;
    return (
      2 +
      2 *
        _.sum(
          path.map(pos => {
            const terrainFactor = this.getTerrainFactor(pos);
            return this.calculateTicksForMove(
              creepWeight,
              terrainFactor,
              movePartCount
            );
          })
        )
    );
  }

  private getTerrainFactor(pos: RoomPosition): number {
    const hasRoad = pos
      .lookFor(LOOK_STRUCTURES)
      .filter(s => s.structureType === STRUCTURE_ROAD).length;
    if (hasRoad) {
      return 0.5;
    }
    const terrain = this.game.map.getTerrainAt(pos);
    return terrain === "plain" ? 1.0 : 5.0;
  }

  private calculateTicksForMove(
    creepWeight: number,
    terrainFactor: number,
    movePartCount: number
  ) {
    return Math.ceil(terrainFactor * creepWeight / movePartCount);
  }

  private get harvestMission(): HarvestMission {
    return this.missionContext.get("harvest") as HarvestMission;
  }
}

import HarvestMission from "./HarvestMission";
import Mission from "./Mission";
import MissionContext from "./MissionContext";
import RoomCache from "./RoomCache";
import SpawnRequest from "./SpawnRequest";

interface State {
  reloading: { [creep: string]: boolean };
}

export default class UpgradeControllerMission extends Mission<State> {
  public get spawnRequest() {
    if (
      !this.hasEnoughEnergyToDoUpgrades ||
      _.any(_.values(this.state.reloading))
    ) {
      return SpawnRequest.NONE;
    }
    const priority = _.size(this.state.reloading) ? 15 : 7;
    return new SpawnRequest(
      "UpgradeController",
      priority,
      this.onSpawn.bind(this),
      [
        [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, WORK, WORK, WORK], // 600
        [CARRY, CARRY, MOVE, MOVE, WORK], // 300
        [CARRY, MOVE, WORK] // 200
      ]
    );
  }

  private get hasEnoughEnergyToDoUpgrades() {
    return (
      this.room.energyAvailable >=
      Math.min(this.room.energyCapacityAvailable, 1000)
    );
  }

  public run() {
    const controller = this.room.controller;
    if (!controller) {
      return;
    }
    const shouldNotReload =
      !this.hasEnoughEnergyToDoUpgrades ||
      !this.harvestMission.creepAssignments.size;
    _.pairs(this.state.reloading).forEach(([creepName, reloading]) => {
      const creep = this.game.creeps[creepName];
      if (!creep) {
        return;
      }
      if (!reloading && creep.carry.energy === 0) {
        this.state.reloading[creepName] = true;
      }
      if (reloading) {
        if (shouldNotReload) {
          return;
        }
        const closestContainer = creep.pos.findClosestByPath(FIND_STRUCTURES, {
          filter: s =>
            s.structureType === STRUCTURE_SPAWN ||
            s.structureType === STRUCTURE_CONTAINER ||
            s.structureType === STRUCTURE_STORAGE,
          ignoreCreeps: true
        });
        if (!closestContainer) {
          return;
        }
        if (
          creep.withdraw(closestContainer, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE
        ) {
          creep.moveTo(closestContainer);
        } else {
          this.state.reloading[creepName] = false;
        }
      } else if (
        creep.transfer(controller, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE
      ) {
        creep.moveTo(controller);
      }
    });
  }

  protected get defaultState() {
    return {
      reloading: {}
    };
  }

  protected get creeps(): Iterable<string> {
    return _.keys(this.state.reloading);
  }

  protected deleteCreep(creep: string): void {
    delete this.state.reloading[creep];
  }

  private onSpawn(name: string) {
    this.state.reloading[name] = true;
  }

  private get harvestMission(): HarvestMission {
    return this.missionContext.get("harvest") as HarvestMission;
  }
}

import HarvestMission from "./HarvestMission";
import Mission from "./Mission";
import MissionContext from "./MissionContext";
import RoomCache from "./RoomCache";
import SpawnRequest from "./SpawnRequest";

interface State {
  buildLocationsInitialized: boolean;
  occupiedBuildLocations: Array<{ x: number; y: number }>;
  unoccupiedBuildLocations: Array<{ x: number; y: number }>;
  creep: string | undefined;
}

export default class ExtensionConstructionMission extends Mission<State> {
  public get spawnRequest() {
    if (
      this.state.creep != null ||
      !this.canBuildExtension ||
      !this.isRoomEnergySufficient
    ) {
      return SpawnRequest.NONE;
    }
    const harvesterAssignments = this.harvestMission.creepAssignments;
    if (!harvesterAssignments.size) {
      return SpawnRequest.NONE;
    }
    if (!this.state.buildLocationsInitialized) {
      this.initializeBuildLocations();
    }
    return new SpawnRequest(
      "ExtensionConstructor",
      6,
      this.onSpawn.bind(this),
      [
        [CARRY, CARRY, MOVE, MOVE, WORK, WORK, WORK], // 500
        [CARRY, MOVE, WORK, WORK], // 300
        [CARRY, MOVE, WORK] // 200
      ]
    );
  }

  private get isRoomEnergySufficient() {
    return (
      this.room.energyAvailable >=
      Math.min(this.room.energyCapacityAvailable, 1000)
    );
  }

  public run() {
    if (!this.state.buildLocationsInitialized) {
      this.initializeBuildLocations();
    }
    const constructionSitesToCreate = this.constructionSitesToCreate;
    for (let i = 0; i < constructionSitesToCreate; i += 1) {
      makeConstructionSite();
    }
    if (this.state.creep != null) {
      this.runCreep(this.state.creep);
    }
  }

  protected get defaultState() {
    return {
      buildLocationsInitialized: false,
      creep: undefined,
      occupiedBuildLocations: [],
      unoccupiedBuildLocations: []
    };
  }

  protected get creeps(): Iterable<string> {
    return this.state.creep ? [this.state.creep] : [];
  }

  protected deleteCreep(creep: string): void {
    this.state.creep = undefined;
  }

  private onSpawn(name: string) {
    this.state.creep = name;
  }

  private get harvestMission(): HarvestMission {
    return this.missionContext.get("harvest") as HarvestMission;
  }

  private get canBuildExtension(): boolean {
    return this.extensions < this.maxExtensions;
  }

  private get maxExtensions(): number {
    if (!this.room.controller) {
      return 0;
    }
    switch (this.room.controller.level) {
      case 2:
        return 5;
      case 3:
        return 10;
      default:
        return (this.room.controller.level - 2) * 10;
    }
  }

  private get extensions(): number {
    return this.room.find(FIND_STRUCTURES, {
      filter: s => s.structureType === STRUCTURE_EXTENSION
    }).length;
  }

  private initializeBuildLocations(): void {
    const ROOM_LENGTH = 50;
    const map: boolean[][] = [];
    for (let i: number = 0; i < ROOM_LENGTH; i++) {
      map[i] = [];
      for (let j: number = 0; j < ROOM_LENGTH; j++) {
        map[i][j] = true;
      }
    }
    this.room
      .find(FIND_STRUCTURES, {
        filter: s => s.structureType !== STRUCTURE_EXTENSION
      })
      .forEach(s => (map[s.pos.x][s.pos.y] = false));
    const { spawn } = this.roomCache;
    if (spawn) {
      if (this.room.controller) {
        this.pathFinder
          .search(spawn.pos, this.room.controller.pos)
          .path.forEach(p => (map[p.x][p.y] = false));
      }
      this.roomCache.sources.forEach(s =>
        this.pathFinder
          .search(s.pos, spawn.pos)
          .path.forEach(p => (map[p.x][p.y] = false))
      );
    }
    for (let i: number = 1; i < ROOM_LENGTH - 1; i++) {
      for (let j: number = 1; j < ROOM_LENGTH - 1; j++) {
        if (!map[i][j]) {
          map[i - 1][j] = false;
          map[i + 1][j] = false;
          map[i][j - 1] = false;
          map[i][j + 1] = false;
          map[i - 1][j + 1] = false;
          map[i + 1][j - 1] = false;
          map[i - 1][j - 1] = false;
          map[i + 1][j + 1] = false;
        }
      }
    }
    for (let i: number = 0; i < ROOM_LENGTH; i++) {
      for (let j: number = i % 2; j < ROOM_LENGTH; j += 2) {
        map[i][j] = false;
      }
    }
    for (let i: number = 0; i < ROOM_LENGTH; i++) {
      for (let j: number = 0; j < ROOM_LENGTH; j++) {
        if (this.game.map.getTerrainAt(i, j, this.room.name) === "wall") {
          map[i][j] = false;
        }
      }
    }
  }
}

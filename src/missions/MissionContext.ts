import FuelTransportMission from "./FuelTransportMission";
import HarvestMission from "./HarvestMission";
import Mission from "./Mission";
import RoomCache from "./RoomCache";
import UpgradeControllerMission from "./UpgradeControllerMission";

export default class MissionContext {
  public readonly room: Room;
  public readonly game: Game;
  public readonly memory: Memory;
  public readonly roomCache: RoomCache;
  public readonly pathFinder: PathFinder;
  private readonly _missions: Map<string, Mission<any>>;

  constructor() {
    this.room = _.first(_.values(Game.rooms));
    this.game = Game;
    this.memory = Memory;
    this.roomCache = new RoomCache(this.room);
    this.pathFinder = PathFinder;
    this._missions = new Map();
  }

  public add(
    missionFactoryFunction: (missionContext: MissionContext) => Mission<any>
  ): void {
    const mission = missionFactoryFunction(this);
    this._missions.set(mission.name, mission);
  }

  public get(missionName: string): Mission<any> {
    const mission = this._missions.get(missionName);
    if (mission == null) {
      throw Error(`Nonexistent mission ${missionName}`);
    }
    return mission;
  }

  public get missions(): Iterable<Mission<any>> {
    return this._missions.values();
  }

  public run(): void {
    for (const mission of this._missions.values()) {
      mission.initState();
    }
    for (const mission of this._missions.values()) {
      mission.preRun();
    }
    for (const mission of this._missions.values()) {
      mission.run();
    }
  }
}

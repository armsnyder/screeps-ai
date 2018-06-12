import MissionContext from "./MissionContext";
import RoomCache from "./RoomCache";
import SpawnRequest from "./SpawnRequest";

export default abstract class Mission<T> {
  public readonly name: string;
  protected readonly missionContext: MissionContext;
  protected readonly game: Game;
  protected readonly room: Room;
  protected readonly roomCache: RoomCache;
  protected readonly pathFinder: PathFinder;

  // noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
  constructor(missionContext: MissionContext, name: string) {
    this.name = name;
    this.missionContext = missionContext;
    this.game = missionContext.game;
    this.room = missionContext.room;
    this.roomCache = missionContext.roomCache;
    this.pathFinder = missionContext.pathFinder;
  }

  public abstract get spawnRequest(): SpawnRequest;

  public abstract run(): void;

  protected abstract get creeps(): Iterable<string>;

  public preRun(): void {
    for (const creep of this.creeps) {
      if (!_.has(this.game.creeps, creep)) {
        this.deleteCreep(creep);
      }
    }
  }

  public initState() {
    _.merge(this.missionContext.memory.missions, {
      [this.name]: this.defaultState
    });
  }

  protected get state(): T {
    return this.missionContext.memory.missions[this.name];
  }

  protected abstract get defaultState(): T;

  protected abstract deleteCreep(creep: string): void;
}

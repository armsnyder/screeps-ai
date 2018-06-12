import Lazy from "./Lazy";

export default class RoomCache {
  private readonly _room: Room;

  private spawnLazy = new Lazy<StructureSpawn | undefined>(() =>
    _.first(this.room.find(FIND_MY_SPAWNS))
  );

  private sourcesLazy = new Lazy<Source[]>(() => this.room.find(FIND_SOURCES));

  private safeSourcesLazy = new Lazy<Source[]>(() =>
    this.sources.filter(
      source => source.pos.findInRange(FIND_HOSTILE_STRUCTURES, 5).length === 0
    )
  );

  constructor(room: Room) {
    this._room = room;
  }

  public get room(): Room {
    return this._room;
  }

  public get spawn(): StructureSpawn | undefined {
    return this.spawnLazy.get();
  }

  public get sources(): Source[] {
    return this.sourcesLazy.get();
  }

  public get safeSources(): Source[] {
    return this.safeSourcesLazy.get();
  }
}

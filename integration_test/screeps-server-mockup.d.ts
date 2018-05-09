// tslint:disable:max-classes-per-file

declare module "screeps-server-mockup" {
  import Dictionary = _.Dictionary;

  class TerrainMatrix {
    public static unserialize(str: string): TerrainMatrix;
    public get(x: number, y: number): Terrain;
    public set(x: number, y: number, value: Terrain): TerrainMatrix;
    public serialize(): string;
  }
  interface ScreepsWorld {
    readonly gameTime: Promise<number>;
    load(): Promise<any>;
    setRoom(room: string, status?: string, active?: boolean): Promise<any>;
    addRoom(room: string): Promise<any>;
    getTerrain(room: string): Promise<TerrainMatrix>;
    setTerrain(room: string, terrain?: TerrainMatrix): Promise<any>;
    addRoomObject(
      room: string,
      type: StructureConstant | "source",
      x: number,
      y: number,
      attributes: any
    ): Promise<any>;
    reset(): Promise<any>;
    stubWorld(): Promise<any>;
    roomObjects(room: string): Promise<DBRoomObject[]>;
    addBot(args: any): Promise<any>;
    updateEnvTerrain(db: any, env: any): Promise<any>;
  }
  interface DBRoomObject {
    energy: number;
    type: string;
    x: number;
    y: number;
  }
  interface ScreepsUser extends NodeJS.EventEmitter {
    knownNotifications: any[];
    readonly id: any;
    readonly username: string;
    readonly cpu: Promise<number>;
    readonly cpuAvailable: Promise<number>;
    readonly gcl: Promise<number>;
    readonly rooms: Promise<string[]>;
    readonly lastUsedCpu: Promise<number>;
    readonly memory: Promise<any>;
    readonly notifications: Promise<any[]>;
    readonly newNotifications: Promise<any[]>;
    readonly activeSegments: Promise<any>;
    getSegments(list: any[]): Promise<any>;
    console(cmd: string): Promise<any>;
    getData(name: string): Promise<any>;
    init(): Promise<ScreepsUser>;
  }
  class ScreepsServer {
    public common: any;
    public driver: any;
    public config: any;
    public constants: any;
    public connected: boolean;
    public lastAccessibleRoomsUpdate: number;
    public processes: any;
    public world: ScreepsWorld;
    public setOpts(opts: any): ScreepsServer;
    public connect(): Promise<ScreepsServer>;
    public tick(): Promise<void>;
    public startProcess(name: string, execPath: string, env: any): Promise<any>;
    public start(): Promise<ScreepsServer>;
    public stop(): Promise<ScreepsServer>;
  }
}

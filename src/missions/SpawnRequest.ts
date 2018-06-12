export default class SpawnRequest {
  public static readonly NONE: SpawnRequest = new SpawnRequest(
    "None",
    Number.MAX_VALUE,
    () => {
      // do nothing
    },
    []
  );

  public readonly baseName: string;
  public readonly priority: number;
  public readonly onSpawn: (name: string) => void;
  public readonly desiredBodies: BodyPartConstant[][];

  constructor(
    baseName: string,
    priority: number,
    onSpawn: (name: string) => void,
    desiredBodies: BodyPartConstant[][]
  ) {
    this.baseName = baseName;
    this.priority = priority;
    this.onSpawn = onSpawn;
    this.desiredBodies = desiredBodies;
  }
}

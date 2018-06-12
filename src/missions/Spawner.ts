import Mission from "./Mission";
import MissionContext from "./MissionContext";
import SpawnRequest from "./SpawnRequest";

export default class Spawner {
  private readonly missionContext: MissionContext;

  constructor(missionContext: MissionContext) {
    this.missionContext = missionContext;
  }

  public spawnNext(): void {
    const { spawn } = this.missionContext.roomCache;
    if (spawn && !spawn.spawning) {
      const spawnRequests: SpawnRequest[] = Array.from(
        this.missionContext.missions
      ).map(mission => mission.spawnRequest);
      if (spawnRequests.length > 0) {
        const spawnRequest = spawnRequests.sort(
          (a, b) => a.priority - b.priority
        )[0];
        const name = spawnRequest.baseName + Game.time;
        for (const desiredBody of spawnRequest.desiredBodies) {
          if (spawn.spawnCreep(desiredBody, name) === OK) {
            spawnRequest.onSpawn(name);
            break;
          }
        }
      }
    }
  }
}

import serviceCreepColorizer from "./service/creepColorizer";
import serviceCreepRunner from "./service/creepRunner";
import serviceGenericWorkerSpawner from "./service/genericWorkerSpawner";
import serviceHarvesters from "./service/harvesters";
import serviceMovers from "./service/movers";
import serviceRoadSpawner from "./service/roadSpawner";
import serviceRoleBalancer from "./service/roleBalancer";
import serviceSpawnQueue from "./service/spawnQueue";
import serviceTowers from "./service/towers";

function cleanMemory() {
  for (const name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
    }
  }
}

export function loop() {
  cleanMemory();
  serviceHarvesters();
  serviceMovers();
  serviceCreepRunner();
  serviceSpawnQueue();
  serviceCreepColorizer();
  serviceCreepRunner();
  serviceRoleBalancer();
  serviceRoadSpawner();
  serviceTowers();
  serviceGenericWorkerSpawner();
}

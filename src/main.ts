import serviceCreepColorizer from "./service/creepColorizer";
import serviceCreepRunner from "./service/creepRunner";
import serviceRoleBalancer from "./service/genericWorkerBalancer";
import serviceGenericWorkerSpawner from "./service/genericWorkerSpawner";
import serviceHarvesters from "./service/harvesters";
import serviceMovers from "./service/movers";
import serviceRoadSpawner from "./service/roadSpawner";
import * as serviceSpawnQueue from "./service/spawnQueue";
import serviceTowers from "./service/towers";

function cleanMemory() {
  for (const name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
    }
  }
}

export function loop() {
  Game.cache = {};
  serviceSpawnQueue.init();
  cleanMemory();

  serviceHarvesters();
  serviceMovers();
  serviceGenericWorkerSpawner();

  serviceCreepRunner();
  serviceCreepColorizer();
  serviceCreepRunner();
  serviceRoleBalancer();
  serviceRoadSpawner();
  serviceTowers();

  serviceSpawnQueue.doNextSpawn();
}

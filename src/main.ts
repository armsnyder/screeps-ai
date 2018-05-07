import serviceCreepColorizer from "./service/creepColorizer";
import serviceCreepRunner from "./service/creepRunner";
import serviceHarvesters from "./service/harvesters";
import serviceMovers from "./service/movers";
import serviceRoadSpawner from "./service/roadSpawner";
import serviceRoleBalancer from "./service/roleBalancer";
import serviceSpawnQueue from "./service/spawnQueue";

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
  const tower = Game.getObjectById(
    "5aeb9ed3eaccbf11e1955a7c"
  ) as StructureTower;
  const target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
  tower.attack(target);
}

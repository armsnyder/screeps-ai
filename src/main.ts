import serviceCreepColorizer from "./service/creepColorizer";
import serviceCreepRunner from "./service/creepRunner";
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
  serviceCreepRunner();
  serviceSpawnQueue();
  serviceCreepColorizer();
  serviceCreepRunner();
  serviceRoleBalancer();
  serviceRoadSpawner();
  const tower: StructureTower = Game.getObjectById("5aeb9ed3eaccbf11e1955a7c");
  const target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
  tower.attack(target);
}

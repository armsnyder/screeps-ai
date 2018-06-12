import { readFileSync } from "fs";
import { removeAsync } from "fs-extra-promise";
import { filter, find, get, isFunction, keys, size } from "lodash";
import { resolve } from "path";
import {
  DBRoomObject,
  ScreepsServer,
  ScreepsUser,
  ScreepsWorld
} from "screeps-server-mockup";

describe("integration tests", () => {
  let server: ScreepsServer;
  let user: ScreepsUser;
  let roomObjectsLastTick: DBRoomObject[];
  let roomObjects: DBRoomObject[];
  let world: ScreepsWorld;
  const room = "W0N1";

  async function commonRoomInitialization() {
    await world.addRoom(room);
    await world.setTerrain(room); // default terrain
    await world.addRoomObject(room, "controller", 15, 18, {
      level: 1
    });
    await world.addRoomObject(room, "source", 26, 28, {
      energy: 2000,
      energyCapacity: 2000,
      ticksToRegeneration: 20
    });
  }

  async function addUser(): Promise<any> {
    const modules = {
      main: readFileSync(resolve("dist", "main.js"), "utf8")
    };
    return world.addBot({
      modules,
      room,
      username: "bot",
      x: 25,
      y: 25
    });
  }

  function getSpawnEnergy(objects: DBRoomObject[] = roomObjects) {
    return get(find(objects, { type: "spawn" }), "energy");
  }

  function getSourceEnergy(objects: DBRoomObject[] = roomObjects) {
    return get(find(objects, { type: "source" }), "energy");
  }

  function getCreepEnergy(name: string, objects: DBRoomObject[] = roomObjects) {
    return get(find(objects, { type: "creep", name }), "energy");
  }

  function countSpawnedCreeps(objects: DBRoomObject[] = roomObjects) {
    return size(filter(objects, { type: "creep" }));
  }

  function getControllerProgress(objects: DBRoomObject[] = roomObjects) {
    return get(find(objects, { type: "controller" }), "progress");
  }

  function getIsCreepNextToSource(
    name: string,
    objects: DBRoomObject[] = roomObjects
  ) {
    const creep = find(objects, { type: "creep", name });
    if (!creep) {
      throw Error("No creep found");
    }
    const source = find(objects, { type: "source" });
    if (!source) {
      throw Error("No source found");
    }
    return (
      Math.abs(creep.x - source.x) <= 1 && Math.abs(creep.y - source.y) <= 1
    );
  }

  function getIsCreepNextToSpawn(
    name: string,
    objects: DBRoomObject[] = roomObjects
  ) {
    const creep = find(objects, { type: "creep", name });
    if (!creep) {
      throw Error("No creep found");
    }
    const spawn = find(objects, { type: "spawn" });
    if (!spawn) {
      throw Error("No spawn found");
    }
    return Math.abs(creep.x - spawn.x) <= 1 && Math.abs(creep.y - spawn.y) <= 1;
  }

  async function tick() {
    await server.tick();
    roomObjectsLastTick = roomObjects;
    roomObjects = await world.roomObjects(room);
  }

  function getDelta(operator: (roomObjects: DBRoomObject[]) => any): any[] {
    return [operator(roomObjectsLastTick), operator(roomObjects)];
  }

  beforeEach(async () => {
    server = new ScreepsServer();
    await server.world.reset();
    ({ world } = server);
    await commonRoomInitialization();
    user = await addUser();
    await server.start();
    roomObjects = await world.roomObjects(room);
    roomObjectsLastTick = roomObjects;
  });

  afterEach(async () => {
    if (isFunction(server.stop)) {
      await server.stop();
    }
    await removeAsync(resolve("server")).catch(console.error);
  });

  beforeAll(() => {
    const stderr = console.error;
    console.error = function(...args: any[]) {
      if (args[0].match && args[0].match(/storage connection lost/i)) {
        return 0;
      }
      return stderr.apply(this, args);
    };
  });

  it("should spawn a harvester first", async () => {
    let firstCreepName: string | undefined;
    const getFirstCreepEnergy = (objects: DBRoomObject[]) =>
      getCreepEnergy(firstCreepName || "", objects);
    let energyWasHarvested = false;
    const ticksTimeout = 30;
    for (let i = 0; i < ticksTimeout; i++) {
      await tick();
      if (!firstCreepName) {
        const creep = find(roomObjects, { type: "creep" }) as any;
        if (creep) {
          firstCreepName = creep.name;
        }
      } else {
        const creepEnergy = getDelta(getFirstCreepEnergy);
        const sourceEnergy = getDelta(getSourceEnergy);
        const creepIsNextToSource = getIsCreepNextToSource(
          firstCreepName,
          roomObjects
        );
        const creepEnergyIncreased = creepEnergy[1] > creepEnergy[0];
        const sourceEnergyDecreased = sourceEnergy[1] < sourceEnergy[0];
        if (
          creepIsNextToSource &&
          creepEnergyIncreased &&
          sourceEnergyDecreased
        ) {
          energyWasHarvested = true;
          break;
        }
      }
    }
    expect(energyWasHarvested).toBe(true);
  });

  it("should deposit energy to spawn", async () => {
    let energyWasDeposited = false;
    const ticksTimeout = 60;
    for (let i = 0; i < ticksTimeout; i++) {
      await tick();
      const spawnEnergy = getDelta(getSpawnEnergy);
      if (spawnEnergy[1] - spawnEnergy[0] > 1) {
        energyWasDeposited = true;
        break;
      }
    }
    expect(energyWasDeposited).toBe(true);
  });

  it("should separate harvester and depositor", async () => {
    let energyWasDepositedByNonHarvester = false;
    const ticksTimeout = 100;
    for (let i = 0; i < ticksTimeout; i++) {
      await tick();
      const spawnEnergy = getDelta(getSpawnEnergy);
      if (spawnEnergy[1] - spawnEnergy[0] > 1) {
        const creeps = filter(roomObjects, {
          type: "creep"
        }) as any[];
        if (creeps.length >= 2) {
          const creepA = creeps[0].name;
          const creepB = creeps[1].name;
          const successCase1 =
            getIsCreepNextToSource(creepA) && getIsCreepNextToSpawn(creepB);
          const successCase2 =
            getIsCreepNextToSource(creepB) && getIsCreepNextToSpawn(creepA);
          if (successCase1 || successCase2) {
            energyWasDepositedByNonHarvester = true;
            break;
          }
        }
      }
    }
    expect(energyWasDepositedByNonHarvester).toBe(true);
  });

  it("should upgrade controller", async () => {
    let controllerWasUpgraded = false;
    const ticksTimeout = 300;
    for (let i = 0; i < ticksTimeout; i++) {
      await tick();
      const controllerEnergy = getDelta(getControllerProgress);
      if (controllerEnergy[1] > controllerEnergy[0]) {
        controllerWasUpgraded = true;
        break;
      }
    }
    expect(controllerWasUpgraded).toBe(true);
  });
});

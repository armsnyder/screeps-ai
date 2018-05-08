import { readFileSync } from "fs";
import { removeAsync } from "fs-extra-promise";
import { filter, find, isFunction, keys, size } from "lodash";
import { resolve } from "path";
import { ScreepsServer, TerrainMatrix } from "screeps-server-mockup";

describe("integration tests", () => {
  let server: typeof ScreepsServer;
  let user: any;
  let db: any;
  let world: any;
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

  async function getRoomObjects() {
    return world.roomObjects(room);
  }

  async function getSpawnEnergy() {
    return (find(await getRoomObjects(), { type: "spawn" }) as any).energy;
  }

  async function getSourceEnergy() {
    return (find(await getRoomObjects(), { type: "source" }) as any).energy;
  }

  async function getCreepEnergy(name: string) {
    return (find(await getRoomObjects(), { type: "creep", name }) as any)
      .energy;
  }

  async function countSpawnedCreeps() {
    return size(filter(await getRoomObjects(), { type: "creep" }));
  }

  async function getIsCreepNextToSource(name: string) {
    const roomObjects = await getRoomObjects();
    const creep = find(roomObjects, { type: "creep", name }) as any;
    if (!creep) {
      return null;
    }
    const source = find(roomObjects, { type: "source" }) as any;
    return (
      Math.abs(creep.x - source.x) <= 1 && Math.abs(creep.y - source.y) <= 1
    );
  }

  async function getIsCreepNextToSpawn(name: string) {
    const roomObjects = await getRoomObjects();
    const creep = find(roomObjects, { type: "creep", name }) as any;
    if (!creep) {
      return null;
    }
    const spawn = find(roomObjects, { type: "spawn" }) as any;
    return Math.abs(creep.x - spawn.x) <= 1 && Math.abs(creep.y - spawn.y) <= 1;
  }

  beforeEach(async () => {
    server = new ScreepsServer();
    await server.world.reset();
    ({ world } = server);
    ({ db } = await world.load());
    await commonRoomInitialization();
    user = await addUser();
    await server.start();
  });

  afterEach(async () => {
    if (isFunction(server.stop)) {
      await server.stop();
    }
    server = null;
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
    let firstCreepName;
    let sourceEnergyLastTick = await getSourceEnergy();
    let creepEnergyLastTick;
    let energyWasHarvested;
    const ticksTimeout = 15;
    for (let i = 0; i < ticksTimeout; i++) {
      await server.tick();
      const roomObjects = await getRoomObjects();
      if (!firstCreepName) {
        const creep = find(roomObjects, { type: "creep" }) as any;
        if (creep) {
          firstCreepName = creep.name;
          creepEnergyLastTick = await getCreepEnergy(firstCreepName);
        }
      } else {
        const sourceEnergyThisTick = await getSourceEnergy();
        const creepEnergyThisTick = await getCreepEnergy(firstCreepName);
        const creepIsNextToSource = await getIsCreepNextToSource(
          firstCreepName
        );
        const creepEnergyIncreased = creepEnergyThisTick > creepEnergyLastTick;
        const sourceEnergyDecreased =
          sourceEnergyThisTick < sourceEnergyLastTick;
        if (
          creepIsNextToSource &&
          creepEnergyIncreased &&
          sourceEnergyDecreased
        ) {
          energyWasHarvested = true;
          break;
        }
        sourceEnergyLastTick = sourceEnergyThisTick;
        creepEnergyLastTick = creepEnergyThisTick;
      }
    }
    expect(energyWasHarvested).toBe(true);
  });

  it("should deposit energy to spawn", async () => {
    let spawnEnergyLastTick = await getSpawnEnergy();
    let energyWasDeposited = false;
    const ticksTimeout = 20;
    for (let i = 0; i < ticksTimeout; i++) {
      await server.tick();
      const spawnEnergyThisTick = await getSpawnEnergy();
      if (spawnEnergyThisTick - spawnEnergyLastTick > 1) {
        energyWasDeposited = true;
        break;
      }
      spawnEnergyLastTick = spawnEnergyThisTick;
    }
    expect(energyWasDeposited).toBe(true);
  });

  it("should separate harvester and depositor", async () => {
    let spawnEnergyLastTick = await getSpawnEnergy();
    let energyWasDepositedByNonHarvester = false;
    const ticksTimeout = 20;
    for (let i = 0; i < ticksTimeout; i++) {
      await server.tick();
      const spawnEnergyThisTick = await getSpawnEnergy();
      if (spawnEnergyThisTick - spawnEnergyLastTick > 1) {
        const creeps = filter(await getRoomObjects(), {
          type: "creep"
        }) as any[];
        if (creeps.length >= 2) {
          const creepA = creeps[0].name;
          const creepB = creeps[1].name;
          const successCase1 =
            (await getIsCreepNextToSource(creepA)) &&
            (await getIsCreepNextToSpawn(creepB));
          const successCase2 =
            (await getIsCreepNextToSource(creepB)) &&
            (await getIsCreepNextToSpawn(creepA));
          if (successCase1 || successCase2) {
            energyWasDepositedByNonHarvester = true;
            break;
          }
        }
      }
      spawnEnergyLastTick = spawnEnergyThisTick;
    }
    expect(energyWasDepositedByNonHarvester).toBe(true);
  });
});

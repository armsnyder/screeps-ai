import FuelTransportMission from "./missions/FuelTransportMission";
import HarvestMission from "./missions/HarvestMission";
import MissionContext from "./missions/MissionContext";
import RoomCache from "./missions/RoomCache";
import Spawner from "./missions/Spawner";
import SpawnRequest from "./missions/SpawnRequest";
import UpgradeControllerMission from "./missions/UpgradeControllerMission";

declare global {
  interface Memory {
    missions: { [id: string]: any };
  }
}

function cleanMemory() {
  for (const name of _.keys(Memory.creeps)) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
    }
  }
}

export function loop() {
  cleanMemory();
  _.merge(Memory, { missions: {} });
  const missionContext = new MissionContext();
  missionContext.add(context => new HarvestMission(context, "harvest"));
  missionContext.add(context => new FuelTransportMission(context, "transport"));
  missionContext.add(
    context => new UpgradeControllerMission(context, "upgrade")
  );
  missionContext.run();
  new Spawner(missionContext).spawnNext();
}

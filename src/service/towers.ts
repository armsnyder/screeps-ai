export default function() {
  (_.values(Game.rooms) as Room[]).forEach(room => {
    const towers = room.find(FIND_STRUCTURES, {
      filter: s => s.structureType === STRUCTURE_TOWER
    }) as StructureTower[];
    towers.forEach(tower => {
      const target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
      tower.attack(target);
    });
  });
}

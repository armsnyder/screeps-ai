function hsvToRgb(h, s, v) {
  let r;
  let g;
  let b;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0:
      (r = v), (g = t), (b = p);
      break;
    case 1:
      (r = q), (g = v), (b = p);
      break;
    case 2:
      (r = p), (g = v), (b = t);
      break;
    case 3:
      (r = p), (g = q), (b = v);
      break;
    case 4:
      (r = t), (g = p), (b = v);
      break;
    case 5:
      (r = v), (g = p), (b = q);
      break;
  }

  const decToByte = dec => Math.round(dec * 255);

  return [decToByte(r), decToByte(g), decToByte(b)];
}

function hueToWebColor(hue) {
  const rgb = hsvToRgb(hue, 1, 1);
  return "#" + rgb.map(v => v.toString(16).padStart(2, "0")).join("");
}

function initMemory() {
  if (!Memory.creepColorizer) {
    Memory.creepColorizer = {};
  }
  if (!Memory.creepColorizer.creeps) {
    Memory.creepColorizer.creeps = {};
  }
}

export default function run() {
  initMemory();
  const creepCount = _.values(Game.creeps).length;
  if (creepCount !== Memory.creepColorizer.creeps.length) {
    Memory.creepColorizer.creeps = {};
    let i = 0;
    const hueStep = 1.0 / creepCount;
    _.values(Game.creeps).forEach(creep => {
      Memory.creepColorizer.creeps[creep.id] = hueToWebColor(hueStep * i);
      i++;
    });
  }
}

export function getColor(creep: Creep) {
  initMemory();
  return Memory.creepColorizer.creeps[creep.id] || "#ffffff";
}

export function getMoveOpts(creep: Creep): MoveToOpts {
  return {
    visualizePathStyle: {
      opacity: 0.5,
      stroke: getColor(creep),
      strokeWidth: 0.1
    }
  };
}

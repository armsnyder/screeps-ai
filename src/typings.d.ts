import { LoDashStatic } from "lodash";

declare global {
  interface CreepMemory {
    role?: string;
    generic?: boolean;
    reloading?: boolean;
    target?: string;
  }
  interface Game {
    cache: { [key: string]: any };
  }
}

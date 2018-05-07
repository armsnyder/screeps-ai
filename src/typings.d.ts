import { LoDashStatic } from "lodash";

declare global {
  interface CreepMemory {
    role?: string;
    nonBalanced?: boolean;
    reloading?: boolean;
    target?: string;
  }
}

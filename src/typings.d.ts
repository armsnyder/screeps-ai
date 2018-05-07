import { LoDashStatic } from "lodash";

declare global {
  const _: LoDashStatic;

  interface CreepMemory {
    role?: string;
    nonBalanced?: boolean;
    reloading?: boolean;
    target?: string;
  }
}

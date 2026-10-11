import { TriggerInterface } from "../interfaces/trigger.interface";

export const neverFired: TriggerInterface = {
  triggerSubscribe() {
    return () => {};
  },
};
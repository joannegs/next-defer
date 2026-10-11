import type { TriggerInterface } from "../interfaces/trigger.interface";
import { elementObservable } from "../utils/trigger";

export function hover(): TriggerInterface {
    return elementObservable((element, fire) => {
        const handleMouseEnter = () => {
            fire();
            element.removeEventListener('mouseenter', handleMouseEnter);
        }

        element.addEventListener('mouseenter', handleMouseEnter);
        return () => {
            element.removeEventListener('mouseenter', handleMouseEnter);
        }
    });
};
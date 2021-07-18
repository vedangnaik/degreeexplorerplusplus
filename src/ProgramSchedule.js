import { GlobalProgramScheduleID } from "./Constants";

export class ProgramSchedule extends HTMLDivElement {
    constructor() {
        super();
        this.id = GlobalProgramScheduleID;
    }

    getProgramScheduleJSON() {}

    loadProgramScheduleJSON(scheduleJSON) {}
}
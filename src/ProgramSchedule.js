import { GlobalProgramScheduleID } from "./Constants.js";
import { ProgramInfoCollapsible } from "./ProgramInfoCollapsible.js";

export class ProgramSchedule extends HTMLDivElement {
    constructor() {
        super();
        this.id = GlobalProgramScheduleID;
    }

    addProgram(programID) {
        this.appendChild(new ProgramInfoCollapsible(programID));
    }

    getProgramScheduleJSON() {
        let scheduledPrograms = [];
        for (const program of this.children) {
            scheduledPrograms.push(program.id);
        }
        return scheduledPrograms;
    }

    loadProgramScheduleJSON(scheduleJSON) {
        // First, delete all the courses here.
        for (const program of this.children) {
            program.deleteProgram();
        }
        // Then, add the ones listed in the JSON.
        for (const programID of scheduleJSON) {
            this.addProgram(programID);
        }
    }
}

customElements.define('depp-program-schedule', ProgramSchedule, {extends: 'div'});
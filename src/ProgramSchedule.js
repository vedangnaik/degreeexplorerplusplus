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

    resetPrograms() {
        for (const programInfoCollapsible of this.children) {
            programInfoCollapsible.resetProgram();
        }
    }

    getProgramScheduleJSON() {
        let scheduledPrograms = [];
        for (const program of this.children) {
            scheduledPrograms.push(program.id);
        }
        return scheduledPrograms;
    }

    loadProgramScheduleJSON(scheduleJSON) {
        // First, delete all the courses here. We go backwards to avoid i skipping elements.
        for (let i = this.children.length - 1; i >= 0; i--) {
            this.children[i].deleteProgram();
        }
        // Then, add the ones listed in the JSON.
        for (const programID of scheduleJSON) {
            this.addProgram(programID);
        }
    }
}

customElements.define('depp-program-schedule', ProgramSchedule, {extends: 'div'});
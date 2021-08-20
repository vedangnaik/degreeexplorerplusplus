import { GLOBAL_PROGRAM_SCHEDULE_ID } from "../Constants.js";
import { ProgramInfoCollapsible } from "./ProgramInfoCollapsible.js";

export class ProgramSchedule extends HTMLDivElement {
    #programDiv;

    constructor() {
        super();
        this.id = GLOBAL_PROGRAM_SCHEDULE_ID;
        this.style.position = "relative";
            // This background div is present near the top of the program schedule. It's only visible when no programs are present, and serves as a sort of placeholder.
            const backgroundDiv = document.createElement("div");
            backgroundDiv.style = `
                position: absolute;
                z-index: -1;
                width: 100%;
                text-align: center;
            `;
            backgroundDiv.innerText = "You have no Programs"
        this.appendChild(backgroundDiv);
            this.#programDiv = document.createElement("div");
        this.appendChild(this.#programDiv);
    }

    addProgram(programID) {
        this.#programDiv.appendChild(new ProgramInfoCollapsible(programID));
    }

    resetPrograms() {
        for (const programInfoCollapsible of this.#programDiv.children) {
            programInfoCollapsible.resetProgram();
        }
    }

    getProgramScheduleJSON() {
        let scheduledPrograms = [];
        for (const programInfoCollapsible of this.#programDiv.children) {
            scheduledPrograms.push(programInfoCollapsible.id);
        }
        return scheduledPrograms;
    }

    loadProgramScheduleJSON(scheduleJSON) {
        // First, delete all the courses here. We go backwards to avoid i skipping elements.
        for (let i = this.#programDiv.children.length - 1; i >= 0; i--) {
            this.#programDiv.children[i].deleteProgram();
        }
        // Then, add the ones listed in the JSON.
        for (const programID of scheduleJSON) {
            this.addProgram(programID);
        }
    }
}

customElements.define('depp-program-schedule', ProgramSchedule, {extends: 'div'});
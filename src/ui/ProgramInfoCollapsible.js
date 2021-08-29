import { INCOMPLETE_COLOR, COMPLETE_COLOR, UNVERIFIABLE_COLOR, COMPLETE_SYMBOL as COMPLETE_SYMBOL, INCOMPLETE_SYMBOL as INCOMPLETE_SYMBOL, NOTE_SYMBOL, UNVERIFIABLE_SYMBOL, DELETE_SYMBOL, DELETE_COLOR, STATUSES, NOT_USED_SYMBOL, NOT_USED_COLOR, NOT_EVALUATED_COLOR, UNIMPLEMENTED_SYMBOL, UNIMPLEMENTED_BACKGROUND} from "../Constants.js";
import { Spacer } from "./Spacer.js";
import { evaluateProgramRequirement } from "../evaluators/exports.js";
import { ProgramData } from "../../resources/exports.js";


export class ProgramInfoCollapsible extends HTMLDivElement {
    // This is the CSS stylesheet for the table in this element. It's implemented as CSS since it's much easier to style the various td and th like this. However, the actual style element cannot be created here since otherwise it would be duplicated. Hence, it's appended to the head of the document from here.
    static PICStylesheetText = `
        .PICTable {
            border-collapse: collapse;
            width: 57vw;
        }

        .PICTable thead tr, .PICTable tbody tr:not(:last-child) { 
            border-bottom: 1px solid grey; 
        }
        .PICTable td:not(:last-child), .PICTable th:not(:last-child) { 
            border-right: 1px solid grey;
        }

        .PICTable td, .PICTable th {
            padding: 5px 10px;
            text-align: center;
        }

        .PICTable td:first-child, .PICTable th:first-child {
            width: 7vw;
        }
        .PICTable td:nth-child(3) {
            text-align: left;
        }
        .PICTable th:nth-child(4), .PICTable td:nth-child(4) {
            width: 10vw;
        }
    `;

    #requirementRows = {};

    constructor(programID) {
        super();

        this.id = programID;
        this.style = `
            width: 57vw;
            display: flex;
            flex-direction: column;
        `;
        this.customTagName = "program-info-collapsible" // Used to easily filter for these divs
            // This is the visible header part of the collapsible. When this is clicked, the body is toggled into appearing/disappearing.
            this.collapsibleHeaderDiv = document.createElement('div');
            this.collapsibleHeaderDiv.style = `
                width: 57vw;
                height: 1.5vw;
                display: flex;
                outline: 1px solid grey;
                background-color: ${NOT_EVALUATED_COLOR};
            `;
            this.collapsibleHeaderDiv.onclick = this.#toggleCollapsible.bind(this);
                this.collapsibleStatusH3 = document.createElement('h3');
                this.collapsibleStatusH3.innerText = '▼';
                this.collapsibleStatusH3.style = `
                    margin: auto;
                    padding: 0 10px;
                `;
            this.collapsibleHeaderDiv.appendChild(this.collapsibleStatusH3);
                const programNameH3 = document.createElement('h3');
                programNameH3.innerText = `${programID}: ${ProgramData[programID]['title']}`;
                programNameH3.style = `
                    margin: auto;
                    flex: 1;
                `;
            this.collapsibleHeaderDiv.appendChild(programNameH3);
                const deleteProgramButton = document.createElement('button');
                deleteProgramButton.innerText = DELETE_SYMBOL;
                deleteProgramButton.style = `
                    width: 1vw;
                    background-color: ${DELETE_COLOR};
                `;
                deleteProgramButton.onclick = this.deleteProgram.bind(this);
            this.collapsibleHeaderDiv.appendChild(deleteProgramButton);
        this.appendChild(this.collapsibleHeaderDiv);
            // This is the body of the collapsible. It mainly contains the table which enumerates the requirements for the program.
            this.collapsibleBodyDiv = document.createElement('div');
            this.collapsibleBodyDiv.style = `
                width: 57vw;
                display: none;
                outline: 1px solid grey;
            `;
                const requirementsTable = document.createElement('table');
                requirementsTable.className = "PICTable" // This is for the stylesheet below
                    // The thead contains the headings for the table
                    const thead = document.createElement('thead');
                        let tr = document.createElement('tr');
                        tr.style.backgroundColor = "grey";
                            let th = document.createElement('th');
                            th.innerText = "Status";
                        tr.appendChild(th);
                            th = document.createElement('th');
                            th.innerText = "ID";
                        tr.appendChild(th);
                            th = document.createElement('th');
                            th.innerText = "Description";
                        tr.appendChild(th);
                            th = document.createElement('th');
                            th.innerText = "Courses Used";
                        tr.appendChild(th);
                            th = document.createElement('th');
                            th.innerText = "Credits";
                        tr.appendChild(th);
                    thead.appendChild(tr);
                requirementsTable.appendChild(thead);
                    const tbody = document.createElement('tbody');
                    // For each requirement in ProgramData, we create a row with it's ID, description, and set the courses used and credits to N/A to start. These fields will be filled, and the row coloured in, when this program is evaluated. The obj #requirementRows will map the IDs to the rows for each access.
                    Object.entries(ProgramData[this.id]["detailAssessments"]).forEach(([reqID, requirement]) => {
                        tr = document.createElement('tr');
                        this.#requirementRows[reqID] = tr;
                            let td = document.createElement('td');
                        tr.appendChild(td);
                            td = document.createElement('td');
                            td.innerText = reqID;
                        tr.appendChild(td);
                            td = document.createElement('td');
                            td.innerText = requirement["description"];
                        tr.appendChild(td);
                            td = document.createElement('td');
                        tr.appendChild(td);
                            td = document.createElement('td');
                        tr.appendChild(td);
                        tbody.appendChild(tr);
                    });
                requirementsTable.appendChild(tbody);
            this.collapsibleBodyDiv.appendChild(requirementsTable);
        this.appendChild(this.collapsibleBodyDiv);
            // This is to give some space between this course and the next. It's a little crude, but it works OK. This was originally going to be handled by ProgramSchedule, but deletion becomes an issue.
            const spacer = new Spacer({"height": "1vw"});
        this.appendChild(spacer);
    }

    #toggleCollapsible() {
        if (this.collapsibleBodyDiv.style.display === "none") {
            this.collapsibleBodyDiv.style.display = "block";
            this.collapsibleStatusH3.innerText = '▲';
        } else {
            this.collapsibleBodyDiv.style.display = "none";
            this.collapsibleStatusH3.innerText = '▼';
        }
    }

    deleteProgram() {
        this.parentElement.removeChild(this);
    }

    // Sets all the rows back to the default color, clear the Status, Courses Used, and Credits columns, reset the background color of the header, and clear the evaluatedRequirements object.
    resetProgram() {
        for (const row of Object.values(this.#requirementRows)) {
            row.style.background = "revert";
            row.style.backgroundColor = "revert";
            row.children[0].innerText = '';
            row.children[3].innerText = '';
            row.children[4].innerText = '';
        }
        this.collapsibleHeaderDiv.style.backgroundColor = NOT_EVALUATED_COLOR;
    }

    evaluateRequirements(scheduledCourses) {
        // Yeah, don't ask why it's called this.
        let evaluatedRequirements = {};
        Object.keys(ProgramData[this.id]["detailAssessments"]).forEach(reqID => {
            if (!(reqID in evaluatedRequirements)) {
                evaluateProgramRequirement(this.id, reqID, scheduledCourses, evaluatedRequirements);
            }
        });

        // Flags used to decide the header's color. If any failure is detected, it's red. If there are no failures but some warnings/unimplemented reqs, it's yellow. Otherwise, it's green.
        let incomplete = false;
        let warning = false;
        let unimplemented = false;

        for (const reqID in this.#requirementRows) {
            // reqID is guaranteed to be in this object so we don't have to check.
            const row = this.#requirementRows[reqID];
            // We show the used courses regardless of the status since even for a failure, they'll help the user decide how to fix it.
            const usedCourses = evaluatedRequirements[reqID]["usedCourses"];
            row.children[3].innerText += (row.children[3].innerText === "" ? "" : "\n\n");
            row.children[3].innerText = `${usedCourses.join(', ')}`.trim();
            // We assign different styles and other stuff based on the status here.
            const status = evaluatedRequirements[reqID]["status"];
            switch (status) {
                case STATUSES.COMPLETE:
                    row.children[0].innerText = `${COMPLETE_SYMBOL} Complete`;
                    row.style.backgroundColor = COMPLETE_COLOR;
                    row.children[4].innerText = usedCourses
                        .map(courseID => courseID[6] === 'H' ? 0.5 : 1.0)
                        .reduce((x, y) => x + y, 0.0)
                        .toFixed(2);
                    break;
                case STATUSES.INCOMPLETE:
                    incomplete = true;
                    row.children[0].innerText = `${INCOMPLETE_SYMBOL} Incomplete`;
                    row.style.backgroundColor = INCOMPLETE_COLOR;
                    break;
                case STATUSES.NA:
                    row.children[0].innerText = `${NOT_USED_SYMBOL} Not Used`;
                    row.style.backgroundColor = NOT_USED_COLOR;
                    break;
                case STATUSES.UNVERIFIABLE:
                    warning = true;
                    row.children[0].innerText = `${UNVERIFIABLE_SYMBOL} Unverifiable`;
                    row.style.backgroundColor = UNVERIFIABLE_COLOR;
                    row.children[4].innerText = usedCourses
                        .map(courseID => courseID[6] === 'H' ? 0.5 : 1.0)
                        .reduce((x, y) => x + y, 0.0)
                        .toFixed(2);
                    break;
                case STATUSES.NOTE:
                    row.children[0].innerText = `${NOTE_SYMBOL} Note`;
                    break;
                case STATUSES.UNIMPLEMENTED:
                    unimplemented = true;
                    row.children[0].innerText = `${UNIMPLEMENTED_SYMBOL} Unimplemented`;
                    row.style.background = UNIMPLEMENTED_BACKGROUND;
                    break;
            }
        }

        if (incomplete) {
            this.collapsibleHeaderDiv.style.backgroundColor = INCOMPLETE_COLOR;
        } else if (warning) {
            this.collapsibleHeaderDiv.style.backgroundColor = UNVERIFIABLE_COLOR;
        } else if (unimplemented) {
            this.collapsibleHeaderDiv.style.background = UNIMPLEMENTED_BACKGROUND;
        } else {
            this.collapsibleHeaderDiv.style.backgroundColor = COMPLETE_COLOR;
        }
    }
}

// Append the styles to the head
const styleElem = document.createElement('style');
styleElem.innerText = ProgramInfoCollapsible.PICStylesheetText;
document.head.appendChild(styleElem);

customElements.define('depp-program-info-collapsible', ProgramInfoCollapsible, {extends: 'div'});
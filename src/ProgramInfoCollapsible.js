import ProgramData from "../resources/ProgramData.js";
import { INCOMPLETE_COLOR, COMPLETE_COLOR, WARNING_COLOR, COMPELTE_SYMBOL, INCOMPELTE_SYMBOL, NOTE_SYMBOL, WARNING_SYMBOL, DELETE_SYMBOL, DELETE_COLOR, STATUSES} from "./Constants.js";
import { Spacer } from "./Spacer.js";

export class ProgramInfoCollapsible extends HTMLDivElement {
    static #COLLAPSIBLE_HEADER_DEFAULT_COLOR = "lightgrey";

    #evaluatedRequirements = {};
    #requirementRows = {};

    constructor(programID) {
        super();

        this.id = programID;
        this.style = `
            width: 57vw;
            display: flex;
            flex-direction: column;
        `;
            // This is the visible header part of the collapsible. When this is clicked, the body is toggled into appearing/disappearing.
            this.collapsibleHeaderDiv = document.createElement('div');
            this.collapsibleHeaderDiv.style = `
                width: 57vw;
                height: 1.5vw;
                display: flex;
                outline: 1px solid grey;
                background-color: ${ProgramInfoCollapsible.#COLLAPSIBLE_HEADER_DEFAULT_COLOR};
            `;
            this.collapsibleHeaderDiv.onclick = this.#toggleCollapsible.bind(this);
                this.collapsibleStatusH2 = document.createElement('h3');
                this.collapsibleStatusH2.innerText = '▼';
                this.collapsibleStatusH2.style = `
                    margin: auto;
                    padding: 0 10px;
                `;
            this.collapsibleHeaderDiv.appendChild(this.collapsibleStatusH2);
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
                requirementsTable.id = "reqTable" // This is for the stylesheet below
                    // The thead contains the headings for the table
                    const thead = document.createElement('thead');
                        let tr = document.createElement('tr');
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
            // This style element is used to add the inner border style as well some fixed width columns and font size stuff.
            const styleElem = document.createElement('style');
            styleElem.innerText = `
                #reqTable {
                    table-layout: auto;
                    border-collapse: collapse;
                    width: 57vw;
                }

                #reqTable thead tr, #reqTable tbody tr:not(:last-child) { 
                    border-bottom: 1px solid grey; 
                }
                #reqTable td:not(:last-child), #reqTable th:not(:last-child) { 
                    border-right: 1px solid grey;
                }

                #reqTable td, #reqTable th {
                    padding: 5px 10px;
                }
                #reqTable td:first-child, #reqTable th:first-child {
                    text-align: center;
                    width: 8vw;
                }

                #reqTable th:nth-of-type(4), #reqTable td:nth-of-type(4) {
                    width: 10vw;
                }
            `;
        this.appendChild(styleElem);
    }

    #toggleCollapsible() {
        if (this.collapsibleBodyDiv.style.display === "none") {
            this.collapsibleBodyDiv.style.display = "block";
            this.collapsibleStatusH2.innerText = '▲';
        } else {
            this.collapsibleBodyDiv.style.display = "none";
            this.collapsibleStatusH2.innerText = '▼';
        }
    }

    deleteProgram() {
        this.parentElement.removeChild(this);
    }

    // Sets all the rows back to the default color, clear the Status, Courses Used, and Credits columns, and reset the background color of the header.
    resetProgram() {
        for (const row of Object.values(this.#requirementRows)) {
            row.style.backgroundColor = "revert";
            row.children[0].innerText = '';
            row.children[3].innerText = '';
            row.children[4].innerText = '';
        }
        this.collapsibleHeaderDiv.style.backgroundColor = ProgramInfoCollapsible.#COLLAPSIBLE_HEADER_DEFAULT_COLOR;
    }

    evaluateRequirements(courses, programs) {
        // Yeah, don't ask why it's called this.
        Object.keys(ProgramData[this.id]["detailAssessments"]).forEach(reqID => {
            if (!(reqID in this.#evaluatedRequirements)) {1
                recursiveEvaluateRequirements(this.id, reqID, courses, programs, this.#evaluatedRequirements);
            }
        });

        let incomplete = false;
        let warning = false;

        for (const reqID in this.#requirementRows) {
            // reqID is gauranteed to be in this object so we don't have to check.
            const row = this.#requirementRows[reqID];
            const status = this.#evaluatedRequirements[reqID].status;
            const usedCourses = this.#evaluatedRequirements[reqID].usedCourses;
            switch (status) {
            case STATUSES.COMPLETE:
                row.children[0].innerText = `${COMPELTE_SYMBOL} Complete`;
                row.style.backgroundColor = COMPLETE_COLOR;
                row.children[3].innerText = `${usedCourses.join(', ')}`.trim();
                break;

            case STATUSES.INCOMPLETE:
                incomplete = true;
                row.children[0].innerText = `${INCOMPELTE_SYMBOL} Incomplete`;
                row.style.backgroundColor = INCOMPLETE_COLOR;
                break;

            case STATUSES.NA:
                row.children[0].innerText = `${NOTE_SYMBOL} Note`;
                break;

            case STATUSES.WARNING:
                warning = true;
                row.children[0].innerText = `${WARNING_SYMBOL} Warning`;
                row.style.backgroundColor = WARNING_COLOR;
                row.children[3].innerText = `${usedCourses.join(', ')}`.trim();
                break;
            }
        }

        if (incomplete) {
            this.collapsibleHeaderDiv.style.backgroundColor = INCOMPLETE_COLOR;
        } else if (warning) {
            this.collapsibleHeaderDiv.style.backgroundColor = WARNING_COLOR;
        } else {
            this.collapsibleHeaderDiv.style.backgroundColor = COMPLETE_COLOR;
        }



        function recursiveEvaluateRequirements(programID, reqID, scheduledCourses, scheduledPrograms, evaluatedRequirements) {
            // Quick exit case: this ID has already been evaluated, so there's no need to do it again.
            if (reqID in evaluatedRequirements) {
                return;
            }

            const requirementObj = ProgramData[programID].detailAssessments[reqID];

            if (requirementObj.type == "NOTE") {
                evaluatedRequirements[reqID] = {
                    "status": STATUSES.NA,
                    "usedCourses": []
                };
                return;
            }

            if (requirementObj.requisiteItems[0].includes('Req')) {
                switch (requirementObj.type) {
                // At least 1 requirement is needed. It's assumed to be 1 because count is not specified for this field anywhere.
                case "MINIMUM":
                    let usedPrereqs = [];
                    let count = 0;
                    for (const dependent_reqID of requirementObj.requisiteItems) {
                        // Evaluate the dependent reqID and check if it's acceptable
                        recursiveEvaluateRequirements(programID, dependent_reqID, scheduledCourses, scheduledPrograms, evaluatedRequirements);
                        if (evaluatedRequirements[dependent_reqID].status !== STATUSES.INCOMPLETE) {
                            usedPrereqs.push(dependent_reqID);
                            count += 1;
                        }

                        if (1 <= count) {
                            // We must mark all the unused prerequisites as NA to indicate to the user which ones were used.
                            requirementObj.requisiteItems
                                .filter(dependent_reqID => !usedPrereqs.includes(dependent_reqID))
                                .forEach(dependent_reqID => evaluatedRequirements[dependent_reqID] = {
                                    "status": STATUSES.NA,
                                    "usedCourses": []
                                });
                            
                                evaluatedRequirements[reqID] = {
                                "status": STATUSES.COMPLETE,
                                // We concat all the usedCourses of each used requirements. Right now it's only one, but this is in case the format changes in the future. 
                                "usedCourses": usedPrereqs
                                    .map(reqID => evaluatedRequirements[reqID].usedCourses)
                                    .reduce((acc, curr) => acc.concat(curr), [])
                            }
                            return;
                        }
                    }
                    evaluatedRequirements[reqID] = {
                        "status": STATUSES.INCOMPLETE,
                        "usedCourses": []
                    }
                    return;
                // case "REUSE":
                //     return;
                // case "NO_REUSE":
                //     return;
                default:
                    console.log(`${programID}, ${reqID}: Unknown recursive type: ${requirementObj.type}`);
                    evaluatedRequirements[reqID] = {
                        "status": STATUSES.INCOMPLETE,
                        "usedCourses": []
                    }
                    return;
                }
            } else {
                switch (requirementObj.type) {
                case "LIST":                    
                    evaluatedRequirements[reqID] = (requirementObj.requisiteItems
                        .filter(dependent_courseID => !(dependent_courseID in scheduledCourses))
                        .length === 0) ? 
                    {
                        "status":  STATUSES.COMPLETE,
                        "usedCourses": requirementObj.requisiteItems
                    } : 
                    {
                        "status": STATUSES.INCOMPLETE,
                        "usedCourses": []
                    }
                    return;
                // case "MINIMUM":
                //     return;
                // case "GROUPMAXIMUM":
                //     return;
                default:
                    console.log(`${programID}, ${reqID}: Unknown normal type: ${requirementObj.type}`);
                    evaluatedRequirements[reqID] = {
                        "status": STATUSES.INCOMPLETE,
                        "usedCourses": []
                    }
                    return;
                }
            }
        }
    }
}

customElements.define('depp-program-info-collapsible', ProgramInfoCollapsible, {extends: 'div'});
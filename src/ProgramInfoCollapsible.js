import ProgramData from "../resources/ProgramData.js";
import { INCOMPLETE_COLOR, COMPLETE_COLOR, WARNING_COLOR, COMPELTE_SYMBOL, INCOMPELTE_SYMBOL, NOTE_SYMBOL, WARNING_SYMBOL } from "./Constants.js";
import { Spacer } from "./Spacer.js";

export const RequirementStatuses = Object.freeze({
    COMPLETE: Symbol("COMPLETE"),
    INCOMPLETE: Symbol("INCOMPLETE"),
    NA: Symbol("NA"),
    WARNING: Symbol("WARNING")
});

export class ProgramInfoCollapsible extends HTMLDivElement {


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
                display: flex;
                outline: 1px solid grey;
                background-color: lightgrey;
            `;
            this.collapsibleHeaderDiv.onclick = this.#toggleCollapsible.bind(this);
                const programNameP = document.createElement('p');
                programNameP.innerText = `${programID}: ${ProgramData[programID]['title']}`;
                programNameP.style = `
                    flex: 1;
                `;
            this.collapsibleHeaderDiv.appendChild(programNameP);
                const deleteProgramButton = document.createElement('button');
                deleteProgramButton.innerText = "Delete PoST";
                deleteProgramButton.onclick = this.deleteProgram.bind(this);
            this.collapsibleHeaderDiv.appendChild(deleteProgramButton);
        this.appendChild(this.collapsibleHeaderDiv);
            // This is the body of the collapsible. It mainly contains the table which enumerates the requirements for the program.
            this.collapsibleBodyDiv = document.createElement('div');
            this.collapsibleBodyDiv.style = `
                width: 57vw;
                display: none;
                outline: 1px solid grey;
                padding: 0vw;
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
                    border-bottom: 1px solid black; 
                }
                #reqTable td:not(:last-child), #reqTable th:not(:last-child) { 
                    border-right: 1px solid black;
                }

                #reqTable td, #reqTable th {
                    padding: 5px 10px;
                }
                #reqTable td:first-child, #reqTable th:first-child {
                    text-align: center;
                    width: 6vw;
                }

                #reqTable th:nth-of-type(4), #reqTable td:nth-of-type(4) {
                    width: 10.5vw;
                }
            `;
        this.appendChild(styleElem);
    }

    #toggleCollapsible() {
        this.collapsibleBodyDiv.style.display = (this.collapsibleBodyDiv.style.display === "none") ? "block" : "none";
    }

    deleteProgram() {
        this.parentElement.removeChild(this);
    }

    // Sets all the rows back to the default color, clear the Status, Courses Used, and Credits columns.
    resetProgram() {
        for (const row of Object.values(this.#requirementRows)) {
            row.children[0].innerText = '';
            row.children[3].innerText = '';
            row.children[4].innerText = '';
        }
    }

    evaluateRequirements(courses, programs) {
        // Yeah, don't ask why it's called this.
        Object.keys(ProgramData[this.id]["detailAssessments"]).forEach(reqID => {
            if (!(reqID in this.#evaluatedRequirements)) {1
                recursiveEvaluateRequirements(this.id, reqID, courses, programs, this.#evaluatedRequirements);
            }
        });

        for (const reqID in this.#requirementRows) {
            const row = this.#requirementRows[reqID];
            if (reqID in this.#evaluatedRequirements) {
                const status = this.#evaluatedRequirements[reqID].status;
                const usedCourses = this.#evaluatedRequirements[reqID].usedCourses;
                switch (status) {
                case RequirementStatuses.COMPLETE:
                    row.children[0].innerText = `${COMPELTE_SYMBOL} Complete`;
                    row.style.backgroundColor = COMPLETE_COLOR;
                    row.children[3].innerText = `${usedCourses.join(', ')}`.trim();
                    break;

                case RequirementStatuses.INCOMPLETE:
                    row.children[0].innerText = `${INCOMPELTE_SYMBOL} Incomplete`;
                    row.style.backgroundColor = INCOMPLETE_COLOR;
                    break;

                case RequirementStatuses.NA:
                    row.children[0].innerText = `${NOTE_SYMBOL} Note`;
                    break;

                case RequirementStatuses.WARNING:
                    row.children[0].innerText = `${WARNING_SYMBOL} Warning`;
                    row.style.backgroundColor = WARNING_COLOR;
                    row.children[3].innerText = `${usedCourses.join(', ')}`.trim();
                    break;
                }
            } else {
                // Shouldn't happen.
            }
        }        

        function recursiveEvaluateRequirements(programID, reqID, scheduledCourses, scheduledPrograms, evaluatedRequirements) {
            // Quick exit case: this ID has already been evaluated, so there's no need to do it again.
            if (reqID in evaluatedRequirements) {
                return;
            }

            const requirementObj = ProgramData[programID].detailAssessments[reqID];

            if (requirementObj.type == "NOTE") {
                evaluatedRequirements[reqID] = {
                    "status": RequirementStatuses.NA,
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
                        if (evaluatedRequirements[dependent_reqID].status !== RequirementStatuses.INCOMPLETE) {
                            usedPrereqs.push(dependent_reqID);
                            count += 1;
                        }

                        if (1 <= count) {
                            // We must mark all the unused prerequisites as NA to indicate to the user which ones were used.
                            requirementObj.requisiteItems
                                .filter(dependent_reqID => !usedPrereqs.includes(dependent_reqID))
                                .forEach(dependent_reqID => evaluatedRequirements[dependent_reqID] = {
                                    "status": RequirementStatuses.NA,
                                    "usedCourses": []
                                });
                            
                                evaluatedRequirements[reqID] = {
                                "status": RequirementStatuses.COMPLETE,
                                // We concat all the usedCourses of each used requirements. Right now it's only one, but this is in case the format changes in the future. 
                                "usedCourses": usedPrereqs
                                    .map(reqID => evaluatedRequirements[reqID].usedCourses)
                                    .reduce((acc, curr) => acc.concat(curr), [])
                            }
                            return;
                        }
                    }
                    evaluatedRequirements[reqID] = {
                        "status": RequirementStatuses.INCOMPLETE,
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
                        "status": RequirementStatuses.INCOMPLETE,
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
                        "status":  RequirementStatuses.COMPLETE,
                        "usedCourses": requirementObj.requisiteItems
                    } : 
                    {
                        "status": RequirementStatuses.INCOMPLETE,
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
                        "status": RequirementStatuses.INCOMPLETE,
                        "usedCourses": []
                    }
                    return;
                }
            }
        }
    }
}

customElements.define('depp-program-info-collapsible', ProgramInfoCollapsible, {extends: 'div'});
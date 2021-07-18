import ProgramData from "../resources/ProgramData.js";
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
            display: flex;
            flex-direction: column;
        `;
            // This is the visible header part of the collapsible. When this is clicked, the body is toggled into appearing/disappearing.
            this.collapsibleHeaderDiv = document.createElement('div');
            this.collapsibleHeaderDiv.style = `
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
                display: block;
                outline: 1px solid grey;
                padding: 0.5vw;
            `;
                const requirementsTable = document.createElement('table');
                requirementsTable.style = `
                    width: 100%;
                    table-layout: auto;
                `;
                    // The thead contains the headings for the table
                    const thead = document.createElement('thead');
                        let tr = document.createElement('tr');
                            let th = document.createElement('th');
                            th.innerText = "Requirement ID";
                        tr.appendChild(th);
                            th = document.createElement('th');
                            th.innerText = "Description";
                        tr.appendChild(th);
                            th = document.createElement('th');
                            th.innerText = "Courses Used";
                        tr.appendChild(th);
                            th = document.createElement('th');
                            th.innerText = "Credits Completed";
                        tr.appendChild(th);
                    thead.appendChild(tr);
                requirementsTable.appendChild(thead);
                    const tbody = document.createElement('tbody');
                    // For each requirement in ProgramData, we create a row with it's ID, description, and set the courses used and credits to N/A to start. These fields will be filled, and the row coloured in, when this program is evaluated. The obj #requirementRows will map the IDs to the rows for each access.
                    Object.entries(ProgramData[this.id]["detailAssessments"]).forEach(([reqID, requirement]) => {
                        tr = document.createElement('tr');
                        this.#requirementRows[reqID] = tr;
                            let td = document.createElement('td');
                            td.innerText = reqID;
                        tr.appendChild(td);
                            td = document.createElement('td');
                            td.innerText = requirement["description"];
                        tr.appendChild(td);
                            td = document.createElement('td');
                            td.innerText = "N/A";
                        tr.appendChild(td);
                            td = document.createElement('td');
                            td.innerText = "N/A";
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
        this.collapsibleBodyDiv.style.display = (this.collapsibleBodyDiv.style.display === "none") ? "block" : "none";
    }

    deleteProgram() {
        this.parentElement.removeChild(this);
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
                    row.style.backgroundColor = "green";
                    row.children[2].innerText = `${usedCourses}`.trim();
                    break;

                case RequirementStatuses.INCOMPLETE:
                    row.style.backgroundColor = "red";
                    break;

                case RequirementStatuses.NA:
                    row.style.backgroundColor = "grey";
                    break;

                case RequirementStatuses.WARNING:
                    row.style.backgroundColor = "yellow";
                    row.children[2].innerText = `${usedCourses}`.trim();
                    break;
                }
            } else {
                row.style.backgroundColor = "lightgrey";
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
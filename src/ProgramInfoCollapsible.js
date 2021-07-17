import ProgramData from "../resources/ProgramData.js";

export const RequirementStatuses = Object.freeze({
    COMPLETE: Symbol("COMPLETE"),
    INCOMPLETE: Symbol("INCOMPLETE"),
    NA: Symbol("NA"),
    WARNING: Symbol("WARNING")
});

export class ProgramInfoCollapsible extends HTMLDivElement {
    #evaluatedRequirements = {};

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
                deleteProgramButton.onclick = this.#deleteProgram.bind(this);
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
                    // For each requirement in ProgramData, we create a row with it's ID, description, and set the courses used and credits to N/A to start. These fields will be filled, and the row coloured in, when this program is evaluated.
                    Object.entries(ProgramData[this.id]["detailAssessments"]).forEach(([reqID, requirement]) => {
                        tr = document.createElement('tr');
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
    }

    #toggleCollapsible() {
        this.collapsibleBodyDiv.style.display = (this.collapsibleBodyDiv.style.display === "none") ? "block" : "none";
    }

    #deleteProgram() {
        this.parentElement.removeChild(this);
    }

    evaluateRequirements(courses, programs) {
        // Yeah, don't ask why it's called this.
        Object.keys(ProgramData[this.id]["detailAssessments"]).forEach(reqID => {
            if (!(reqID in this.#evaluatedRequirements)) {
                recursiveEvaluateRequirements(this.programID, reqID, courses, programs, this.#evaluatedRequirements);
            }
        });


        function recursiveEvaluateRequirements(programID, reqID, scheduledCourses, scheduledPrograms, evaluatedRequirements) {
            // Quick exit case: this ID has already been evaluated, so there's no need to do it again.
            if (reqID in evaluatedRequirements) {
                return;
            }

            const requirementObj = ProgramData[programID].detailAssessments[reqID];

            if (requirementObj.type == "NOTE") {
                evaluatedRequirements[reqID] = RequirementStatuses.NA;
                return;
            }

            if (requirementObj.requisiteItems[0].includes('Req')) {
                switch (requirementObj.type) {
                    
                }
            } else {

            }
        
            if (requirement.requisiteItems[0].includes('Req')) {
                if (requirement.type == "MINIMUM") {
                    for (reqID of requirement.requisiteItems) {
                        let statusObj = recursiveEvaluateRequirements(requirements[reqID]);
                        if (statusObj.completed) {
                            return {
                                "completed": true,
                                "usedCourses": statusObj.usedCourses
                            }
                        };
                    }
        
                    return {
                        "completed": false,
                        "usedCourses": []
                    }
                }
                
                else if (requirement.type == "GROUPMAXIMUM") {
                    console.log("req groupmaximum");
                    console.log(requirement);
                } 
                
                else if (requirement.type == "LIST") {
                    console.log("req list");
                    console.log(requirement);
                }
            }
        
            else {
                if (requirement.type == "MINIMUM") {
                    let credits = 0;
                    let requiredCredits = requirement.requiredCredits;
                    let completed = false;
                    let usedCourses = [];
                    
                    for (let courseID of requirement.requisiteItems) {
                        if (credits == requiredCredits) { 
                            completed = true;
                            break;
                        }
                        
                        if (courseID in courses) {
                            credits += courseID[6] == 'H' ? 0.5 : 1.0;
                            usedCourses.push(courseID);
                        }
                    }
        
                    return {
                        "completed": completed,
                        "usedCourses": usedCourses
                    };
                }
                
                else if (requirement.type == "GROUPMAXIMUM") {
                    console.log("course groupmaximum");
                    console.log(requirement);
                } 
                
                else if (requirement.type == "LIST") {
                    let completed = true;
                    let usedCourses = [];
                    
                    for (let courseID of requirement.requisiteItems) {
                        if (courseID in courses) {
                            usedCourses.push(courseID);
                        } else {
                            completed = false;
                        }
                    }
        
                    return {
                        "completed": completed,
                        "usedCourses": usedCourses
                    };
                }
            }
        }
    }
}

customElements.define('depp-program-info-collapsible', ProgramInfoCollapsible, {extends: 'div'});
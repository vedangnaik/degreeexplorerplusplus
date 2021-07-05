import ProgramData from "../resources/ProgramData.js";

export class Program extends HTMLTableElement {
    static stylesheet = `
        width: 100%;    
    `

    constructor(programID) {
        super();

        this.programID = programID;
        this.style = Program.stylesheet;

        let thead = document.createElement('thead');
            let tr = document.createElement('tr');
                let requirementHeader = document.createElement('th');
                let descriptionHeader = document.createElement('th');
                let statusHeader = document.createElement('th');
                requirementHeader.innerText = "Requirement #";
                descriptionHeader.innerText = "Description";
                statusHeader.innerText = "Completion Status";
            tr.appendChild(requirementHeader);
            tr.appendChild(descriptionHeader);
            tr.appendChild(statusHeader);
        thead.appendChild(tr);
        this.appendChild(thead);

        this.tbody = document.createElement('tbody');
            for (let i in ProgramData[this.programID]["completion"]) {
                let requirement = ProgramData[this.programID]["completion"][i];
                let tr = document.createElement('tr');
                    let requirementNumberCell = document.createElement('td');
                    let descriptionCell = document.createElement('td');
                    let statusCell = document.createElement('td');
                    requirementNumberCell.innerText = i;
                    descriptionCell.innerText = requirement["description"];
                    statusCell.innerText = "Not Run";
                tr.appendChild(requirementNumberCell);
                tr.appendChild(descriptionCell);
                tr.appendChild(statusCell);
                this.tbody.appendChild(tr);
            }
        this.appendChild(this.tbody);
    }

    evaluateRequirements(courses) {
        let requirements = ProgramData[this.id]["detailAssessments"]; // Yeah, don't ask me why it's called this

        function recursiveEvaluateRequirements(requirement) {
            if (requirement.type == "NOTE") { 
                return {
                    "completed": true,
                    "usedCourses": []
                };
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

customElements.define('depp-program', Program, {extends: 'table'});


//     let colgroup = document.createElement('colgroup');
//         let col1 = document.createElement('col');
//         let col2 = document.createElement('col');
//         let col3 = document.createElement('col');
//         col1.style.width = "15%";
//         col2.style.width = "50%";
//         col3.style.width = "35%";
//     colgroup.appendChild(col1);
//     colgroup.appendChild(col2);
//     colgroup.appendChild(col3);
// thead.appendChild(colgroup);
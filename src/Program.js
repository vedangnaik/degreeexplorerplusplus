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
        for (let i in ProgramData[this.programID]["completion"]) {
            let requirement = ProgramData[this.programID]["completion"][i];
            let statusCell = this.tbody.children[i].children[2];
            statusCell.innerText = requirement["checker"](courses) ? "Completed" : "Failed"
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
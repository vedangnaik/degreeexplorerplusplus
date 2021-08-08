import { INCOMPLETE_COLOR, COMPLETE_COLOR, UNVERIFIABLE_COLOR, COMPELTE_SYMBOL as COMPLETE_SYMBOL, INCOMPELTE_SYMBOL as INCOMPLETE_SYMBOL, NOTE_SYMBOL, UNVERIFIABLE_SYMBOL, STATUSES, NOT_USED_SYMBOL, NOT_USED_COLOR, GLOBAL_COURSE_INFO_PANEL_ID, UNIMPLEMENTED_SYMBOL, UNIMPLEMENTED_BACKGROUND } from "../Constants.js";
import { CourseData } from "../../resources/__exports__.js";
import { Spacer } from "./Spacer.js";


export class CourseInfoPanel extends HTMLDivElement {
    #courseInfoDiv;
    #placeholderP;

    #courseTitleH2;
    #courseDescriptionP;

    #prerequisitesPanel;
    #corequisitesPanel;
    #exclusionsPanel;

    constructor() {
        super();
        this.id = GLOBAL_COURSE_INFO_PANEL_ID
        // The last three are required for the panel to expand and fit the height of the timetable.
        this.style = `
            border: 1px solid grey;
            width: 26vw;
            display: flex;
            overflow-y: scroll;
            padding: 1vw;
        `;
            // This div contains the actual panel.
            this.#courseInfoDiv = document.createElement('div');
            this.#courseInfoDiv.style = `
                width: 100%;
                display: none;
            `;
                this.#courseTitleH2 = document.createElement('h2');
                this.#courseTitleH2.style.textAlign = "center";
                this.#courseTitleH2.innerText = "Course ID";
            this.#courseInfoDiv.appendChild(this.#courseTitleH2);
                this.#courseDescriptionP = document.createElement('p');
                this.#courseDescriptionP.style.textAlign = "center";
                this.#courseDescriptionP.innerText = "Course Description";
            this.#courseInfoDiv.appendChild(this.#courseDescriptionP);
            this.#courseInfoDiv.appendChild(new Spacer({"height": "2vw"}));
                this.#prerequisitesPanel = new RequisitesPanel("PREREQUISITES");
            this.#courseInfoDiv.appendChild(this.#prerequisitesPanel);
            this.#courseInfoDiv.appendChild(new Spacer({"height": "2vw"}));
                this.#corequisitesPanel = new RequisitesPanel("COREQUISITES");
            this.#courseInfoDiv.appendChild(this.#corequisitesPanel);
            this.#courseInfoDiv.appendChild(new Spacer({"height": "2vw"}));
                this.#exclusionsPanel = new RequisitesPanel("EXCLUSIONS");
            this.#courseInfoDiv.appendChild(this.#exclusionsPanel);
            this.#courseInfoDiv.appendChild(new Spacer({"height": "2vw"})); // This is just to prevent the last element from going into the padding if it scrolls. Kinda jank TODO fix this.
        this.appendChild(this.#courseInfoDiv);
            // This paragraph contains the placeholder text that appears when no course has been selected
            this.#placeholderP = document.createElement('p');
            this.#placeholderP.innerText = "Click a course to see stuff here";
            this.#placeholderP.style.margin = "auto";
        this.appendChild(this.#placeholderP);
    }

    printPrereqisiteInfo(courseID, prerequisitesTracker) {
        // Ensure contents are visible
        this.setContentsVisibility(true);
        // Set header and description from table
        this.#courseTitleH2.innerText = courseID;
        this.#courseDescriptionP.innerText = CourseData[courseID].title;
        // Reset panels
        this.#prerequisitesPanel.resetPanel();
        this.#corequisitesPanel.resetPanel();
        this.#exclusionsPanel.resetPanel();

        // This loop goes over prerequisite defined for the course, and then applies the color based on whether that prerequisite was evaluated in the passed-in argument. This is to allow courses which have not been evaluated yet to still show their prerequisite info.
        for (let prereqID in CourseData[courseID].prerequisites) {
            this.#prerequisitesPanel.addRequisite(prerequisitesTracker[prereqID], prereqID, CourseData[courseID].prerequisites[prereqID]["description"]);
        }

        // TODO: Corequisites and exclusions
    }

    setContentsVisibility(visible) {
        this.#courseInfoDiv.style.display = visible ? "revert" : "none";
        this.#placeholderP.style.display = visible ? "none" : "revert";
    }
}

/**
 * This class is a div which contains prerequisite, corerequisite, or exclusion info. It contains a table where each req can be inserted into a row. If there are no rows, the table is hidden and a <p> with a message is shown, similar to the InfoPanel itself. It also has a header element, for completion's sake. This can be styled as well.
 */
class RequisitesPanel extends HTMLDivElement {
    static RPStylesheetText = `
        .RPTable {
            border-collapse: collapse;
            width: 100%;
        }

        .RPTable td, .RPTable th {
            padding: 5px 10px;
            border: 1px solid grey;
        }

        .RPTable td:first-child, .RPTable th:first-child {
            text-align: center;
            width: 7vw;
        }

        .RPTable td:nth-child(2), .RPTable th:nth-child(2) {
            width: 2.5vw;
        }
    `;

    #requisiteH3;
    #placeholderP;
    #requisitesTable;
    #requisitesTBody;

    constructor(headerText) {
        super();
            this.#requisiteH3 = document.createElement('h3');
            this.#requisiteH3.innerText = headerText;
        this.appendChild(this.#requisiteH3);
        this.appendChild(new Spacer({"height": "0.25vw"}));
            this.#placeholderP = document.createElement('p');
            this.#placeholderP.innerText = `No ${headerText.toLowerCase()}`;
            this.#placeholderP.style = `
                text-align: center;
            `;
        this.appendChild(this.#placeholderP);
            this.#requisitesTable = document.createElement('table');
            this.#requisitesTable.style.display = "none"; // The table is hidden by default;
            this.#requisitesTable.className = "RPTable";
                let thead = document.createElement('thead');
                    let tr = document.createElement('tr')
                    tr.style = `
                        background-color: grey;
                    `
                        let th = document.createElement('th');
                        th.innerText = "Status";
                    tr.appendChild(th);
                        th = document.createElement('th');
                        th.innerText = "ID";
                    tr.appendChild(th);
                        th = document.createElement('th');
                        th.innerText = "Description";
                    tr.appendChild(th);
                thead.appendChild(tr);
            this.#requisitesTable.appendChild(thead);
                this.#requisitesTBody = document.createElement('tbody');
            this.#requisitesTable.appendChild(this.#requisitesTBody);
        this.appendChild(this.#requisitesTable);            
    }

    addRequisite(STATUS, id, description) {
        this.#requisitesTable.style.display = "revert";
        this.#placeholderP.style.display = "none";

        let tr = document.createElement('tr');
            let td = document.createElement('td');
            switch (STATUS) {
                case STATUSES.COMPLETE:
                    td.innerText = `${COMPLETE_SYMBOL} Complete`;
                    tr.style.backgroundColor = COMPLETE_COLOR;
                    break;
                case STATUSES.INCOMPLETE:
                    td.innerText = `${INCOMPLETE_SYMBOL} Incomplete`;
                    tr.style.backgroundColor = INCOMPLETE_COLOR; 
                    break;
                case STATUSES.NA:
                    td.innerText = `${NOT_USED_SYMBOL} Not Used`;
                    tr.style.backgroundColor = NOT_USED_COLOR;
                    break;
                case STATUSES.UNVERIFIABLE:
                    td.innerText = `${UNVERIFIABLE_SYMBOL} Unverifiable`;
                    tr.style.backgroundColor = UNVERIFIABLE_COLOR;
                    break;
                case STATUSES.NOTE:
                    td.innerText = `${NOTE_SYMBOL} Note`;
                    break;
                case STATUSES.UNIMPLEMENTED:
                    td.innerText = `${UNIMPLEMENTED_SYMBOL} Unimplemented`;
                    tr.style.background = UNIMPLEMENTED_BACKGROUND;
                    break;
            }
        tr.appendChild(td)
            td = document.createElement('td');
            td.innerText = id;
        tr.appendChild(td)
            td = document.createElement('td');
            td.innerText = description;
        tr.appendChild(td)
        this.#requisitesTBody.appendChild(tr);
    }

    resetPanel() {
        // Remove all children, then hide and table and make the placeholder visible.
        this.#requisitesTBody.replaceChildren();
        this.#requisitesTable.style.display = "none";
        this.#placeholderP.style.display = "revert";
    }
}

// Append the styles to the head - see the comment in ProgramInfoCollapsible.
const styleElem = document.createElement('style');
styleElem.innerText = RequisitesPanel.RPStylesheetText;
document.head.appendChild(styleElem);

customElements.define('depp-course-requisites-panel', RequisitesPanel, {extends: 'div'});
customElements.define('depp-course-info-panel', CourseInfoPanel, {extends: 'div'});
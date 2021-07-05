import { CourseSlotDiv } from "./CourseSlotDiv.js";
import { Spacer } from "./Spacer.js";
import { Scratchpad } from "./Scratchpad.js";
import { CourseTile } from "./CourseTile.js";
import CourseData from "../resources/CourseData.js";

export class Toolbar extends HTMLDivElement {
    constructor() {
        super();
        this.style = "width: 13vw; display: flex; flex-direction: column";

        this.searchInput = document.createElement('input');
        this.searchInput.style = "border: 1px solid black; border-radius: 5px;";
        let div = document.createElement('div');
        div.style = "display: flex"
            // Course slot to hold newly added course. The bottom slot is deleted to prevent confusion
            this.courseSlot = new CourseSlotDiv();
            this.courseSlot.removeChild(this.courseSlot.lowerSlot);
            
            this.searchButton = document.createElement('button');
            this.searchButton.innerText = "Add Courses & PoSTs";
            this.searchButton.onclick = this.searchCourse.bind(this);
            this.searchButton.style = "padding: 0.5vw; width: 4.5vw; font-size: 12px";
        div.appendChild(this.courseSlot);
        div.appendChild(new Spacer({ "width": "0.5vw" }));
        div.appendChild(this.searchButton);

        this.appendChild(this.searchInput);
        this.appendChild(new Spacer({ "height": "0.5vw" }));
        this.appendChild(div);
    }

    searchCourse() {
        const id = this.searchInput.value;
        if (CourseData[id]) {
            // Delete any existing tiles in the slot, then add the new child
            this.courseSlot.upperSlot.replaceChildren();
            this.courseSlot.upperSlot.appendChild(new CourseTile(id));
        } else {
            // Flash the slot red for a second to indicate an error
            // TODO: Maybe change this into a smooth fadein/fadeout
            this.courseSlot.style.backgroundColor = "#ff8080";
            setTimeout(() => {
               this.courseSlot.style.backgroundColor = "transparent"; 
            }, 1000);
        }
    }
}

customElements.define('depp-toolbar', Toolbar, {extends: 'div'});
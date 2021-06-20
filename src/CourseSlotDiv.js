export class CourseSlotDiv extends HTMLDivElement {
    static stylesheet = `
        width: 9vw;
        height: 5.5vw;
        display: flex;
        flex-direction: column;
        border: 1px solid black;
    `;

    constructor() {
        super();
        // Set up outer container
        this.style = CourseSlotDiv.stylesheet;
        // set up inner slots
        this.upperSlot = new CourseSlot();
        this.upperSlot.style.borderBottom = "1px dotted red;";
        this.lowerSlot = new CourseSlot();
        this.lowerSlot.style.borderTop = "1px dotted red";
        this.appendChild(this.upperSlot);
        this.appendChild(this.lowerSlot);
    }

    getSlotNumber(courseSlot) {
        if (this.upperSlot === courseSlot.parentElement) { return 0; }
        else if (this.lowerSlot === courseSlot.parentElement) { return 1; }
        else { return -1; }
    }
}


class CourseSlot extends HTMLDivElement {
    static stylesheet = `
        flex: 1;
    `;

    constructor() {
        super();
        this.style = CourseSlot.stylesheet;
        this.ondragover = this.onDragOver.bind(this);
        this.ondrop = this.onDrop.bind(this);
    }

    onDragOver(ev) {
        ev.preventDefault();
        ev.dataTransfer.dropEffect = "move";
    }

    onDrop(ev) {
        ev.preventDefault();
        const id = ev.dataTransfer.getData("id");
        const tileBeingDragged = document.getElementById(id);
        // If this slot already has a course tile in it then cancel the append.
        if (ev.currentTarget.children.length === 0) {
            ev.currentTarget.appendChild(tileBeingDragged);
        }
    }
}


customElements.define('depp-course-slot', CourseSlot, {extends: 'div'});
customElements.define('depp-course-slot-div', CourseSlotDiv, {extends: 'div'});
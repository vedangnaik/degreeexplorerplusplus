export class CourseSlotDiv extends HTMLDivElement {
    // Switching back to content-box is the best way I could think of to get the borders to play nicely while also keeping the size of the internal slots and the tile itself the same. 
    static stylesheet = `
        width: 8vw;
        height: 4vw;
        display: flex;
        flex-direction: column;
        outline: 1px solid white;
    `;

    constructor() {
        super();
        this.style = CourseSlotDiv.stylesheet;
            this.upperSlot = new CourseSlot();
            this.lowerSlot = new CourseSlot();
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
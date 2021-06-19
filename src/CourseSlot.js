export class CourseSlot extends HTMLDivElement {
    static stylesheet = `
        width: 8.1vmax; 
        height: 2.1vmax;
        border: 1px dotted red;
    `;

    constructor() {
        super();
        this.customTagName = "course-slot";
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
        const id = ev.dataTransfer.getData("text/plain");
        const element = document.getElementById(id);
        // If this slot already has a course tile in it then cancel the append.
        if (ev.currentTarget.children.length === 0) {
            ev.currentTarget.appendChild(element);
        }
    }
}

customElements.define('course-slot', CourseSlot, {extends: 'div'});
export function CreateCourseSlot() {
    let cs = document.createElement('div', {is: 'course-slot'});
    return cs;
}


class CourseSlot extends HTMLDivElement {
    static stylesheet = `
        width: 8.1vmax; 
        height: 4.1vmax;
        border: 1px dotted red;
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
        const id = ev.dataTransfer.getData("text/plain");
        const element = document.getElementById(id);
        ev.target.appendChild(element);
    }
}

customElements.define('course-slot', CourseSlot, {extends: 'div'});
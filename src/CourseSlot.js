export function CreateCourseSlot() {
    if (!customElements.get('course-slot')) {
        customElements.define('course-slot', CourseSlot, {extends: 'td'});
    }

    let cs = document.createElement('td', {is: 'course-slot'});
    return cs;
}


class CourseSlot extends HTMLTableCellElement {
    static stylesheet = `
        width: 8.6vmax; 
        height: 10.1vmin;
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

customElements.define('course-slot', CourseSlot, {extends: 'td'});
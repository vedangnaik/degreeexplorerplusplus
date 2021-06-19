export function CreateCourseSlot(courseID, courseName, courseDescription) {
    if (!customElements.get('course-slot')) {
        customElements.define('course-slot', CourseSlot, {extends: 'div'});
    }

    let cs = document.createElement('div', {is: 'course-slot'});
    cs.id = courseID;
    cs.cn.innerText = courseName;
    cs.cd.innerText = courseDescription;
    return cs;
}

class CourseSlot extends HTMLDivElement {
    static courseTileStylesheet = `
        width: 8.5vmax;
        height: 50px;
        border: 1px solid black;
    `;
    static courseNameStylesheet = `
        color: blue;
    `;
    static courseDescriptionSTyleSheet = `
        color: green;
    `;

    constructor() {
        super();
        this.style = CourseSlot.courseTileStylesheet;
        this.draggable = true;
        this.ondragstart = this.onDragStart;

        // course name header
        this.cn = document.createElement('h5');
        this.cn.style = CourseSlot.courseNameStylesheet;
        this.appendChild(this.cn);
        
        // course description paragraph
        this.cd = document.createElement('p');
        this.cd.style = CourseSlot.courseDescriptionSTyleSheet;
        this.appendChild(this.cd);
    }

    onDragStart(ev) {
        ev.dataTransfer.effectAllowed = "move";
        ev.dataTransfer.setData("text/plain", ev.target.id);
    }
}
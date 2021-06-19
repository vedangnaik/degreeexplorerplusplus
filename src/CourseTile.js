export function CreateCourseTile(courseID, courseName, courseDescription, courseLength) {
    if (!customElements.get('course-tile')) {
        customElements.define('course-tile', CourseTile, {extends: 'div'});
    }

    let ct = document.createElement('div', {is: 'course-tile'});
    ct.configure(courseID, courseName, courseDescription, courseLength);
    return ct;
}


class CourseTile extends HTMLDivElement {
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
        this.style = CourseTile.courseTileStylesheet;
        this.draggable = true;
        this.ondragstart = this.onDragStart.bind(this);

        // course name header
        this.cn = document.createElement('h5');
        this.cn.style = CourseTile.courseNameStylesheet;
        this.appendChild(this.cn);
        
        // course description paragraph
        this.cd = document.createElement('p');
        this.cd.style = CourseTile.courseDescriptionSTyleSheet;
        this.appendChild(this.cd);
    }

    onDragStart(ev) {
        ev.dataTransfer.effectAllowed = "move";
        ev.dataTransfer.setData("text/plain", ev.target.id);
    }

    configure(courseID, courseName, courseDescription, courseLength) {
        this.id = courseID;
        this.cn.innerText = courseName;
        this.cd.innerText = courseDescription;
        switch(courseLength) {
            case 'Y':
                this.style.height = "100px";
                break;
            case 'H':
                break;            
            default:
                console.log("Unsupported course length, defaulting to 'H'");
        }
    }
}
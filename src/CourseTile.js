export class CourseTile extends HTMLDivElement {
    static courseTileStylesheet = `
        width: 9vw;
        height: 2.75vw;
        border: 1px solid black;
        z-index: 1;
    `;
    static courseNameStylesheet = `
        color: blue;
    `;
    static courseDescriptionSTyleSheet = `
        color: green;
    `;

    constructor(courseID, courseName, courseDescription, courseLength) {
        super();
        this.id = courseID;
        this.customTagName = "course-tile"
        this.style = CourseTile.courseTileStylesheet;
        this.draggable = true;
        this.ondragstart = this.onDragStart.bind(this);

        // course name header
        this.cn = document.createElement('h5');
        this.cn.innerText = courseName;
        this.cn.style = CourseTile.courseNameStylesheet;
        this.appendChild(this.cn);
        
        // course description paragraph
        this.cd = document.createElement('p');
        this.cd.innerText = courseDescription;
        this.cd.style = CourseTile.courseDescriptionSTyleSheet;
        this.appendChild(this.cd);

        // change length is required
        this.courseLength = 'H';
        switch(courseLength) {
            case 'Y':
                this.style.height = "5.5vw";
                this.courseLength = 'Y';
                break;
            case 'H':
                break;            
            default:
                console.log("Unsupported course length, defaulting to 'H'");
        }
    }

    onDragStart(ev) {
        ev.dataTransfer.effectAllowed = "move";
        ev.dataTransfer.setData("id", this.id);
        // for anyone who needs the starting coords
        // mainly for the scratchpad tho
        ev.dataTransfer.setData("dragstartx", ev.offsetX);
        ev.dataTransfer.setData("dragstarty", ev.offsetY);
    }
}


customElements.define('depp-course-tile', CourseTile, {extends: 'div'});

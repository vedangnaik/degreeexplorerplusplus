export class CourseTile extends HTMLDivElement {
    static courseTileStylesheet = `
        width: 8.5vw;
        height: 2.25vw;
        border: 1px solid black;
        z-index: 1;
        display: flex;
    `;

    static courseNameStyleSheet = `
        flex: 1;
        margin: auto;
        text-align: center;
    `

    constructor(courseID, courseName, courseDescription, courseLength) {
        super();
        this.id = courseID;
        this.customTagName = "course-tile"
        this.style = CourseTile.courseTileStylesheet;
        this.draggable = true;
        this.ondragstart = this.onDragStart.bind(this);

        // course name header
        let cn = document.createElement('h3');
        cn.innerText = courseName
        cn.style = "flex: 1; margin: auto; text-align: center;"
        this.appendChild(cn);

        // div to force the course-delete button into the top right
        let rcd = document.createElement('div');
        rcd.style = "display: flex; flex-direction: column; justify-contents: flex-start;"
            // course delete button - just a small unicode X for the text
            // TODO style this properly
            this.deleteCourseButton = document.createElement('button');
            this.deleteCourseButton.innerText = '✖';
            this.deleteCourseButton.onclick = this.deleteCourse.bind(this);
        rcd.appendChild(this.deleteCourseButton);
        this.appendChild(rcd);

        // change the length if required
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
        // mainly for the scratchpad
        ev.dataTransfer.setData("dragstartx", ev.offsetX);
        ev.dataTransfer.setData("dragstarty", ev.offsetY);
    }

    deleteCourse() {
        // This appears to work but idk if it's legit or not
        this.parentElement.removeChild(this);
    }
}


customElements.define('depp-course-tile', CourseTile, {extends: 'div'});

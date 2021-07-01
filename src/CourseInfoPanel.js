export class CourseInfoPanel extends HTMLTableElement {
    static courseInfoPanelStylesheet = `
        background-color: lightgrey;
        border-radius: 5px;
        width: 23vw;
    `;

    constructor() {
        super();

        this.tbody = document.createElement('tbody');
        this.appendChild(this.tbody);
        this.style = CourseInfoPanel.courseInfoPanelStylesheet;

        // title cell
        this.titleCell = document.createElement('td');
        this.titleCell.colSpan = "2";
        this.titleCell.innerHTML = "CSC165H1: Mathematical Expression and Reasoning for Computer Science";
        this.tbody.appendChild(document.createElement('tr').appendChild(this.titleCell))

        // prereq rows
        let tr = document.createElement('tr')
            let prerequisiteHeader = document.createElement('td');
            prerequisiteHeader.innerText = "Prerequisites";
            prerequisiteHeader.style.writingMode = "vertical-lr";

            this.prerequisiteCell = document.createElement('td');
            this.prerequisiteCell.innerText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec et interdum libero. Ut in auctor dui, vel egestas velit. Etiam sodales fermentum hendrerit. Praesent eget neque efficitur, pulvinar purus ut, maximus arcu. Maecenas sit amet eleifend nunc, vitae blandit lectus. In hac habitasse platea dictumst. Nulla sed risus sed est luctus lacinia id quis dolor. Vestibulum tincidunt sem odio, ac molestie tortor ultricies ac. Mauris molestie lectus turpis, ut sodales dolor dictum sit amet. Ut semper fringilla accumsan. Duis quam justo, condimentum posuere porta vitae, tempor ac metus. Phasellus dolor risus, finibus sit amet urna a, blandit feugiat eros.";
        tr.appendChild(prerequisiteHeader);
        tr.appendChild(this.prerequisiteCell);
        this.tbody.appendChild(tr);
    }
}

customElements.define('depp-course-info-panel', CourseInfoPanel, {extends: 'table'});
export class Spacer extends HTMLDivElement {
    constructor(dimensionsObj) {
        super();

        if ("width" in dimensionsObj) {
            this.style.width = dimensionsObj.width;
        }

        if ("height" in dimensionsObj) {
            this.style.height = dimensionsObj.height;
        }
    }
}

customElements.define('depp-spacer', Spacer, {extends: 'div'});

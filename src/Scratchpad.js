export class Scratchpad extends HTMLDivElement {
    constructor() {
        super();
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
        ev.currentTarget.appendChild(element);
        element.style.left = ev.offsetX + "px";
        element.style.top = ev.offsetY + "px";
    }
}


customElements.define('depp-scratchpad', Scratchpad, {extends: 'div'});
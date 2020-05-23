import { WebGLRenderer } from 'three';

class WirePlaceRenderer {
  domElement: HTMLDivElement;
  webGLRenderer: WebGLRenderer;

  constructor() {
    this.domElement = document.createElement('div');
    this.webGLRenderer = new WebGLRenderer({ antialias: true });
  }

  setDOMElement(element: HTMLDivElement) {
    this.domElement = element;
    element.appendChild(this.webGLRenderer.domElement);
    this.resize();
  }

  resize = () => {
    this.webGLRenderer.setPixelRatio(window.devicePixelRatio);
    this.webGLRenderer.setSize(this.domElement.clientWidth, this.domElement.clientHeight);
  }
}

export default WirePlaceRenderer;
import * as THREE from "three";
import * as dat from "dat.gui";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const initRenderer = (canvas) => {
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });
  renderer.setClearColor(0x010101, 1);
  return renderer;
};

const initCamera = (renderer, pos) => {
  let width = renderer.domElement.clientWidth;
  let height = renderer.domElement.clientHeight;
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100000);
  camera.position.set(pos[0], pos[1], pos[2]);
  camera.lookAt(0, 0, 0);
  return camera;
};

const initScene = () => {
  return new THREE.Scene();
};

const initHelper = () => {
  const gridHelper = new THREE.GridHelper(10000, 100);
  const axes = new THREE.AxesHelper(10000);
  return { gridHelper: gridHelper, axes: axes };
};

const initAmbientLight = () => {
  return new THREE.AmbientLight();
};

const initDirectionalLight = (pos) => {
  let light = new THREE.DirectionalLight();
  light.position.set(pos[0], pos[1], pos[2]);
  return light;
};

const initControl = (camera, renderer) => {
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.dampingFactor = 0.25;
  controls.enableZoom = true;
  controls.autoRotate = false;
  controls.minDistance = 1;
  controls.maxDistance = 10000;
  controls.enablePan = true;
  return controls;
};

const initGuiControl = (parentNode) => {
  const gui = new dat.GUI({ autoPlace: false });
  gui.domElement.style = "position:absolute;top:0;";
  parentNode.appendChild(gui.domElement);
  let Axis = gui.addFolder("Axis");
  let AxisNames = {
    X: "Red",
    Y: "Green",
    Z: "Blue",
  };
  Axis.add(AxisNames, "X");
  Axis.add(AxisNames, "Y");
  Axis.add(AxisNames, "Z");
  Axis.open();
  return gui;
};

export {
  initRenderer,
  initCamera,
  initScene,
  initHelper,
  initAmbientLight,
  initDirectionalLight,
  initControl,
  initGuiControl,
};

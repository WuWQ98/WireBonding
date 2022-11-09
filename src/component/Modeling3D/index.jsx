import React, {Component} from "react";
import * as Three from "../../three";
import * as THREE from "three";
import componentStyle from "./index.module.css";
import {Route} from "react-router-dom";
import {connect} from "react-redux";
import WireBar from "./component/WireBar";
import TubeBar from "./component/TubeBar";
import SelectBar from "./component/SelectBar";
import AboutWireParams from "./component/AboutWireParams";
import AboutWireOutput from "./component/AboutWireOutput";
import AboutWireExport from "./component/AboutWireExport";
import AboutTubeParams from "./component/AboutTubeParams";

class Modeling3D extends Component {
    constructor(props) {
        super(props);
        this.canvas = React.createRef();
        this.three = {};
    }

    componentDidMount() {
        this.three.renderer = Three.initRenderer(this.canvas);
        this.three.renderer.setSize(
            this.three.renderer.domElement.getBoundingClientRect().width,
            this.three.renderer.domElement.getBoundingClientRect().height,
            false
        );
        this.three.camera = Three.initCamera(this.three.renderer, [1000, 1000, 1000]);
        this.three.scene = Three.initScene();
        this.three.helper = Three.initHelper();
        this.three.ambientLight = Three.initAmbientLight();
        this.three.directionalLight = Three.initDirectionalLight([0, 2000, 0]);
        this.three.control = Three.initControl(
            this.three.camera,
            this.three.renderer
        );
        this.three.guiControl = Three.initGuiControl(this.canvas.parentNode);
        this.three.scene.add(this.three.helper.gridHelper);
        this.three.scene.add(this.three.helper.axes);
        this.three.scene.add(this.three.ambientLight);
        this.three.scene.add(this.three.directionalLight);
        this.three_render();
        window.addEventListener("resize", () => this.three_resize());
    }

    three_render = () => {
        this.three.renderer.render(this.three.scene, this.three.camera);
        requestAnimationFrame(() => this.three_render());
    };

    three_resize = () => {
        this.three.renderer.setSize(
            this.three.renderer.domElement.getBoundingClientRect().width,
            this.three.renderer.domElement.getBoundingClientRect().height,
            false
        );
        this.three.camera.aspect =
            this.three.renderer.domElement.getBoundingClientRect().width /
            this.three.renderer.domElement.getBoundingClientRect().height;
        this.three.camera.updateProjectionMatrix();
    };

    render() {
        return (
            <div className={componentStyle.container}>
                <div className={componentStyle["main-content"]}>
                    <SelectBar/>
                    <Route path="/3DModeling/wire"
                           render={() => (<WireBar/>)}/>
                    <Route path="/3DModeling/tube"
                           render={() => (<TubeBar/>)}/>
                    <div className={componentStyle["canvas-container"]}>
                        <canvas
                            ref={(ref) => {
                                this.canvas = ref;
                            }}
                        ></canvas>
                    </div>
                    {/*<div className={componentStyle["copyright"]}>Copyright: Innovative Institute of Electromagnetic*/}
                    {/*    Information and*/}
                    {/*    Electronic Integration of Zhejiang University*/}
                    {/*</div>*/}
                </div>
                <div className={componentStyle["right-aside"]}>
                    <Route path="/3DModeling/wire/params"
                           render={() => (<AboutWireParams generateWire={this.generateWire}
                                                           deleteWireFromScene={this.deleteWireFromScene}
                                                           generateMetalGasket={this.generateMetalGasket}
                                                           deleteMetalGasketFromScene={this.deleteMetalGasketFromScene}
                           />)}/>
                    <Route path="/3DModeling/wire/output"
                           render={() => (<AboutWireOutput/>)}/>
                    <Route path="/3DModeling/wire/export"
                           render={() => (<AboutWireExport/>)}/>
                    <Route path="/3DModeling/tube/params"
                           render={() => (<AboutTubeParams generateTube={this.generateTube}
                                                           deleteTubeFromScene={this.deleteTubeFromScene}
                                                           generateFins={this.generateFins}
                                                           deleteFinsFromScene={this.deleteFinsFromScene}
                                                           generatePins={this.generatePins}
                                                           deletePinsFromScene={this.deletePinsFromScene}
                           />)}/>
                </div>
            </div>
        );
    }


    deleteWireFromScene = () => {
        let latestGroup = this.props.wireModules[this.props.wireModules.length - 1];
        latestGroup.traverse((obj) => {
            if (obj.type === "Mesh") {
                obj.geometry.dispose();
                obj.material.dispose();
            }
        })
        this.three.scene.remove(latestGroup);
    }

    deleteMetalGasketFromScene = () => {
        if (this.props.metalGasketParams.length % 2 === 0) {
            let latestMosCapacitanceModule = this.props.mosCapacitanceModules[this.props.mosCapacitanceModules.length - 1];
            latestMosCapacitanceModule.geometry.dispose();
            latestMosCapacitanceModule.material.dispose();
            this.three.scene.remove(latestMosCapacitanceModule);
            let latestMosCapacitanceModuleBefore = this.props.mosCapacitanceModules[this.props.mosCapacitanceModules.length - 2];
            latestMosCapacitanceModuleBefore.geometry.dispose();
            latestMosCapacitanceModuleBefore.material.dispose();
            this.three.scene.remove(latestMosCapacitanceModuleBefore);
        }
        let latestMetalGasket = this.props.metalGasketModules[this.props.metalGasketModules.length - 1];
        latestMetalGasket.geometry.dispose();
        latestMetalGasket.material.dispose();
        this.three.scene.remove(latestMetalGasket);
    }

    deleteTubeFromScene = () => {
        let group = this.props.tubeModules[0];
        group.traverse((obj) => {
            if (obj.type === "Mesh") {
                obj.geometry.dispose();
                obj.material.dispose();
            }
        })
        this.three.scene.remove(group);
    }

    deleteFinsFromScene = () => {
        let group = this.props.finsModules[this.props.finsModules.length - 1];
        group.traverse((obj) => {
            if (obj.type === "Mesh") {
                obj.geometry.dispose();
                obj.material.dispose();
            }
        })
        this.three.scene.remove(group);
    }

    deletePinsFromScene = () => {
        let latestPins = this.props.pinsModules[this.props.pinsModules.length - 1];
        latestPins.geometry.dispose();
        latestPins.material.dispose();
        this.three.scene.remove(latestPins);
    }

    generateWire = () => {
        let latestWirePoints = this.props.wirePoints[this.props.wirePoints.length - 1];
        let latestWireParams = this.props.wireParams[this.props.wireParams.length - 1];
        let path = latestWirePoints.map((point) => {
            let vector = new THREE.Vector3();
            vector.set(point[0], point[1], point[2]).multiplyScalar(1);
            return vector;
        });

        let group = new THREE.Group();
        let countWireGap = 0;
        for (let idx = 0; idx < latestWireParams.wireAmount; idx++) {
            let wireGeometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(path), 64, latestWireParams.wireRadius, 16);
            const wireMesh = new THREE.Mesh(wireGeometry, new THREE.MeshPhongMaterial({color: 0xaabbcc}));
            wireMesh.translateZ(countWireGap);
            group.add(wireMesh);

            let firstPoint = latestWirePoints[0];
            let firstWeldSphereGeometry = new THREE.SphereGeometry(latestWireParams.wireRadius);
            firstWeldSphereGeometry.translate(firstPoint[0], firstPoint[1], firstPoint[2]);
            let firstWeldSphereMesh = new THREE.Mesh(firstWeldSphereGeometry, new THREE.MeshPhongMaterial({color: 0xaabbcc}));
            firstWeldSphereMesh.translateZ(countWireGap);
            group.add(firstWeldSphereMesh);

            let firstWeldMetalGeometry = new THREE.BoxGeometry(latestWireParams.weldMetalShape[0], latestWireParams.weldMetalShape[1], latestWireParams.weldMetalShape[2]);
            firstWeldMetalGeometry.translate(firstPoint[0], firstPoint[1] - 0.5 * latestWireParams.weldMetalShape[1], firstPoint[2]);
            let firstWeldMetalMesh = new THREE.Mesh(firstWeldMetalGeometry, new THREE.MeshPhongMaterial({color: 0xaabbcc}));
            firstWeldMetalMesh.translateZ(countWireGap);
            group.add(firstWeldMetalMesh);

            let lastPoint = latestWirePoints[latestWirePoints.length - 1];
            let lastWeldSphereGeometry = new THREE.SphereGeometry(latestWireParams.wireRadius);
            lastWeldSphereGeometry.translate(lastPoint[0], lastPoint[1], lastPoint[2]);
            let lastWeldSphereMesh = new THREE.Mesh(lastWeldSphereGeometry, new THREE.MeshPhongMaterial({color: 0xaabbcc}));
            lastWeldSphereMesh.translateZ(countWireGap);
            group.add(lastWeldSphereMesh);

            let lastWeldMetalGeometry = new THREE.BoxGeometry(latestWireParams.weldMetalShape[0], latestWireParams.weldMetalShape[1], latestWireParams.weldMetalShape[2]);
            lastWeldMetalGeometry.translate(lastPoint[0], lastPoint[1] - 0.5 * latestWireParams.weldMetalShape[1], lastPoint[2]);
            let lastWeldMetalMesh = new THREE.Mesh(lastWeldMetalGeometry, new THREE.MeshPhongMaterial({color: 0xaabbcc}));
            lastWeldMetalMesh.translateZ(countWireGap);
            group.add(lastWeldMetalMesh);

            if (idx !== latestWireParams.wireAmount - 1) {
                countWireGap += latestWireParams.wireGaps[idx];
            }
        }
        group.translateZ(-latestWireParams.wireGaps.reduce((val1, val2) => {
            return val1 + val2;
        }) / 2);
        this.three.scene.add(group);
        this.props.pushWireModule(group);
    }

    generateMetalGasket = () => {
        let latestMetalGasketParams = this.props.metalGasketParams[this.props.metalGasketParams.length - 1];
        let metalGasketGeometry = new THREE.BoxGeometry(
            latestMetalGasketParams.metalGasketShape[0],
            latestMetalGasketParams.metalGasketShape[1],
            latestMetalGasketParams.metalGasketShape[2]);
        metalGasketGeometry.translate(
            latestMetalGasketParams.metalGasketPosition[0],
            latestMetalGasketParams.metalGasketPosition[1],
            latestMetalGasketParams.metalGasketPosition[2]);
        let metalGasketMesh = new THREE.Mesh(metalGasketGeometry, new THREE.MeshPhysicalMaterial({color: 0x123456}));
        this.three.scene.add(metalGasketMesh);
        this.props.pushMetalGasketModule(metalGasketMesh);
        if (this.props.metalGasketParams.length % 2 === 0) {
            let lastMetalGasketParams = this.props.metalGasketParams[this.props.metalGasketParams.length - 1];
            let lastMetalGasketParamsBefore = this.props.metalGasketParams[this.props.metalGasketParams.length - 2];
            let [x_0, y_0, z_0] = lastMetalGasketParamsBefore.metalGasketPosition;
            let [dx_0, dy_0, dz_0] = lastMetalGasketParamsBefore.metalGasketShape;
            let [x_1, y_1, z_1] = lastMetalGasketParams.metalGasketPosition;
            let [dx_1, dy_1, dz_1] = lastMetalGasketParams.metalGasketShape;
            let y_plane = lastMetalGasketParams.bottomPlaneHeight;

            let dz_mc0 = Math.max(z_0 + 0.5 * dz_0, z_1 + 0.5 * dz_1) - Math.min(z_0 - 0.5 * dz_0, z_1 - 0.5 * dz_1);
            let dz_mc1 = Math.max(z_0 + 0.5 * dz_0, z_1 + 0.5 * dz_1) - Math.min(z_0 - 0.5 * dz_0, z_1 - 0.5 * dz_1);
            let dx_mc0 = 0.5 * (Math.abs(x_1 - x_0) + 0.5 * dx_0 + 0.5 * dx_1);
            let dx_mc1 = 0.5 * (Math.abs(x_1 - x_0) + 0.5 * dx_0 + 0.5 * dx_1);
            let dy_mc0 = Math.abs(y_0 - y_plane) - 0.5 * dy_0;
            let dy_mc1 = Math.abs(y_1 - y_plane) - 0.5 * dy_1;

            let z_mc0 = (Math.max(z_0 + 0.5 * dz_0, z_1 + 0.5 * dz_1) + Math.min(z_0 - 0.5 * dz_0, z_1 - 0.5 * dz_1)) * 0.5;
            let z_mc1 = (Math.max(z_0 + 0.5 * dz_0, z_1 + 0.5 * dz_1) + Math.min(z_0 - 0.5 * dz_0, z_1 - 0.5 * dz_1)) * 0.5;
            let y_mc0 = y_0 - 0.5 * dy_0 - 0.5 * dy_mc0;
            let y_mc1 = y_1 - 0.5 * dy_1 - 0.5 * dy_mc1;
            let x_mc0 = Math.min(x_0 - 0.5 * dx_0, x_1 - 0.5 * dx_1) + 0.25 * (Math.abs(x_1 - x_0) + 0.5 * dx_0 + 0.5 * dx_1);
            let x_mc1 = Math.max(x_0 + 0.5 * dx_0, x_1 + 0.5 * dx_1) - 0.25 * (Math.abs(x_1 - x_0) + 0.5 * dx_0 + 0.5 * dx_1);

            window.pyApi.generateMosCapacitance(lastMetalGasketParamsBefore.nameID + "+" + lastMetalGasketParams.nameID + "_0", [x_mc0, y_mc0, z_mc0], dx_mc0, dy_mc0, dz_mc0);
            window.pyApi.generateMosCapacitance(lastMetalGasketParamsBefore.nameID + "+" + lastMetalGasketParams.nameID + "_1", [x_mc1, y_mc1, z_mc1], dx_mc1, dy_mc1, dz_mc1);

            let mosCapacitance0Geometry = new THREE.BoxGeometry(dx_mc0, dy_mc0, dz_mc0);
            mosCapacitance0Geometry.translate(x_mc0, y_mc0, z_mc0);
            let mosCapacitance0Mesh = new THREE.Mesh(mosCapacitance0Geometry, new THREE.MeshPhysicalMaterial({color: 0x654321}));
            this.three.scene.add(mosCapacitance0Mesh);
            this.props.pushMosCapacitanceModule(mosCapacitance0Mesh);
            let mosCapacitance1Geometry = new THREE.BoxGeometry(dx_mc1, dy_mc1, dz_mc1);
            mosCapacitance1Geometry.translate(x_mc1, y_mc1, z_mc1);
            let mosCapacitance1Mesh = new THREE.Mesh(mosCapacitance1Geometry, new THREE.MeshPhysicalMaterial({color: 0x654321}));
            this.three.scene.add(mosCapacitance1Mesh);
            this.props.pushMosCapacitanceModule(mosCapacitance1Mesh);
        }
    }

    generateTube = () => {
        let latestTubeParams = this.props.tubeParams[0];
        let {shellThickness, shellInnerHeight} = latestTubeParams;

        let left = Number.MAX_SAFE_INTEGER, right = Number.MIN_SAFE_INTEGER,
            front = Number.MIN_SAFE_INTEGER, back = Number.MAX_SAFE_INTEGER;
        let maxWeldMetalWidth = Number.MIN_SAFE_INTEGER;

        this.props.wireParams.forEach((params) => {
            params.points.forEach((point) => {
                left = left > point[0] ? point[0] : left;
                right = right < point[0] ? point[0] : right;
            });
            maxWeldMetalWidth = maxWeldMetalWidth < params.weldMetalShape[0] ? params.weldMetalShape[0] : maxWeldMetalWidth;
        });

        this.props.metalGasketParams.forEach((params) => {
            front = front < (params.metalGasketPosition[2] + params.metalGasketShape[2] / 2) ? (params.metalGasketPosition[2] + params.metalGasketShape[2] / 2) : front;
            back = back > (params.metalGasketPosition[2] - params.metalGasketShape[2] / 2) ? (params.metalGasketPosition[2] - params.metalGasketShape[2] / 2) : back;
        });

        let x = (left + right) / 2;
        let y = this.props.metalGasketParams[0].bottomPlaneHeight + shellInnerHeight / 2;
        let z = (front + back) / 2;

        let dx_inner = right - left + maxWeldMetalWidth;
        let dy_inner = shellInnerHeight;
        let dz_inner = front - back;

        let dx_outer = dx_inner + 2 * shellThickness;
        let dy_outer = dy_inner + 2 * shellThickness;
        let dz_outer = dz_inner + 2 * shellThickness;

        let innerBox_Geometry = new THREE.BoxGeometry(dx_inner, dy_inner, dz_inner);
        innerBox_Geometry.translate(x, y, z);
        let innerBox_Mesh = new THREE.Mesh(innerBox_Geometry, new THREE.MeshPhysicalMaterial({
            color: 0xaaaaaa,
            transparent: true,
            opacity: 0.5
        }));

        let outerBox_Geometry = new THREE.BoxGeometry(dx_outer, dy_outer, dz_outer);
        outerBox_Geometry.translate(x, y, z);
        let outerBox_Mesh = new THREE.Mesh(outerBox_Geometry, new THREE.MeshPhysicalMaterial({
            color: 0xaaaaaa,
            transparent: true,
            opacity: 0.5
        }));

        let group = new THREE.Group();
        group.add(innerBox_Mesh);
        group.add(outerBox_Mesh);
        this.three.scene.add(group);

        this.props.pushTubeModule(group);

        window.pyApi.generateOCCTubeModule(shellThickness, dx_inner, dy_inner, dz_inner, [x, y, z]);
    }

    generateFins = () => {
        let {nameID, finsShape, finsPoints} = this.props.finsParams[this.props.finsParams.length - 1];
        let [point1, point2, point3, point4] = finsPoints;
        let [width, height] = finsShape;

        const makeBoxBetweenPoints = (point1, point2, width, height) => {
            let x = (point1[0] + point2[0]) / 2;
            let y = point1[1];
            let z = (point1[2] + point2[2]) / 2;
            let delta_x = point2[0] - point1[0];
            let delta_z = point2[2] - point1[2];
            let rad = delta_z !== 0 ? Math.atan(delta_x / delta_z) : Math.PI / 2;
            let dx = width;
            let dy = height;
            let dz = Math.sqrt(Math.pow(delta_x, 2) + Math.pow(delta_z, 2));
            let box_Geometry = new THREE.BoxGeometry(dx, dy, dz);
            box_Geometry.rotateY(rad);
            box_Geometry.translate(x, y, z);
            return new THREE.Mesh(box_Geometry, new THREE.MeshPhysicalMaterial({color: 0x981212}));
        }
        let box1_Mesh = makeBoxBetweenPoints(point1, point2, width, height);
        let box2_Mesh = makeBoxBetweenPoints(point2, point3, width, height);
        let box3_Mesh = makeBoxBetweenPoints(point3, point4, width, height);

        let connect1_Geometry = new THREE.CylinderGeometry(width / 2, width / 2, height, 64);
        connect1_Geometry.translate(point2[0], point2[1], point2[2]);
        let connect1_Mesh = new THREE.Mesh(connect1_Geometry, new THREE.MeshPhysicalMaterial({color: 0x981212}));

        let connect2_Geometry = new THREE.CylinderGeometry(width / 2, width / 2, height, 64);
        connect2_Geometry.translate(point3[0], point3[1], point3[2]);
        let connect2_Mesh = new THREE.Mesh(connect2_Geometry, new THREE.MeshPhysicalMaterial({color: 0x981212}));

        let group = new THREE.Group();
        group.add(box1_Mesh, connect1_Mesh, box2_Mesh, connect2_Mesh, box3_Mesh);

        this.three.scene.add(group);

        this.props.pushFinsModule(group);

        window.pyApi.generateFins(finsPoints, width, height, nameID);
    }

    generatePins = () => {
        let {nameID, pinsPosition, pinsShape} = this.props.pinsParams[this.props.pinsParams.length - 1];
        let [x, y, z] = pinsPosition;
        let [dx, dy, dz] = pinsShape;
        let pins_Geometry = new THREE.BoxGeometry(dx, dy, dz);
        pins_Geometry.translate(x, y, z);
        let pins_Mesh = new THREE.Mesh(pins_Geometry, new THREE.MeshPhysicalMaterial({color: 0x160588}));

        this.three.scene.add(pins_Mesh);

        this.props.pushPinsModule(pins_Mesh);

        window.pyApi.generatePins(pinsPosition, dx, dy, dz, nameID);
    }

}


const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        pushWireModule: (module) => {
            dispatch({type: "pushWireModule", data: module});
        },
        pushMetalGasketModule: (module) => {
            dispatch({type: "pushMetalGasketModule", data: module});
        },
        pushMosCapacitanceModule: (module) => {
            dispatch({type: "pushMosCapacitanceModule", data: module});
        },
        pushTubeModule: (module) => {
            dispatch({type: "pushTubeModule", data: module});
        },
        pushFinsModule: (module) => {
            dispatch({type: "pushFinsModule", data: module});
        },
        pushPinsModule: (module) => {
            dispatch({type: "pushPinsModule", data: module});
        }
    };
};

const mapStateToProps = (state, ownProps) => {
    return {
        wirePoints: state.wire.points,
        wireParams: state.wire.params,
        wireModules: state.wire.modules,
        metalGasketParams: state.metalGasket.params,
        metalGasketModules: state.metalGasket.modules,
        mosCapacitanceModules: state.mosCapacitance.modules,
        tubeParams: state.tube.params,
        pinsParams: state.pins.params,
        finsParams: state.fins.params,
        tubeModules: state.tube.modules,
        finsModules: state.fins.modules,
        pinsModules: state.pins.modules
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Modeling3D);

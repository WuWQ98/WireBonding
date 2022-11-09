import React, {Component} from "react";
import componentStyle from "./index.module.css";
import InputBox from "../../../InputBox";
import {connect} from "react-redux";
import * as echarts from "echarts/core";
import line3DOption from "../../../../echartsOption/line3DOption";
import Swal from 'sweetalert2';

class AboutWireParams extends Component {
    constructor(props) {
        super(props);
        this.myRefs = {};
        this.myRefs.conductivity = React.createRef();
        this.myRefs.frequency = React.createRef();
        this.myRefs.wireRadius = React.createRef();
        this.myRefs.wireAmount = React.createRef();
        this.myRefs.lossTangent = React.createRef();
        this.myRefs.nameID = React.createRef();
        this.myRefs.permittivity = React.createRef();
        this.myRefs.weldMetalShape = React.createRef();//数组
        this.myRefs.wireGap = React.createRef();//数组
        this.myRefs.points = React.createRef();//数组


        this.myRefs.metalGasketShape = React.createRef();//数组
        this.myRefs.metalGasketPosition = React.createRef();//数组
        this.myRefs.bottomPlaneHeight = React.createRef();
        this.myRefs.metalGasketNameID = React.createRef();
    }

    componentDidMount() {
        this.setDefaultValue();
        this.wireGraphEchartDom = echarts.init(this.wireGraphDom, "dark");
        window.addEventListener("resize", () => {
            this.wireGraphEchartDom.resize();
        });
    }

    render() {
        return (
            <div className={componentStyle.container}>
                <div className={componentStyle["wire-params-inputer"]}>
                    <div className={componentStyle.title}>PARAMETERS</div>
                    <div className={componentStyle["input-box-container-wire"]}>
                        <InputBox
                            ref={this.myRefs.conductivity}
                            style={{gridArea: "1/1/2/2"}}
                        >
                            Conductivity (S/m)
                        </InputBox>
                        <InputBox
                            ref={this.myRefs.frequency}
                            style={{gridArea: "1/2/2/3"}}
                        >
                            Frequency (GHz)
                        </InputBox>
                        <InputBox
                            ref={this.myRefs.wireRadius}
                            style={{gridArea: "2/1/3/2"}}
                        >
                            Wire Radius (um)
                        </InputBox>
                        <InputBox
                            ref={this.myRefs.lossTangent}
                            style={{gridArea: "2/2/3/3"}}
                        >
                            Loss Tangent
                        </InputBox>
                        <InputBox
                            ref={this.myRefs.wireAmount}
                            style={{gridArea: "3/1/4/2"}}
                        >
                            Wire Amount
                        </InputBox>
                        <InputBox
                            ref={this.myRefs.nameID}
                            style={{gridArea: "3/2/4/3"}}
                        >
                            NameID
                        </InputBox>
                        <InputBox
                            ref={this.myRefs.permittivity}
                            style={{gridArea: "4/1/5/3"}}
                        >
                            Permittivity of Medium
                        </InputBox>
                        <InputBox
                            ref={this.myRefs.weldMetalShape}
                            style={{gridArea: "5/1/6/3"}}
                            placeholder="example: 25,17,25"
                        >
                            Weld Metal Shape (um) [dx,dy,dz]
                        </InputBox>
                        <InputBox
                            ref={this.myRefs.wireGap}
                            style={{gridArea: "6/1/7/3"}}
                            placeholder="example: 100,200,300"
                        >
                            Wire Gap (um) [Array]
                        </InputBox>
                        <InputBox
                            ref={this.myRefs.points}
                            style={{gridArea: "7/1/8/3"}}
                            placeholder="example: 0,12.5,-100  /  100,100,-100  /  200,12.5,-100"
                        >
                            Points (um) [Array]
                        </InputBox>
                    </div>
                    <div className={componentStyle.buttons}>
                        <div onClick={this.onSubmitWire}>Submit</div>
                        <div onClick={this.onDeleteWire}>Delete</div>
                    </div>
                </div>
                <div className={componentStyle["metal-gasket-params-inputer"]}>
                    <div className={componentStyle.title}>PARAMETERS</div>
                    <div className={componentStyle["input-box-container-metal-gasket"]}>
                        <InputBox
                            ref={this.myRefs.metalGasketShape}
                            placeholder="example: 100,10,1200"
                        >
                            Metal Gasket Shape (um) [dx,dy,dz]
                        </InputBox>
                        <InputBox
                            ref={this.myRefs.metalGasketPosition}
                            placeholder="example: 0,0,0"
                        >
                            Metal Gasket Position (um) [x,y,z]
                        </InputBox>
                        <InputBox
                            ref={this.myRefs.bottomPlaneHeight}
                            placeholder="y-axis as the upward direction"
                        >
                            Bottom Plane Height (um) [y]
                        </InputBox>
                        <InputBox
                            ref={this.myRefs.metalGasketNameID}
                        >
                            NameID
                        </InputBox>
                    </div>
                    <div className={componentStyle.buttons}>
                        <div onClick={this.onSubmitMetalGasket}>Submit</div>
                        <div onClick={this.onDeleteMetalGasket}>Delete</div>
                    </div>
                </div>
                <div className={componentStyle["wire-shower"]}>
                    <div className={componentStyle.title}>GRAPH</div>
                    <div
                        className={componentStyle["wire-graph-container"]}
                        ref={(ref) => {
                            this.wireGraphDom = ref;
                        }}
                    ></div>
                </div>
            </div>
        );
    }

    setDefaultValue = () => {
        this.myRefs.conductivity.current.value = "3.8e7";
        this.myRefs.frequency.current.value = 3;
        this.myRefs.wireRadius.current.value = 10;
        this.myRefs.wireAmount.current.value = 5;
        this.myRefs.lossTangent.current.value = 0.02;
        this.myRefs.nameID.current.value = "test";
        this.myRefs.permittivity.current.value = 3;
        this.myRefs.weldMetalShape.current.value = "20,20,20";
        this.myRefs.wireGap.current.value = "100,100,100,100";
        this.myRefs.points.current.value = "0,200,0  /  100,150,0  /  200,0,0 ";

        this.myRefs.metalGasketShape.current.value = "100,10,500";
        this.myRefs.metalGasketPosition.current.value = "200,-25,0";
        this.myRefs.bottomPlaneHeight.current.value = -50;
        this.myRefs.metalGasketNameID.current.value = "test";
    }

    onSubmitWire = () => {
        if (!this.judgeWireParamsValid()) {
            Swal.fire({
                icon: 'error',
                title: 'Parameters wrong',
                width: 800,
                html:
                    "<span>NOTES:</span><br>" +
                    "<div style='text-align: left;padding: 10px 50px;font-size: 110%'>1. Length of <strong>Wire Gap</strong> should be equal to <strong>wire Amount</strong>-1.<br>" +
                    "2. Count of <strong>Points</strong> separated by / should be 3 or 5.<br>" +
                    "3. Inputs should be number except <strong>NameID</strong>.<br>" +
                    "4. Inputs should be English format.<br>" +
                    "5. <strong>Wire Amount</strong> must bigger than 1.<br>" +
                    "6. <strong>nameID</strong> can not be same.</div>",
            });
            return;
        }

        let latestParams = this.props.wireParamsArray[this.props.wireParamsArray.length - 1];
        window.pyApi.generateOCCWireModule(
            latestParams.nameID,
            latestParams.points,
            latestParams.wireAmount,
            latestParams.wireGaps,
            latestParams.wireRadius,
            latestParams.weldMetalShape).then((result) => {
            let option = line3DOption;
            option.series[0].data = result;
            this.wireGraphEchartDom.setOption(option);
            this.props.pushWirePoints(result);
            this.props.generateWire();
        });

    }

    onDeleteWire = () => {
        if (this.props.wireParamsArray.length === 0) {
            Swal.fire("No wire to delete!");
        } else {
            let nameID = this.props.wireParamsArray[this.props.wireParamsArray.length - 1].nameID;
            //deleteWireFromScene先于popWire执行
            this.props.deleteWireFromScene();
            this.props.popWire();

            window.pyApi.popWire(nameID);
        }
    };

    onSubmitMetalGasket = () => {
        if (!this.judgeMetalGasketParamsValid()) {
            Swal.fire({
                icon: 'error',
                title: 'Parameters wrong',
                width: 800,
                html:
                    "<span>NOTES:</span><br>" +
                    "<div style='text-align: left;padding: 10px 50px;font-size: 110%'>1. <strong>nameID</strong> can not be same.<br>" +
                    "2. Don not change <strong>Bottom Plane Height</strong>.<br>",
            });
            return;
        }
        let latestParams = this.props.metalGasketParamsArray[this.props.metalGasketParamsArray.length - 1];
        window.pyApi.generateMetalGasket(
            latestParams.nameID,
            latestParams.metalGasketPosition,
            latestParams.metalGasketShape[0],
            latestParams.metalGasketShape[1],
            latestParams.metalGasketShape[2]).then(() => {
            this.props.generateMetalGasket();
        });
    }

    onDeleteMetalGasket = () => {
        if (this.props.metalGasketParamsArray.length === 0) {
            Swal.fire("No metal gasket to delete!");
        } else {
            let length = this.props.metalGasketParamsArray.length;
            let nameID = this.props.metalGasketParamsArray[length - 1].nameID;
            let nameIDBefore = length > 1 ? this.props.metalGasketParamsArray[length - 2].nameID : "";
            //deleteMetalGasketFromScene先于popMetalGasket执行
            this.props.deleteMetalGasketFromScene();
            this.props.popMetalGasket();

            window.pyApi.popMetalGasket(nameID)
            if (length % 2 === 0) {
                window.pyApi.popMosCapacitance(nameIDBefore + "+" + nameID + "_0");
                window.pyApi.popMosCapacitance(nameIDBefore + "+" + nameID + "_1");
            }
        }
    }

    judgeWireParamsValid = () => {
        let ret = true;
        let conductivity = parseFloat(this.myRefs.conductivity.current.value);
        let frequency = parseFloat(this.myRefs.frequency.current.value);
        let wireRadius = parseFloat(this.myRefs.wireRadius.current.value);
        let lossTangent = parseFloat(this.myRefs.lossTangent.current.value);
        let wireAmount = parseFloat(this.myRefs.wireAmount.current.value);
        let permittivity = parseFloat(this.myRefs.permittivity.current.value);
        if (
            Number.isNaN(conductivity) ||
            Number.isNaN(frequency) ||
            Number.isNaN(wireRadius) ||
            Number.isNaN(lossTangent) ||
            Number.isNaN(wireAmount) ||
            Number.isNaN(permittivity)
        ) {
            ret = false;
        }

        let weldMetalShape;
        if (this.getShapeOrPositionFromInput(this.myRefs.weldMetalShape.current.value)[1]) {
            weldMetalShape = this.getShapeOrPositionFromInput(this.myRefs.weldMetalShape.current.value)[0];
        } else {
            ret = false;
        }

        let points = this.myRefs.points.current.value.split("/");
        if (![3, 5].includes(points.length)) {
            ret = false;
        } else {
            points = points.map((value) => {
                let point = value.split(",");
                if (point.length !== 3) {
                    ret = false;
                } else {
                    point.forEach((value, idx) => {
                        if (Number.isNaN(parseFloat(value))) {
                            ret = false;
                        } else {
                            point[idx] = parseFloat(value);
                        }
                    })
                }
                return point;
            });
        }

        let wireGaps = this.myRefs.wireGap.current.value.split(",");
        if (wireAmount > 1) {
            if (wireGaps.length !== wireAmount - 1) {
                ret = false;
            } else {
                wireGaps = wireGaps.map((value) => {
                    if (Number.isNaN(parseFloat(value))) {
                        ret = false;
                    }
                    return parseFloat(value);
                })
            }
        }
        if (wireAmount === 1) {
            wireGaps = [];
        }
        if (wireAmount < 1) {
            ret = false;
        }

        this.props.wireParamsArray.forEach((params) => {
            if (params.nameID === this.myRefs.nameID.current.value) {
                ret = false;
            }
        });
        if (ret) {
            this.props.pushWireParams({
                nameID: this.myRefs.nameID.current.value,
                conductivity: conductivity,
                frequency: frequency,
                wireRadius: wireRadius,
                lossTangent: lossTangent,
                wireAmount: wireAmount,
                permittivity: permittivity,
                weldMetalShape: weldMetalShape,
                wireGaps: wireGaps,
                points: points,
            });
        }
        return ret;
    }

    judgeMetalGasketParamsValid = () => {
        let ret = true;
        let bottomPlaneHeight = parseFloat(this.myRefs.bottomPlaneHeight.current.value);
        if (Number.isNaN(bottomPlaneHeight)) {
            ret = false;
        }
        let metalGasketShape;
        if (this.getShapeOrPositionFromInput(this.myRefs.metalGasketShape.current.value)[1]) {
            metalGasketShape = this.getShapeOrPositionFromInput(this.myRefs.metalGasketShape.current.value)[0];
        } else {
            ret = false;
        }

        let metalGasketPosition;
        if (this.getShapeOrPositionFromInput(this.myRefs.metalGasketPosition.current.value)[1]) {
            metalGasketPosition = this.getShapeOrPositionFromInput(this.myRefs.metalGasketPosition.current.value)[0];
        } else {
            ret = false;
        }

        this.props.metalGasketParamsArray.forEach((params) => {
            if (params.nameID === this.myRefs.metalGasketNameID.current.value) {
                ret = false;
            }
            if (params.bottomPlaneHeight !== bottomPlaneHeight) {
                ret = false;
            }
        });
        if (ret) {
            this.props.pushMetalGasketParams({
                nameID: this.myRefs.metalGasketNameID.current.value,
                metalGasketShape: metalGasketShape,
                metalGasketPosition: metalGasketPosition,
                bottomPlaneHeight: bottomPlaneHeight,
            });
        }
        return ret;
    }

    getShapeOrPositionFromInput = (string) => {
        let retArray = [];
        let isValid = true;
        let array = string.split(",");
        if (array.length !== 3) {
            isValid = false
        } else {
            retArray = array.map((value) => {
                if (Number.isNaN(parseFloat(value))) {
                    isValid = false;
                }
                return parseFloat(value);
            })
        }
        return [retArray, isValid]
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        wireParamsArray: state.wire.params,
        metalGasketParamsArray: state.metalGasket.params,
    };
};
const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        pushWireParams: (params) => {
            dispatch({type: "pushWireParams", data: params});
        },
        pushMetalGasketParams: (params) => {
            dispatch({type: "pushMetalGasketParams", data: params});
        },
        pushWirePoints: (points) => {
            dispatch({type: "pushWirePoints", data: points});
        },
        popWire: () => {
            dispatch({type: "popWire", data: {}});
        },
        popMetalGasket: () => {
            dispatch({type: "popMetalGasket", data: {}});
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(AboutWireParams);

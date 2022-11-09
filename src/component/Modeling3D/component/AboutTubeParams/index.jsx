import React, {Component} from 'react';
import {connect} from "react-redux";
import componentStyle from "./index.module.css";
import InputBox from "../../../InputBox";
import Swal from "sweetalert2";

class AboutTubeParams extends Component {
    constructor(props) {
        super(props);
        this.myRefs = {};
        this.myRefs.tubeShellThickness = React.createRef();
        this.myRefs.tubeShellInnerHeight = React.createRef();

        this.myRefs.finsShape = React.createRef();
        this.myRefs.finsPoints = React.createRef();
        this.myRefs.finsNameID = React.createRef();

        this.myRefs.pinsPosition = React.createRef();
        this.myRefs.pinsShape = React.createRef();
        this.myRefs.pinsNameID = React.createRef();
    }

    render() {
        return (
            <div className={componentStyle["container"]}>
                <div className={componentStyle["tube-params-container"]}>
                    <div className={componentStyle["title"]}>PARAMETERS</div>
                    <div className={componentStyle["tube-params-wrap"]}>
                        <InputBox
                            ref={this.myRefs.tubeShellThickness}
                        >
                            Shell Thickness (um)
                        </InputBox>
                        <InputBox
                            ref={this.myRefs.tubeShellInnerHeight}
                        >
                            Shell Inner Height (um)
                        </InputBox>
                    </div>
                    <div className={componentStyle.buttons}>
                        <div onClick={this.onSubmitTube}>Submit</div>
                        <div onClick={this.onDeleteTube}>Delete</div>
                    </div>
                </div>
                <div className={componentStyle["fins-params-container"]}>
                    <div className={componentStyle["title"]}>PARAMETERS</div>
                    <div className={componentStyle["fins-params-wrap"]}>
                        <InputBox
                            ref={this.myRefs.finsShape}
                        >
                            Fins Shape (um) [w,h]
                        </InputBox>
                        <InputBox
                            ref={this.myRefs.finsPoints}
                        >
                            Fins Points (um)
                        </InputBox>
                        <InputBox
                            ref={this.myRefs.finsNameID}
                        >
                            nameID
                        </InputBox>
                    </div>
                    <div className={componentStyle.buttons}>
                        <div onClick={this.onSubmitFins}>Submit</div>
                        <div onClick={this.onDeleteFins}>Delete</div>
                    </div>
                </div>
                <div className={componentStyle["pins-params-container"]}>
                    <div className={componentStyle["title"]}>PARAMETERS</div>
                    <div className={componentStyle["pins-params-wrap"]}>
                        <InputBox
                            ref={this.myRefs.pinsPosition}
                        >
                            Pins Position (um) [x,y,z]
                        </InputBox>
                        <InputBox
                            ref={this.myRefs.pinsShape}
                        >
                            Pins Shape (um) [dx,dy,dz]
                        </InputBox>
                        <InputBox
                            ref={this.myRefs.pinsNameID}
                        >
                            nameID
                        </InputBox>
                    </div>
                    <div className={componentStyle.buttons}>
                        <div onClick={this.onSubmitPins}>Submit</div>
                        <div onClick={this.onDeletePins}>Delete</div>
                    </div>
                </div>
                <div className={componentStyle["button-container"]}>
                    <div className={componentStyle["btn"]} onClick={() => {
                        this.export();
                    }}>Export
                    </div>
                </div>
            </div>
        );
    }

    onSubmitTube = () => {
        if (this.props.tubeParams.length !== 0) {
            Swal.fire("You've created a shell object.");
            return;
        }
        if (this.props.wireParams.length === 0 || this.props.metalGasketParams.length === 0) {
            Swal.fire("You've not created wire or metal gasket.");
            return;
        }
        if (!this.judgeTubeParamsValid()) {
            Swal.fire("Parameters wrong.");
            return;
        }
        this.props.generateTube();
    }

    onDeleteTube = () => {
        if (this.props.tubeParams.length === 0) {
            Swal.fire("No shell to delete!");
        } else {
            this.props.deleteTubeFromScene();
            this.props.popTube();
            window.pyApi.popTube();
        }
    }

    onSubmitFins = () => {
        if (!this.judgeFinsParamsValid()) {
            Swal.fire("Parameters wrong.");
            return;
        }
        this.props.generateFins();
    }

    onDeleteFins = () => {
        if (this.props.finsParams.length === 0) {
            Swal.fire("No fins to delete!");
        } else {
            let latestParams = this.props.finsParams[this.props.finsParams.length - 1];
            let nameID = latestParams.nameID;
            this.props.deleteFinsFromScene();
            this.props.popFins();
            window.pyApi.popFins(nameID);
        }
    }

    onSubmitPins = () => {
        if (!this.judgePinsParamsValid()) {
            Swal.fire("Parameters wrong.");
            return;
        }
        this.props.generatePins();
    }

    onDeletePins = () => {
        if (this.props.pinsParams.length === 0) {
            Swal.fire("No pins to delete!");
        } else {
            let latestParams = this.props.pinsParams[this.props.pinsParams.length - 1];
            let nameID = latestParams.nameID;
            this.props.deletePinsFromScene();
            this.props.popPins();
            window.pyApi.popPins(nameID);
        }
    }

    export = () => {
        Swal.fire({
            title: 'Enter your path',
            input: 'text',
            inputLabel: 'Your path must exist',
            inputValue: "",
            showCancelButton: true,
            inputValidator: (value) => {
                if (!value) {
                    return 'You need to write something!'
                }
                let suffix = value.split(".")[value.split(".").length - 1];
                if (suffix !== "igs" && suffix !== "iges" && suffix !== "stp" && suffix !== "step") {
                    return "Suffix error."
                }
            }
        }).then((result) => {
            if (!result.isDismissed) {
                let path = result.value;
                let tubeNameIDList = this.props.tubeParams.length > 0 ? ["tube"] : [];
                let finsNameIDList = this.props.finsParams.map((params) => {
                    return params.nameID;
                });
                let pinsNameIDList = this.props.pinsParams.map((params) => {
                    return params.nameID;
                });
                let suffix = path.split(".")[path.split(".").length - 1];
                window.pyApi.saveOCCModule_TubePart(tubeNameIDList, finsNameIDList, pinsNameIDList, path, suffix);
            }
        });
    }

    judgeTubeParamsValid = () => {
        let ret = true;
        let shellThickness = parseFloat(this.myRefs.tubeShellThickness.current.value);
        let shellInnerHeight = parseFloat(this.myRefs.tubeShellInnerHeight.current.value);
        if (Number.isNaN(shellThickness) || Number.isNaN(shellInnerHeight)) {
            ret = false;
        }
        if (ret) {
            this.props.pushTubeParams({
                shellThickness: Math.abs(shellThickness),
                shellInnerHeight: Math.abs(shellInnerHeight)
            })
        }
        return ret;
    }

    judgeFinsParamsValid = () => {
        let ret = true;
        let finsShape = this.myRefs.finsShape.current.value.split(",");
        if (finsShape.length !== 2) {
            ret = false;
        } else {
            finsShape = finsShape.map((value) => {
                value = parseFloat(value);
                if (Number.isNaN(value)) {
                    ret = false;
                }
                return value;
            })
        }
        let finsPoints = this.myRefs.finsPoints.current.value.split("/");
        if (finsPoints.length !== 4) {
            ret = false;
        } else {
            finsPoints = finsPoints.map((value) => {
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
        this.props.finsParams.forEach((params) => {
            if (params.nameID === this.myRefs.finsNameID.current.value) {
                ret = false;
            }
        });
        if (ret) {
            this.props.pushFinsParams({
                nameID: this.myRefs.finsNameID.current.value,
                finsShape: finsShape,
                finsPoints: finsPoints,
            });
        }
        return ret;
    }

    judgePinsParamsValid = () => {
        let ret = true;
        let pinsPosition;
        if (this.getShapeOrPositionFromInput(this.myRefs.pinsPosition.current.value)[1]) {
            pinsPosition = this.getShapeOrPositionFromInput(this.myRefs.pinsPosition.current.value)[0];
        } else {
            ret = false;
        }
        let pinsShape;
        if (this.getShapeOrPositionFromInput(this.myRefs.pinsShape.current.value)[1]) {
            pinsShape = this.getShapeOrPositionFromInput(this.myRefs.pinsShape.current.value)[0];
        } else {
            ret = false;
        }
        this.props.pinsParams.forEach((params) => {
            if (params.nameID === this.myRefs.pinsNameID.current.value) {
                ret = false;
            }
        });
        if (ret) {
            this.props.pushPinsParams({
                nameID: this.myRefs.pinsNameID.current.value,
                pinsPosition: pinsPosition,
                pinsShape: pinsShape
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
        wireParams: state.wire.params,
        metalGasketParams: state.metalGasket.params,
        tubeParams: state.tube.params,
        pinsParams: state.pins.params,
        finsParams: state.fins.params
    }
};
const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        pushTubeParams: (params) => {
            dispatch({type: "pushTubeParams", data: params});
        },
        pushFinsParams: (params) => {
            dispatch({type: "pushFinsParams", data: params});
        },
        pushPinsParams: (params) => {
            dispatch({type: "pushPinsParams", data: params});
        },
        popTube: () => {
            dispatch({type: "popTube", data: {}});
        },
        popFins: () => {
            dispatch({type: "popFins", data: {}});
        },
        popPins: () => {
            dispatch({type: "popPins", data: {}});
        }
    }
};
export default connect(mapStateToProps, mapDispatchToProps)(AboutTubeParams);
import React, {Component} from 'react';
import componentStyle from "./index.module.css";
import {connect} from "react-redux"
import "pretty-checkbox";
import Swal from "sweetalert2";

class AboutWireExport extends Component {
    constructor(props) {
        super(props);
        this.wireNameID = this.props.wireParams.map((params) => {
            return params.nameID;
        });
        this.metalGasketNameID = this.props.metalGasketParams.map((params) => {
            return params.nameID;
        });
        this.mosCapacitanceNameID = [];
        for (let idx = 0; idx < ((this.metalGasketNameID.length % 2 === 0) ? this.metalGasketNameID.length / 2 : (this.metalGasketNameID.length - 1) / 2); idx++) {
            let nameID0 = this.metalGasketNameID[idx * 2] + "+" + this.metalGasketNameID[idx * 2 + 1] + "_0";
            let nameID1 = this.metalGasketNameID[idx * 2] + "+" + this.metalGasketNameID[idx * 2 + 1] + "_1";
            this.mosCapacitanceNameID.push(nameID0);
            this.mosCapacitanceNameID.push(nameID1);
        }

        this.wireNameIDToSave = {};
        this.metalGasketNameIDToSave = {};
        this.mosCapacitanceNameIDToSave = {};
    }

    componentDidMount() {
    }

    render() {
        return (
            <div className={componentStyle["container"]}>
                <div className={componentStyle["wire-nameID-list-container"]}>
                    <div className={componentStyle["title"]}>WIRE NAMEID</div>
                    <div className={componentStyle["wire-nameID-list-wrap"]}>
                        {this.wireNameID.map((nameID) => {
                            return (
                                <div className="pretty p-svg p-curve" key={nameID}>
                                    <input type="checkbox" onChange={(e) => {
                                        if (e.target.checked) {
                                            this.wireNameIDToSave[nameID] = nameID;
                                        } else {
                                            delete this.wireNameIDToSave[nameID];
                                        }
                                    }}/>
                                    <div className="state p-primary">
                                        <svg className="svg svg-icon" viewBox="0 0 20 20">
                                            <path
                                                d="M7.629,14.566c0.125,0.125,0.291,0.188,0.456,0.188c0.164,0,0.329-0.062,0.456-0.188l8.219-8.221c0.252-0.252,0.252-0.659,0-0.911c-0.252-0.252-0.659-0.252-0.911,0l-7.764,7.763L4.152,9.267c-0.252-0.251-0.66-0.251-0.911,0c-0.252,0.252-0.252,0.66,0,0.911L7.629,14.566z"
                                                style={{stroke: "white", fill: "white"}}></path>
                                        </svg>
                                        <label>{nameID}</label>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className={componentStyle["metal-gasket-nameID-list-container"]}>
                    <div className={componentStyle["title"]}>METAL GASKET NAMEID</div>
                    <div className={componentStyle["metal-gasket-nameID-list-wrap"]}>
                        {this.metalGasketNameID.map((nameID) => {
                            return (
                                <div className="pretty p-svg p-curve" key={nameID}>
                                    <input type="checkbox" onChange={(e) => {
                                        if (e.target.checked) {
                                            this.metalGasketNameIDToSave[nameID] = nameID;
                                        } else {
                                            delete this.metalGasketNameIDToSave[nameID];
                                        }
                                    }}/>
                                    <div className="state p-primary">
                                        <svg className="svg svg-icon" viewBox="0 0 20 20">
                                            <path
                                                d="M7.629,14.566c0.125,0.125,0.291,0.188,0.456,0.188c0.164,0,0.329-0.062,0.456-0.188l8.219-8.221c0.252-0.252,0.252-0.659,0-0.911c-0.252-0.252-0.659-0.252-0.911,0l-7.764,7.763L4.152,9.267c-0.252-0.251-0.66-0.251-0.911,0c-0.252,0.252-0.252,0.66,0,0.911L7.629,14.566z"
                                                style={{stroke: "white", fill: "white"}}></path>
                                        </svg>
                                        <label>{nameID}</label>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className={componentStyle["mos-capacitance-nameID-list-container"]}>
                    <div className={componentStyle["title"]}>MOS CAPACITANCE NAMEID</div>
                    <div className={componentStyle["mos-capacitance-nameID-list-wrap"]}>
                        {this.mosCapacitanceNameID.map((nameID) => {
                            return (
                                <div className="pretty p-svg p-curve" key={nameID}>
                                    <input type="checkbox" onChange={(e) => {
                                        if (e.target.checked) {
                                            this.mosCapacitanceNameIDToSave[nameID] = nameID;
                                        } else {
                                            delete this.mosCapacitanceNameIDToSave[nameID];
                                        }
                                    }}/>
                                    <div className="state p-primary">
                                        <svg className="svg svg-icon" viewBox="0 0 20 20">
                                            <path
                                                d="M7.629,14.566c0.125,0.125,0.291,0.188,0.456,0.188c0.164,0,0.329-0.062,0.456-0.188l8.219-8.221c0.252-0.252,0.252-0.659,0-0.911c-0.252-0.252-0.659-0.252-0.911,0l-7.764,7.763L4.152,9.267c-0.252-0.251-0.66-0.251-0.911,0c-0.252,0.252-0.252,0.66,0,0.911L7.629,14.566z"
                                                style={{stroke: "white", fill: "white"}}></path>
                                        </svg>
                                        <label>{nameID}</label>
                                    </div>
                                </div>
                            );
                        })}
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
                let suffix = path.split(".")[path.split(".").length - 1];
                window.pyApi.saveOCCModule_WirePart(Object.keys(this.wireNameIDToSave), Object.keys(this.metalGasketNameIDToSave), Object.keys(this.mosCapacitanceNameIDToSave), path, suffix);
            }
        });
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        wireParams: state.wire.params,
        metalGasketParams: state.metalGasket.params,
    }
}
const mapDispatchToProps = (dispatch, ownProps) => {
    return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(AboutWireExport);
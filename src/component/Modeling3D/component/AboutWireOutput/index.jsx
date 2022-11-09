import React, {Component} from 'react';
import componentStyle from "./index.module.css";
import {connect} from "react-redux";
import InputBox from "../../../InputBox";
import * as echarts from "echarts/core";
import Swal from "sweetalert2";
import barOption from "../../../../echartsOption/barOption";

class AboutWireOutput extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selfInductance: "",
            mutualInductanceList: {},
            totalInductance: "",
            spuriousImpedanceSingle: "",
            spuriousImpedanceTotal: "",
            QValue: "",
            mutualInductanceBetweenGroups: ""
        };
        this.myRefs = {};
        this.myRefs.group1 = React.createRef();
        this.myRefs.group2 = React.createRef();
    }

    componentDidMount() {
        this.outputeGraphEchartDom = echarts.init(this.outputGraphDom, "dark");
        window.addEventListener("resize", () => {
            this.outputeGraphEchartDom.resize();
        });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        let latestWireParams = this.props.paramsArray[this.props.paramsArray.length - 1];
        if (Object.keys(this.state.mutualInductanceList).length === latestWireParams.wireAmount) {
            let option = barOption;
            console.log(Object.keys(this.state.mutualInductanceList), Object.values(this.state.mutualInductanceList))
            option.xAxis[0].data = Object.keys(this.state.mutualInductanceList);
            option.series[0].data = Object.values(this.state.mutualInductanceList);
            option.xAxis[0].name = "Idx";
            option.yAxis[0].name = "Mutual Inductance";
            this.outputeGraphEchartDom.setOption(option);
        }
    }

    render() {
        return (
            <div className={componentStyle.container}>
                <div className={componentStyle["output-shower-single-group"]}>
                    <div className={componentStyle["title"]}>OUTPUT</div>
                    <div className={componentStyle["output-wrap-single-group"]}>
                        <InputBox value={this.state.selfInductance}>
                            Self Inductance (nH)
                        </InputBox>
                        <InputBox value={this.state.totalInductance}>
                            Total Inductance (nH)
                        </InputBox>
                        <InputBox value={this.state.spuriousImpedanceSingle}>
                            Spurious Impedance (Ω) (Single)
                        </InputBox>
                        <InputBox value={this.state.spuriousImpedanceTotal}>
                            Spurious Impedance (Ω) (Total)
                        </InputBox>
                        <InputBox value={this.state.QValue}>
                            Q Value
                        </InputBox>
                    </div>
                    <div className={componentStyle["btn"]} onClick={() => {
                        this.calcOutputSingleGroup();
                    }}>Calculate
                    </div>
                </div>
                <div className={componentStyle["output-graph-shower-single-group"]}>
                    <div className={componentStyle["title"]}>OUTPUT GRAPH</div>
                    <div
                        className={componentStyle["output-graph-wrap"]}
                        ref={(ref) => {
                            this.outputGraphDom = ref;
                        }}
                    ></div>
                </div>
                <div className={componentStyle["output-shower-between-groups"]}>
                    <div className={componentStyle["title"]}>OUTPUT</div>
                    <div className={componentStyle["output-wrap-between-groups"]}>
                        <InputBox
                            ref={this.myRefs.group1}
                            style={{gridArea: "1/1/2/2"}}
                        >
                            Group1
                        </InputBox>
                        <InputBox
                            ref={this.myRefs.group2}
                            style={{gridArea: "1/2/2/3"}}
                        >
                            Group2
                        </InputBox>
                        <InputBox
                            value={this.state.mutualInductanceBetweenGroups}
                            style={{gridArea: "2/1/3/3"}}
                        >
                            Mutual Inductance (nH)
                        </InputBox>
                    </div>
                    <div className={componentStyle["btn"]} onClick={() => {
                        this.calcOutputBetweenGroup();
                    }}>Calculate
                    </div>
                </div>
            </div>
        );
    }

    calcOutputSingleGroup = () => {
        if (this.props.paramsArray.length > 0) {
            let latestWireParams = this.props.paramsArray[this.props.paramsArray.length - 1];
            let {
                wireAmount,
                conductivity,
                frequency,
                points,
                wireGaps,
                wireRadius,
                permittivity,
                lossTangent
            } = latestWireParams;
            let calcFunction;
            if (points.length === 3) {
                calcFunction = window.pyApi.calc_output_single_from_three_points;
            } else if (points.length === 5) {
                calcFunction = window.pyApi.calc_output_single_from_five_points;
            } else {
                Swal.fire("points wrong");
                return;
            }

            let mutualInductanceList = {};
            for (let idx = 0; idx < wireAmount; idx++) {
                calcFunction(wireAmount, idx, conductivity, frequency, points, wireGaps,
                    wireRadius, permittivity, lossTangent).then((result) => {
                    let {self_inductance, mutual_inductance, loop_inductance, R_single, R_total, Q} = result;
                    mutualInductanceList[idx + 1] = mutual_inductance;
                    this.setState({
                        selfInductance: self_inductance.toExponential(3),
                        mutualInductanceList: mutualInductanceList,
                        totalInductance: loop_inductance.toExponential(3),
                        spuriousImpedanceSingle: R_single.toExponential(3),
                        spuriousImpedanceTotal: R_total.toExponential(3),
                        QValue: Q.toExponential(3),
                    });
                });
            }
        }
    }

    calcOutputBetweenGroup = () => {
        let group1NameID = this.myRefs.group1.current.value;
        let group2NameID = this.myRefs.group2.current.value;
        if (group1NameID === group2NameID) {
            Swal.fire("NameID must be different.");
            return;
        }
        let group1Params;
        let group2Params;
        this.props.paramsArray.forEach((params) => {
            if (params.nameID === group1NameID) {
                group1Params = params;
            }
            if (params.nameID === group2NameID) {
                group2Params = params;
            }
        });
        if (group1Params && group2Params) {
            window.pyApi.calc_mutual_inductance_between_groups(group1Params.wireAmount, group2Params.wireAmount,
                group1Params.points, group2Params.points, group1Params.wireGaps, group2Params.wireGaps,
                group1Params.wireRadius, group2Params.wireRadius).then((result) => {
                this.setState({
                    mutualInductanceBetweenGroups: result.toExponential(3)
                });
            });
        } else {
            Swal.fire("NameID does not exist.");
            return;
        }
    }
}


const
    mapStateToProps = (state, ownProps) => {
        return {
            paramsArray: state.wire.params,
        };
    };
const
    mapDispatchToProps = (dispatch, ownProps) => {
        return {};
    };
export default connect(mapStateToProps, mapDispatchToProps)

(
    AboutWireOutput
)
;
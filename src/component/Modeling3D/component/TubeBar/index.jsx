import React, {Component} from "react";
import componentStyle from "./index.module.css";
import MyNavLink from "../../../MyNavLink";

export default class TubeBar extends Component {
    render() {
        return <div className={componentStyle.container}>
            <MyNavLink
                path="/3DModeling/tube/params"
                text="Params"
                style={{textAlign: "center", fontSize: "80%"}}
                activeClassName={componentStyle.activeNav}
            />
        </div>;
    }
}

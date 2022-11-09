import React, {Component} from "react";
import componentStyle from "./index.module.css";
import MyNavLink from "../../../MyNavLink";

class WireBar extends Component {
    render() {
        return (
            <div className={componentStyle.container}>
                <MyNavLink
                    path="/3DModeling/wire/params"
                    text="Params"
                    style={{textAlign: "center", fontSize: "80%"}}
                    activeClassName={componentStyle.activeNav}
                />
                <MyNavLink
                    path="/3DModeling/wire/output"
                    text="Output"
                    style={{textAlign: "center", fontSize: "80%"}}
                    activeClassName={componentStyle.activeNav}
                />
                <MyNavLink
                    path="/3DModeling/wire/export"
                    text="Export"
                    style={{textAlign: "center", fontSize: "80%"}}
                    activeClassName={componentStyle.activeNav}
                />
            </div>
        );
    }
}

export default WireBar;
import React, {Component} from "react";
import componentStyle from "./index.module.css";
import MyNavLink from "../../../MyNavLink";

class SelectBar extends Component {
    render() {
        return (
            <div className={componentStyle.container}>
                <MyNavLink
                    style={{textAlign: "center", fontSize: "90%"}}
                    path="/3DModeling/wire"
                    text="WIRE"
                    activeClassName={componentStyle.activeNav}
                />
                <MyNavLink
                    style={{textAlign: "center", fontSize: "90%"}}
                    path="/3DModeling/tube"
                    text="TUBE"
                    activeClassName={componentStyle.activeNav}
                />
            </div>
        );
    }
}

export default SelectBar;
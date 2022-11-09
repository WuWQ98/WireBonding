import React, { Component } from "react";
import componentStyle from "./index.module.css";
import { NavLink } from "react-router-dom";

export default class index extends Component {
  render() {
    return (
      <div className={componentStyle.container}>
        <div>{this.props.icon}</div>
        <NavLink
          style={this.props.style}
          className={componentStyle["nav-link"]}
          to={this.props.path}
          activeClassName={this.props.activeClassName}
        >
          <span>{this.props.text}</span>
        </NavLink>
      </div>
    );
  }
}

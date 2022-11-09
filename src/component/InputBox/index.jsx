import React, {Component} from "react";
import componentStyle from "./index.module.css";

// export default class InputBox extends Component {
//   render() {
//     return (
//       <div style={this.props.style} className={componentStyle.container}>
//         <div className={componentStyle.label}>{this.props.children}</div>
//         <input
//           readOnly={this.props.readOnly}
//           placeholder={this.props.placeholder}
//         ></input>
//       </div>
//     );
//   }
// }

const InputBox = React.forwardRef((props, ref) => {
    return (
        <div style={props.style} className={componentStyle.container}>
            <div className={componentStyle.label}>{props.children}</div>
            <input
                ref={ref}
                readOnly={props.readonly}
                placeholder={props.placeholder}
                value={props.value}
                onChange={props.onChange}
            ></input>
        </div>
    );
});

export default InputBox;

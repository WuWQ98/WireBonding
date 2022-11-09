import "./App.css";
import React from "react";
import {Provider} from "react-redux";
import store from "./redux/store";
import {HashRouter as Router, Route, Redirect} from "react-router-dom";
import LeftNavArea from "./component/LeftNavArea";
import Modeling3D from "./component/Modeling3D";

class App extends React.Component {
    render() {
        return (
            <Provider store={store}>
                <Router>
                    <div className="App">
                        <div className="navigation">
                            <LeftNavArea/>
                        </div>
                        <div>
                            <Route path="/3DModeling" component={Modeling3D}></Route>
                            <Redirect to="/3DModeling/wire"/>
                        </div>
                    </div>
                </Router>
            </Provider>
        );
    }
}

export default App;

const initState = {
    wire: {
        params: [],
        points: [],
        modules: []
    },
    metalGasket: {
        params: [],
        modules: []
    },
    mosCapacitance: {
        modules: []
    },
    tube: {
        params: [],
        modules: []
    },
    pins: {
        params: [],
        modules: []
    },
    fins: {
        params: [],
        modules: []
    }
};

export default function reducer(state = initState, action) {
    switch (action.type) {
        case "pushWireParams":
            state.wire.params.push(action.data);
            return state;
        case "pushWirePoints":
            state.wire.points.push(action.data);
            return state;
        case "pushWireModule":
            state.wire.modules.push(action.data);
            return state;
        case "pushMetalGasketParams":
            state.metalGasket.params.push(action.data);
            return state;
        case "pushMetalGasketModule":
            state.metalGasket.modules.push(action.data);
            return state;
        case "pushMosCapacitanceModule":
            state.mosCapacitance.modules.push(action.data);
            return state;
        case "pushTubeParams":
            state.tube.params.push(action.data);
            return state;
        case "pushFinsParams":
            state.fins.params.push(action.data);
            return state;
        case "pushPinsParams":
            state.pins.params.push(action.data);
            return state;
        case "pushTubeModule":
            state.tube.modules.push(action.data);
            return state;
        case "pushFinsModule":
            state.fins.modules.push(action.data);
            return state;
        case "pushPinsModule":
            state.pins.modules.push(action.data);
            return state;
        case "popWire":
            state.wire.params.pop();
            state.wire.points.pop();
            state.wire.modules.pop();
            return state;
        case "popMetalGasket":
            if (state.metalGasket.params.length % 2 === 0) {
                state.mosCapacitance.modules.pop();
                state.mosCapacitance.modules.pop();
            }
            state.metalGasket.params.pop();
            state.metalGasket.modules.pop();
            return state;
        case "popTube":
            state.tube.params.pop();
            state.tube.modules.pop();
            return state;
        case "popFins":
            state.fins.params.pop();
            state.fins.modules.pop();
            return state;
        case "popPins":
            state.pins.params.pop();
            state.pins.modules.pop();
            return state;
        default:
            return state;
    }
}

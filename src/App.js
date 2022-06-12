/**
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 * App.js
 *
 * Basic react app container.  Handles state for the app and
 * propagation for state changes into the non-react map
 */

import { find, debounce, findIndex, filter } from "lodash";
import React from "react";
import ReactJson from "react-json-view";
import Loader from "react-loader-spinner";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import ReactModal from "react-modal";
import Select from "react-select";

import { GetRoutes, getCacheKey } from "./Algos";
import { algoOptions, metroOptions } from "./Data";
import { computeRoutesDirectionsJsSDK } from "./DirectionsJsSDK";
import Map from "./Map";
import { getQueryStringValue, setQueryStringValue } from "./queryString";
import { RouteCharts } from "./RouteCharts";
import { computeRoutesPreferred } from "./RoutesPreferred";

let keyboardListener;
ReactModal.setAppElement("#root");

class App extends React.Component {
  constructor(props) {
    super(props);

    function getDefault(collection, urlKey) {
      let defaultSelection = collection[0];
      const urlVal = getQueryStringValue(urlKey);
      if (urlVal) {
        const selectionFromURL = find(collection, { value: urlVal });
        if (selectionFromURL) {
          defaultSelection = selectionFromURL;
        }
      }
      console.log("returning defaultSelection for ", urlKey, defaultSelection);
      return defaultSelection;
    }

    this.state = {
      algoOptions: [...algoOptions],
      selectedMetroOption: getDefault(metroOptions, "metro"),
      selectedAlgoOption: getDefault(algoOptions, "algo"),
      showSpinner: true,
      regenData: false,
      showEditor: false,
      chartData: {
        latencyData: [],
        durationData: [],
        distanceData: [],
      },
      jsonContent: {
        value: "create_your_algo_name",
        label: "Create your label",
        method: "e.g. RoutesPreferred or DirectionsJsSDK",
        travelMode: "e.g. DRIVE (or DRIVING if using DirectionsJsSDK)",
        routingPreference: "e.g. TRAFFIC_AWARE",
        numRoutes: 10,
        numWaypoints: 2,
        options: {},
      },
    };

    if (!keyboardListener) {
      keyboardListener = document.addEventListener(
        "keydown",
        debounce((event) => {
          if (this.state.showEditor) return;
          console.log(
            `Key: ${event.key} with keycode ${event.keyCode} has been pressed`
          );
          const curAlgoIdx = findIndex(this.state.algoOptions, {
            value: this.state.selectedAlgoOption.value,
          });
          console.log("gots curAlgoIdx", curAlgoIdx);
          if (
            event.key == "ArrowDown" &&
            curAlgoIdx < this.state.algoOptions.length - 1
          ) {
            console.log("new Alog", this.state.algoOptions[curAlgoIdx + 1]);
            this.handleAlgoChange(this.state.algoOptions[curAlgoIdx + 1]);
          }
          if (event.key == "ArrowUp" && curAlgoIdx > 0) {
            console.log("new Alog", this.state.algoOptions[curAlgoIdx - 1]);
            this.handleAlgoChange(this.state.algoOptions[curAlgoIdx - 1]);
          }
        }),
        50
      );
    }

    this.handleMetroChange = (selectedMetroOption) => {
      this.setState({ showSpinner: true, selectedMetroOption }, () => {
        setQueryStringValue("metro", this.state.selectedMetroOption.value);
      });
    };

    this.handleAlgoChange = (selectedAlgoOption) => {
      this.setState({ showSpinner: true, selectedAlgoOption }, () => {
        setQueryStringValue("algo", this.state.selectedAlgoOption.value);
      });
    };

    this.regenerateData = () => {
      this.setState({ showSpinner: true, regenData: true });
    };

    this.openEditor = () => {
      this.setState({ showEditor: true });
    };

    this.closeEditor = () => {
      this.setState({ showEditor: false });
    };

    this.submitJson = () => {
      // TODO: Perform more validation
      const customObject = this.state.jsonContent;
      const value = customObject.value;
      if (find(this.state.algoOptions, { value: value })) {
        alert(
          "Algo value " +
            value +
            " already in use. Please create a different value."
        );
        return;
      }

      const label = customObject.label || customObject.value;
      const travelMode = customObject.travelMode;
      const routingPreference = customObject.routingPreference;
      const options = customObject.options || {};
      const numRoutes = customObject.numRoutes || 1;
      const numWaypoints = customObject.numWaypoints;
      let computeFn;
      if (customObject.method == "RoutesPreferred") {
        computeFn = async (pairs) =>
          computeRoutesPreferred(pairs, travelMode, routingPreference, options);
      } else if (customObject.method == "DirectionsJsSDK") {
        computeFn = async (pairs) =>
          computeRoutesDirectionsJsSDK(pairs, travelMode, options);
      } else {
        alert(
          "Please enter either 'RoutesPreferred' or 'DirectionsJsSDK' for method."
        );
        return;
      }
      const newAlgoOption = {
        enabled: true,
        value: value,
        label: label,
        numRoutes: numRoutes,
        numWaypoints: numWaypoints,
        compute: computeFn,
      };
      algoOptions.push(newAlgoOption);
      this.setState(
        {
          showEditor: false,
          showSpinner: true,
          algoOptions: [...this.state.algoOptions, newAlgoOption],
          selectedAlgoOption: newAlgoOption,
        },
        () => {
          setQueryStringValue("algo", newAlgoOption.value);
        }
      );
    };

    this.onJsonChange = (content) => {
      this.setState({ jsonContent: content.updated_src });
    };

    this.onChartDataUpdate = (chartData) => {
      this.setState((prevState) => {
        return {
          selectedMetroOption: prevState.selectedMetroOption,
          selectedAlgoOption: prevState.selectedAlgoOption,
          showSpinner: false,
          regenData: false,
          chartData: {
            latencyData: chartData.latencyData,
            distanceData: chartData.distanceData,
            durationData: chartData.durationData,
          },
        };
      });
    };

    this.downloadData = async () => {
      const metro = this.state.selectedMetroOption.value;
      const algo = this.state.selectedAlgoOption.value;
      const algoDefinition = find(this.state.algoOptions, { value: algo });
      const fileName =
        getCacheKey(metro, algo, algoDefinition.numRoutes) + ".json";
      const text = JSON.stringify(await GetRoutes({}, metro, algo));
      let element = document.createElement("a");
      element.setAttribute(
        "href",
        "data:text/plain;charset=utf-8," + encodeURIComponent(text)
      );
      element.setAttribute("download", fileName);

      element.style.display = "none";
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
    };
  }

  render() {
    return (
      <div>
        <div style={{ width: "100%" }}>
          <ReactModal
            isOpen={this.state.showEditor}
            contentLabel="Minimal Modal Example"
          >
            <ReactJson
              src={this.state.jsonContent}
              onEdit={this.onJsonChange}
              onAdd={this.onJsonChange}
              onDelete={this.onJsonChange}
            />
            <button onClick={this.closeEditor}>Cancel</button>
            <button onClick={this.submitJson}>OK</button>
          </ReactModal>
          <Select
            value={this.state.selectedAlgoOption}
            onChange={this.handleAlgoChange}
            options={filter(this.state.algoOptions, { enabled: true })}
          />
          <div style={{ width: "300px", float: "left" }}>
            <Select
              value={this.state.selectedMetroOption}
              onChange={this.handleMetroChange}
              options={filter(metroOptions, { enabled: true })}
            />
            <button onClick={this.regenerateData}>Regenerate</button>
            <button onClick={this.openEditor}>Custom Algo</button>

            <Loader
              type="Audio"
              color="#00BFFF"
              height={100}
              width={100}
              timeout={60000} //60 secs
              visible={this.state.showSpinner}
            />
            <RouteCharts
              hideCharts={this.state.showSpinner}
              chartData={this.state.chartData}
            />
            <button onClick={this.downloadData}>Download</button>
          </div>
        </div>
        <div style={{ marginLeft: "300px" }}>
          <Map
            metro={this.state.selectedMetroOption.value}
            algo={this.state.selectedAlgoOption.value}
            regenData={this.state.regenData}
            onChartDataUpdate={this.onChartDataUpdate}
          />
        </div>
      </div>
    );
  }
}

export { App as default };

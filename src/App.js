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
import React from "react";
import Map from "./Map";
import Select from "react-select";
import { algoOptions, metroOptions } from "./Data";
import { find, debounce, findIndex, filter } from "lodash";
import { RouteCharts } from "./RouteCharts";
import Loader from "react-loader-spinner";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import { GetRoutes, getCacheKey } from "./Algos";
import { getQueryStringValue, setQueryStringValue } from "./queryString";
import JSONInput from "react-json-editor-ajrm/index";
import locale from "react-json-editor-ajrm/locale/en";
import ReactModal from "react-modal";

let keyboardListener;

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
    };

    if (!keyboardListener) {
      keyboardListener = document.addEventListener(
        "keydown",
        debounce((event) => {
          console.log(
            `Key: ${event.key} with keycode ${event.keyCode} has been pressed`
          );
          const curAlgoIdx = findIndex(algoOptions, {
            value: this.state.selectedAlgoOption.value,
          });
          console.log("gots curAlgoIdx", curAlgoIdx);
          if (event.key == "ArrowDown" && curAlgoIdx < algoOptions.length - 1) {
            console.log("new Alog", algoOptions[curAlgoIdx + 1]);
            this.handleAlgoChange(algoOptions[curAlgoIdx + 1]);
          }
          if (event.key == "ArrowUp" && curAlgoIdx > 0) {
            console.log("new Alog", algoOptions[curAlgoIdx - 1]);
            this.handleAlgoChange(algoOptions[curAlgoIdx - 1]);
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
      const algoDefinition = find(algoOptions, { value: algo });
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
            <JSONInput
              theme="light_mitsuketa_tribute"
              locale={locale}
              colors={{
                string: "#DAA520", // overrides theme colors with whatever color value you want
              }}
              height="550px"
            />
            <button onClick={this.closeEditor}>Close Editor</button>
          </ReactModal>
          <Select
            value={this.state.selectedAlgoOption}
            onChange={this.handleAlgoChange}
            options={filter(algoOptions, { enabled: true })}
          />
          <div style={{ width: "300px", float: "left" }}>
            <Select
              value={this.state.selectedMetroOption}
              onChange={this.handleMetroChange}
              options={filter(metroOptions, { enabled: true })}
            />
            <button onClick={this.regenerateData}>Regenerate</button>
            <button onClick={this.openEditor}>JSON Editor</button>

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

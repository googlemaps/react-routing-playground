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

import { debounce, find, filter } from "lodash";
import React from "react";
import Loader from "react-loader-spinner";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import Select from "react-select";

import { GetRoutes } from "./dataModel/algoFns";
import { addAlgo, updateAlgo, deleteAlgo } from "./dataModel/algoModel";
import { metroOptions } from "./dataModel/data";
import JsonEditor from "./JsonEditor";
import Map from "./Map";
import { getQueryStringValue, setQueryStringValue } from "./utils/queryString";
import { RouteCharts } from "./RouteCharts";

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

    let allAlgos = { ...props.algos };
    let selectedAlgoId = Object.keys(allAlgos)[0];
    const urlAlgoStr = getQueryStringValue("algo");
    if (urlAlgoStr) {
      const { id, newAlgos } = addAlgo(allAlgos, JSON.parse(urlAlgoStr));
      allAlgos = newAlgos;
      selectedAlgoId = id;
    }

    this.state = {
      algos: allAlgos,
      selectedAlgoId: selectedAlgoId,
      selectedMetroOption: getDefault(metroOptions, "metro"),
      showSpinner: true,
      regenData: false,
      showEditor: false,
      editMode: "add",
      chartData: {
        latencyData: [],
        durationData: [],
        distanceData: [],
      },
      jsonContent: {},
    };

    if (!keyboardListener) {
      keyboardListener = document.addEventListener(
        "keydown",
        debounce((event) => {
          if (this.state.showEditor) return;
          console.log(
            `Key: ${event.key} with keycode ${event.keyCode} has been pressed`
          );
          const algoIds = Object.keys(this.state.algos);
          const curAlgoIdx = algoIds.indexOf(this.state.selectedAlgoId);
          console.log("gots curAlgoIdx", curAlgoIdx);
          if (event.key == "ArrowDown" && curAlgoIdx < algoIds.length - 1) {
            console.log("new Algo", this.state.algos[algoIds[curAlgoIdx + 1]]);
            this.handleAlgoChange({ value: algoIds[curAlgoIdx + 1] });
          }
          if (event.key == "ArrowUp" && curAlgoIdx > 0) {
            console.log("new Algo", this.state.algos[algoIds[curAlgoIdx - 1]]);
            this.handleAlgoChange({ value: algoIds[curAlgoIdx - 1] });
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

    this.handleAlgoChange = (algoOption) => {
      const algoId = algoOption.value;
      this.setState({ showSpinner: true, selectedAlgoId: algoId }, () => {
        setQueryStringValue("algo", JSON.stringify(this.state.algos[algoId]));
      });
    };

    this.regenerateData = () => {
      this.setState({ showSpinner: true, regenData: true });
    };

    this.openEditor = (mode) => {
      this.setState({ showEditor: true, editMode: mode });
    };

    this.closeEditor = () => {
      this.setState({ showEditor: false });
    };

    this.deleteSelectedOption = () => {
      // Avoid the scenario where we would have empty algos
      if (Object.keys(this.state.algos).length <= 1) return;

      const { newAlgos } = deleteAlgo(
        this.state.algos,
        this.state.selectedAlgoId
      );
      const defaultId = Object.keys(newAlgos)[0];
      this.setState(
        {
          algos: newAlgos,
          selectedAlgoId: defaultId,
        },
        () => {
          setQueryStringValue(
            "algo",
            JSON.stringify(this.state.algos[this.state.selectedAlgoId])
          );
        }
      );
    };

    this.submitJson = (content) => {
      // TODO: Perform more validation
      if (
        content.api !== "RoutesPreferred" &&
        content.api !== "DirectionsJsSDK"
      ) {
        alert(
          "Please enter either 'RoutesPreferred' or 'DirectionsJsSDK' for api."
        );
        return;
      }

      const { id, newAlgos } =
        this.state.editMode == "add"
          ? addAlgo(this.state.algos, content)
          : updateAlgo(this.state.algos, this.state.selectedAlgoId, content);

      this.setState(
        {
          showEditor: false,
          showSpinner: true,
          algos: newAlgos,
          selectedAlgoId: id,
        },
        () => {
          setQueryStringValue("algo", JSON.stringify(content));
        }
      );
    };

    this.onChartDataUpdate = (chartData) => {
      this.setState({
        showSpinner: false,
        regenData: false,
        chartData: {
          latencyData: chartData.latencyData,
          latencyMean: chartData.latencyMean,
          distanceData: chartData.distanceData,
          distanceMean: chartData.distanceMean,
          durationData: chartData.durationData,
          durationMean: chartData.durationMean,
        },
      });
    };

    this.downloadData = async () => {
      const metro = this.state.selectedMetroOption.value;
      const algoId = this.state.selectedAlgoId;
      const algoDefinition = this.state.algos[algoId];
      const fileName = `${metro}_${algoId}_route.json`;
      const text = JSON.stringify(await GetRoutes({}, metro, algoDefinition));
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
    const selectAlgoOptions = Object.entries(this.state.algos).map(
      ([algoId, algoDefinition]) => ({
        value: algoId,
        label: algoDefinition.name,
      })
    );
    const selectedOption = find(selectAlgoOptions, {
      value: this.state.selectedAlgoId,
    });

    return (
      <div>
        <div>
          <JsonEditor
            isOpen={this.state.showEditor}
            initialJson={this.state.algos[this.state.selectedAlgoId]}
            onSubmit={this.submitJson}
            onCancel={this.closeEditor}
          />
        </div>
        <div style={{ width: "300px", float: "left" }}>
          <Select
            value={selectedOption}
            onChange={this.handleAlgoChange}
            options={selectAlgoOptions}
          />
          <button onClick={() => this.openEditor("add")}>Add</button>
          <button onClick={() => this.openEditor("edit")}>Edit</button>
          <button onClick={this.deleteSelectedOption}>Delete</button>
          <Select
            value={this.state.selectedMetroOption}
            onChange={this.handleMetroChange}
            options={filter(metroOptions, { enabled: true })}
          />
          <button onClick={this.regenerateData}>Regenerate</button>
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
        <div style={{ marginLeft: "300px" }}>
          <Map
            metro={this.state.selectedMetroOption.value}
            algoId={this.state.selectedAlgoId}
            algoDefinition={this.state.algos[this.state.selectedAlgoId]}
            regenData={this.state.regenData}
            onChartDataUpdate={this.onChartDataUpdate}
          />
        </div>
      </div>
    );
  }
}

export { App as default };

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
 * RouteCharts.js
 *
 * Basic react app container.  Handles state for the app and
 * propagation for state changes into the non-react map
 */
import React from "react";
import Chart from "react-google-charts";

class RouteCharts extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (this.props.hideCharts) {
      return <div></div>;
    }
    if (this.props.chartData.durationData.length === 1) {
      return <div>No data -- routing method not supported in this region?</div>;
    }
    return (
      <div>
        <Chart
          width={"300px"}
          height={"250px"}
          chartType="Histogram"
          loader={<div>Loading Chart</div>}
          data={this.props.chartData.durationData}
          options={{
            title: "Route Duration (seconds)",
            legend: { position: "none" },
            histogram: {
              minValue: 0,
              maxValue: 1000,
            },
          }}
          rootProps={{ "data-testid": "3" }}
        />
        <Chart
          width={"300px"}
          height={"250px"}
          chartType="Histogram"
          loader={<div>Loading Chart</div>}
          data={this.props.chartData.distanceData}
          options={{
            title: "Route Length (meters)",
            legend: { position: "none" },
            histogram: {
              minValue: 0,
              maxValue: 5000,
            },
          }}
          rootProps={{ "data-testid": "2" }}
        />
        <Chart
          width={"300px"}
          height={"250px"}
          chartType="Histogram"
          loader={<div>Loading Chart</div>}
          data={this.props.chartData.latencyData}
          options={{
            title: "Request Latency (milliseconds)",
            legend: { position: "none" },
            histogram: {
              minValue: 0,
              maxValue: 3000,
              maxNumBuckets: 100,
              bucketSize: 30,
              lastBucketPercentile: 5,
            },
          }}
          rootProps={{ "data-testid": "1" }}
        />
      </div>
    );
  }
}

export { RouteCharts };

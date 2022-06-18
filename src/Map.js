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
 * Map.js
 *
 * Uses the react-wrapper to make using google maps js sdk
 * easier in react.  Beyond basic loading doesn't pretend to
 * act like a normal react component.
 */
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { useEffect, useRef } from "react";
import { GetRoutes, GetChartData } from "./dataModel/algoFns";
import { debounce } from "lodash";
import { fitToMetroBounds } from "./dataModel/data";

const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
let googleMap;
let shownPolys = [];
let shownMarkers = [];

const render = (status) => {
  if (status === Status.LOADING) return <h3>{status} ..</h3>;
  if (status === Status.FAILURE) return <h3>{status} ...</h3>;
  return null;
};

/*
 * Creates the map object using a journeySharing location
 * provider.
 */
function initializeMapObject(element) {
  return new google.maps.Map(element, {
    center: { lat: -34.397, lng: 150.644 },
    zoom: 8,
  });
}

function MyMapComponent({
  metro,
  algoId,
  algoDefinition,
  regenData,
  onChartDataUpdate,
}) {
  const ref = useRef();

  /*
   * Handler for timewindow change.  Updates global min/max date globals
   * and recomputes the paths as well as all the bubble markers to respect the
   * new date values.
   *
   * Debounced to every 100ms as a blance between performance and reactivity when
   * the slider is dragged.
   */
  const onStateChangeDebounced = debounce(async (regenerate = false) => {
    if (!window.google) {
      // not loaded yet?
      return;
    }
    console.log("State changed", metro, algoId);
    shownPolys.forEach((poly) => poly.setMap(null));
    shownMarkers.forEach((marker) => marker.setMap(null));
    shownMarkers = [];
    let routes = await GetRoutes(googleMap, metro, algoDefinition, regenerate);
    shownPolys = routes.map((route) => {
      const routePath = route.getPath();
      const poly = new google.maps.Polyline({
        path: route.getPath(),
        strokeColor: "#000000",
        strokeOpacity: routes.length > 10 ? 0.15 : 0.5,
        strokeWeight: 5,
        icons: [
          {
            icon: startSymbol,
            offset: "0%",
          },
          {
            icon: {
              path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 4,
              strokeWeight: 2,
            },

            offset: "50%",
          },
          {
            icon: endSymbol,
            offset: "100%",
          },
        ],
      });
      poly.setMap(googleMap);
      google.maps.event.addListener(poly, "mouseover", () => {
        poly.setOptions({
          strokeOpacity: 0.75,
          strokeWeight: 8,
          strokeColor: "#00FFc0",
        });
      });
      google.maps.event.addListener(poly, "mouseout", () => {
        poly.setOptions({
          strokeOpacity: 0.25,
          strokeColor: "#000000",
          strokeWeight: 5,
        });
      });
      const waypoints = route.getWaypointMarkers();
      if (waypoints.length > 1) {
        waypoints.map((markerLoc, idx) => {
          shownMarkers.push(
            new google.maps.Marker({
              position: markerLoc,
              // Humans like to start with 1
              label: (idx + 1).toString(),
              map: googleMap,
            })
          );
        });
        shownMarkers.push(
          new google.maps.Marker({
            position: routePath[0],
            label: "S",
            map: googleMap,
          })
        );
        shownMarkers.push(
          new google.maps.Marker({
            position: routePath[routePath.length - 1],
            label: "F",
            map: googleMap,
          })
        );
      }
      return poly;
    });

    onChartDataUpdate(await GetChartData(googleMap, metro, algoDefinition));
  }, 100);

  useEffect(() => {
    console.log("Gots apikey", apiKey);
    googleMap = initializeMapObject(ref.current);

    // Polygons should really have a getBounds method (v2 maps did).
    // See https://stackoverflow.com/questions/3284808/getting-the-bounds-of-a-polyline-in-google-maps-api-v3
    // We later use this to zoom the map to metro areas based on the bounds
    // of the polygons in Data.js
    if (!google.maps.Polygon.prototype.getBounds) {
      google.maps.Polygon.prototype.getBounds = function () {
        let bounds = new google.maps.LatLngBounds();
        let paths = this.getPaths();
        let path;
        for (let i = 0; i < paths.getLength(); i++) {
          path = paths.getAt(i);
          for (let ii = 0; ii < path.getLength(); ii++) {
            bounds.extend(path.getAt(ii));
          }
        }
        return bounds;
      };
    }
  }, []);

  useEffect(() => {
    console.log("on metro change", metro);
    if (window.google && window.google.maps) {
      fitToMetroBounds(googleMap, metro);
    }
    onStateChangeDebounced();
  }, [metro]);

  useEffect(() => {
    console.log("on algo change", algoId);
    onStateChangeDebounced();
  }, [algoId, algoDefinition]);

  useEffect(() => {
    if (regenData) {
      console.log("regenerating data for current algo / metro");
      onStateChangeDebounced(/*regenerate =*/ true);
    }
  }, [regenData]);

  return <div ref={ref} id="map" style={{ height: "1024px" }} />;
}

function Map(props) {
  return (
    <Wrapper
      apiKey={apiKey}
      render={render}
      version="beta"
      libraries={["geometry", "journeySharing"]}
    >
      <MyMapComponent
        metro={props.metro}
        algoId={props.algoId}
        algoDefinition={props.algoDefinition}
        regenData={props.regenData}
        onChartDataUpdate={props.onChartDataUpdate}
      />
    </Wrapper>
  );
}

const startSymbol = {
  path: "M -2,0 0,-2 2,0 0,2 z",
  strokeColor: "#F00",
  fillColor: "#F00",
  fillOpacity: 1,
  strokeWeight: 2,
  scale: 3,
};

const endSymbol = {
  path: "M -2,0 0,-2 2,0 0,2 z",
  strokeColor: "#00F000",
  fillColor: "#00F000",
  fillOpacity: 1,
  strokeWeight: 2,
  scale: 3,
};

/*
const endSymbol = {
  path: "M -2,-2 2,2 M 2,-2 -2,2",
  strokeColor: "#292",
  strokeWeight: 4,
};
*/

export { Map as default };

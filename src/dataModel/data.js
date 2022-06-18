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
 * Data.js
 *
 */
import { times, find } from "lodash";
import { randLatLngInPolygon } from "../utils/random";

// bounding polys generated manually in https://developers.google.com/maps/documentation/utilities/polylineutility
const metroOptions = [
  {
    enabled: true,
    value: "San_Fran_Neighorhood",
    label: "Corona Heights & Surrounds",
    paths: [
      [
        { lat: 37.77506, lng: -122.46034 },
        { lat: 37.77594, lng: -122.4246 },
        { lat: 37.75345, lng: -122.42667 },
        { lat: 37.75352, lng: -122.46083 },
      ],
    ],
  },
  {
    enabled: true,
    value: "San_Francisco",
    label: "San Francisco Bay Area",
    paths: [
      [
        { lat: 37.78271, lng: -122.51799 },
        { lat: 37.81146, lng: -122.48161 },
        { lat: 37.80766, lng: -122.39166 },
        { lat: 37.66049, lng: -122.36625 },
        { lat: 37.65723, lng: -122.51045 },
      ],
      [
        { lat: 37.78079, lng: -122.33536 },
        { lat: 37.74823, lng: -122.26051 },
        { lat: 37.80358, lng: -122.17262 },
        { lat: 37.93368, lng: -122.27081 },
        { lat: 37.94366, lng: -122.40618 },
        { lat: 37.90195, lng: -122.38558 },
        { lat: 37.90141, lng: -122.32447 },
        { lat: 37.83202, lng: -122.29838 },
      ],
      [
        { lat: 37.82624, lng: -122.38064 },
        { lat: 37.80698, lng: -122.36966 },
        { lat: 37.8101, lng: -122.3597 },
        { lat: 37.81485, lng: -122.36279 },
        { lat: 37.81309, lng: -122.36828 },
        { lat: 37.81607, lng: -122.37051 },
        { lat: 37.82204, lng: -122.36245 },
        { lat: 37.83275, lng: -122.37137 },
      ],
      [
        { lat: 37.85614, lng: -122.57997 },
        { lat: 37.81736, lng: -122.5089 },
        { lat: 37.83391, lng: -122.46702 },
        { lat: 37.85533, lng: -122.47663 },
        { lat: 37.87023, lng: -122.49448 },
        { lat: 37.88107, lng: -122.51611 },
        { lat: 37.89299, lng: -122.49757 },
        { lat: 37.86183, lng: -122.45809 },
        { lat: 37.88053, lng: -122.44024 },
        { lat: 37.90783, lng: -122.47499 },
        { lat: 37.87017, lng: -122.57627 },
      ],
    ],
  },
  {
    enabled: true,
    value: "Seattle",
    label: "Seattle",
    paths: [
      [
        { lat: 47.59221, lng: -122.3925 },
        { lat: 47.57275, lng: -122.42271 },
        { lat: 47.48373, lng: -122.36778 },
        { lat: 47.45217, lng: -122.37739 },
        { lat: 47.40014, lng: -122.32246 },
        { lat: 47.40293, lng: -122.0478 },
        { lat: 47.59961, lng: -122.1247 },
        { lat: 47.68196, lng: -122.12058 },
        { lat: 47.74387, lng: -122.17689 },
        { lat: 47.74018, lng: -122.26203 },
        { lat: 47.70323, lng: -122.22907 },
        { lat: 47.64589, lng: -122.19749 },
        { lat: 47.63387, lng: -122.24006 },
        { lat: 47.61258, lng: -122.23731 },
        { lat: 47.58016, lng: -122.19337 },
        { lat: 47.49858, lng: -122.21259 },
        { lat: 47.53846, lng: -122.27439 },
        { lat: 47.61906, lng: -122.29087 },
        { lat: 47.7448, lng: -122.29499 },
        { lat: 47.75127, lng: -122.36881 },
        { lat: 47.66163, lng: -122.41138 },
        { lat: 47.63572, lng: -122.40451 },
        { lat: 47.61073, lng: -122.3386 },
        { lat: 47.57924, lng: -122.36057 },
      ],
      [
        { lat: 47.71063, lng: -122.55146 },
        { lat: 47.64683, lng: -122.50476 },
        { lat: 47.5811, lng: -122.48142 },
        { lat: 47.59962, lng: -122.54459 },
        { lat: 47.59314, lng: -122.57206 },
        { lat: 47.70416, lng: -122.56519 },
      ],
      [
        { lat: 47.52363, lng: -122.54871 },
        { lat: 47.50786, lng: -122.50888 },
        { lat: 47.45032, lng: -122.54184 },
        { lat: 47.46796, lng: -122.65995 },
        { lat: 47.53198, lng: -122.64209 },
        { lat: 47.5848, lng: -122.56519 },
      ],
    ],
  },
  {
    enabled: true,
    value: "Jakarta",
    label: "Jakarta",
    paths: [
      [
        { lat: -6.09407, lng: 106.70003 },
        { lat: -6.12684, lng: 106.81676 },
        { lat: -6.10363, lng: 106.96645 },
        { lat: -6.29067, lng: 107.05983 },
        { lat: -6.39713, lng: 106.9225 },
        { lat: -6.33299, lng: 106.73299 },
        { lat: -6.21149, lng: 106.6245 },
      ],
    ],
  },
];

function getMetroPolygon(map, metro, showMetroPolygon) {
  const paths = find(metroOptions, { value: metro }).paths;

  console.log("generating orig/dest for metro", metro, paths);
  const metroPolygon = new window.google.maps.Polygon({
    paths: paths,
    strokeColor: "#FF0000",
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: "#FF0000",
    fillOpacity: 0.35,
  });

  if (showMetroPolygon) {
    metroPolygon.setMap(map);
  }
  return metroPolygon;
}

function fitToMetroBounds(map, metro) {
  const metroPolygon = getMetroPolygon(map, metro, false);
  const metroBounds = metroPolygon.getBounds();
  map.fitBounds(metroBounds);
}

function getOriginDestinationPairs(map, metro, numRoutes, numWaypoints) {
  const showMetroPolygon = false; // useful for debugging
  const metroPolygon = getMetroPolygon(map, metro, showMetroPolygon);
  const randFn = randLatLngInPolygon(metroPolygon);
  const routes = times(numRoutes, () => {
    const origin = randFn();
    const destination = randFn();
    const waypoints = times(numWaypoints, randFn);
    return {
      origin,
      destination,
      waypoints,
    };
  });
  return routes;
}

export { metroOptions, getOriginDestinationPairs, fitToMetroBounds };

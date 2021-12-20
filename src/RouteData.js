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

import { sumBy } from "lodash";
class RouteData {
  constructor(
    encodedPoly,
    distance,
    duration,
    requestLatency,
    waypointMarkers
  ) {
    this.encodedPoly = encodedPoly;
    const path = google.maps.geometry.encoding.decodePath(this.encodedPoly);
    this.distance = distance;
    this.duration = duration;
    this.requestLatency = requestLatency;
    this.waypointMarkers = waypointMarkers;
    this.polylinePath = path.map((p) => {
      return {
        lat: p.lat(),
        lng: p.lng(),
      };
    });
  }

  static create(routeResult, requestLatency) {
    // Ideally we'd just save the whole result -- but local storage
    // has a relatively small limit
    const route = routeResult.routes[0];
    const waypointMarkers = route.legs.map((leg) => {
      const loc = leg.end_location;
      return [loc.lat(), loc.lng()];
    });
    // The overview polyline starts to lose detail on
    // routes with > 25 waypoints, so assemble a detailed
    // polyline from the individual leg segments
    const path = [];
    route.legs.forEach((leg) => {
      leg.steps.forEach((step) => {
        const stepPath = google.maps.geometry.encoding.decodePath(
          step.polyline.points
        );
        stepPath.forEach((p) => path.push(p));
      });
    });
    return new RouteData(
      google.maps.geometry.encoding.encodePath(path),
      sumBy(route.legs, "distance.value"), // meters
      sumBy(route.legs, "duration.value"), // seconds
      requestLatency,
      waypointMarkers
    );
  }

  static createFromRoutesPreferred(result, requestLatency) {
    const route = result.data.routes[0];
    const waypointMarkers = route.legs.map((leg) => {
      const latLng = leg.endLocation.latLng;
      return [latLng.latitude, latLng.longitude];
    });
    return new RouteData(
      route.polyline.encodedPolyline,
      route.distanceMeters,
      route.duration,
      requestLatency,
      waypointMarkers
    );
  }

  getPath() {
    return this.polylinePath;
  }

  getWaypointMarkers() {
    if (!this.waypointMarkers) {
      return [];
    }
    return this.waypointMarkers.map((wpm) => {
      return {
        lat: wpm[0],
        lng: wpm[1],
      };
    });
  }

  static toJSON(routes) {
    return JSON.stringify(
      routes.map((r) => {
        return {
          encodedPoly: r.encodedPoly,
          distance: r.distance,
          duration: r.duration,
          requestLatency: r.requestLatency,
          waypointMarkers: r.waypointMarkers,
        };
      })
    );
  }

  static fromParsedJson(routesData) {
    return routesData.map(
      (d) =>
        new RouteData(
          d.encodedPoly,
          d.distance,
          d.duration,
          d.requestLatency,
          d.waypointMarkers
        )
    );
  }

  static fromJSON(routesJSON) {
    const routesData = JSON.parse(routesJSON);
    return RouteData.fromParsedJson(routesData);
  }
}

export { RouteData };

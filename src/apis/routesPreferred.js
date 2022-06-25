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

import axios from "axios";
import { RouteData } from "../dataModel/routeData";
const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

async function calcRoute(
  origin,
  destination,
  waypoints,
  travelMode,
  routingPreference,
  options
) {
  const timeBefore = Date.now();
  let config = {
    method: "post",
    url: "https://routespreferred.googleapis.com/v1:computeRoutes",
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs.end_location",
    },
    data: {
      intermediates: waypoints.map((wp) => {
        return {
          vehicleStopover: true,
          location: {
            latLng: {
              latitude: wp.lat,
              longitude: wp.lng,
            },
          },
        };
      }),
      origin: {
        location: {
          latLng: {
            latitude: origin.lat,
            longitude: origin.lng,
          },
        },
      },
      destination: {
        location: {
          latLng: {
            latitude: destination.lat,
            longitude: destination.lng,
          },
        },
      },
      travelMode: travelMode,
      routingPreference: routingPreference,
      polylineQuality: "OVERVIEW",
      computeAlternativeRoutes: false,
      routeModifiers: {
        avoidTolls: options.avoidTolls,
        avoidHighways: options.avoidHighways,
        avoidFerries: false,
      },
      languageCode: "en-US",
      units: "IMPERIAL",
    },
  };

  const result = await axios(config);
  const timeAfter = Date.now();
  if (result.data.routes) {
    // sometimes no route returned
    return RouteData.createFromRoutesPreferred(result, timeAfter - timeBefore);
  }
}

//Intentionally generates routes serially ... to avoid high QPS issues
async function computeRoutesPreferred(
  pairs,
  travelMode,
  routingPreference,
  options = {}
) {
  let pair;
  let paths = [];
  while ((pair = pairs.shift())) {
    try {
      const result = await calcRoute(
        pair.origin,
        pair.destination,
        pair.waypoints,
        travelMode,
        routingPreference,
        options
      );
      if (result) {
        // sometimes there aren't routes
        paths.push(result);
      }
    } catch (err) {
      alert(`Server error: ${err.message}`);
      return paths;
    }
  }
  return paths;
}

export { computeRoutesPreferred };

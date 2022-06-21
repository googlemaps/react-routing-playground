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

const cache = {};
import { getOriginDestinationPairs } from "./data";
import { RouteData } from "./routeData";
import { computeRoutesDirectionsJsSDK } from "../apis/directionsJsSDK";
import { computeRoutesPreferred } from "../apis/routesPreferred";

function getCacheKey(metro, algoDefinition) {
  return `${metro}_${JSON.stringify(algoDefinition)}_route`;
}

function getComputeFn(algoDefinition) {
  let computeFn;
  if (algoDefinition.api === "RoutesPreferred") {
    computeFn = async (pairs) =>
      computeRoutesPreferred(
        pairs,
        algoDefinition.travelMode,
        algoDefinition.routingPreference,
        algoDefinition.options
      );
  } else if (algoDefinition.api === "DirectionsJsSDK") {
    computeFn = async (pairs) =>
      computeRoutesDirectionsJsSDK(
        pairs,
        algoDefinition.travelMode,
        algoDefinition.options
      );
  } else {
    throw `Unknown algo api: ${algoDefinition.api}. Expected either RoutesPreferred or DirectionsJsSDK`;
  }
  return computeFn;
}

async function fetchData(cacheKey) {
  let result;
  try {
    result = await fetch(`${cacheKey}.json`, {
      headers: {
        Accept: "application/json",
      },
    });
  } catch (err) {
    console.log("failed", err);
    return;
  }
  return await result.json();
}

async function GetRoutes(map, metro, algoDefinition, clearCache = false) {
  const computeFn = getComputeFn(algoDefinition);
  const numRoutes = algoDefinition.numRoutes;
  const numWaypoints = algoDefinition.numWaypoints || 0;
  const pairs = getOriginDestinationPairs(map, metro, numRoutes, numWaypoints);
  const resultKey = getCacheKey(metro, algoDefinition);

  if (clearCache) {
    // Remove any existing data stored in the cache object or local storage.
    delete cache[resultKey];
    localStorage.removeItem(resultKey);
  }

  if (algoDefinition.offline) {
    const fetchedData = await fetchData(resultKey);
    cache[resultKey] = RouteData.fromParsedJson(fetchedData);
  }

  if (!cache[resultKey]) {
    const ls = localStorage.getItem(resultKey);
    if (ls) {
      cache[resultKey] = RouteData.fromJSON(ls);
    }
  }
  if (!cache[resultKey]) {
    cache[resultKey] = await computeFn(pairs);
    localStorage.setItem(resultKey, RouteData.toJSON(cache[resultKey]));
  }
  return cache[resultKey];
}

async function GetChartData(map, metro, algoDefinition) {
  // assumes that GetRoutes has already computed
  // and cached the data in memory.
  const resultKey = getCacheKey(metro, algoDefinition);
  const data = cache[resultKey];
  const latencyData = data.map((entry, idx) => [
    "req #" + idx,
    entry.requestLatency,
  ]);
  latencyData.unshift(["Latency", "ms"]);

  const durationData = data.map((entry, idx) => [
    "req #" + idx,
    parseInt(entry.duration),
  ]);
  durationData.unshift(["Duration", "sec"]);

  const distanceData = data.map((entry, idx) => [
    "req #" + idx,
    entry.distance,
  ]);
  distanceData.unshift(["Distance", "meters"]);

  return {
    latencyData: latencyData,
    durationData: durationData,
    distanceData: distanceData,
  };
}

export { GetRoutes, GetChartData };

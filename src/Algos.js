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
import { getOriginDestinationPairs } from "./Data";
import { RouteData } from "./RouteData";
import { algoOptions } from "./Data";
import { find } from "lodash";

function getCacheKey(metro, algo, numRoutes, numWaypoints) {
  return `${metro}_${algo}_${numRoutes}_${numWaypoints}_route`;
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

async function GetRoutes(map, metro, algo, clearCache = false) {
  const algoDefinition = find(algoOptions, { value: algo });
  const computeFn = algoDefinition.compute;
  const numRoutes = algoDefinition.numRoutes;
  const numWaypoints = algoDefinition.numWaypoints || 0;
  const pairs = getOriginDestinationPairs(map, metro, numRoutes, numWaypoints);
  const resultKey = getCacheKey(metro, algo, numRoutes, numWaypoints);

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

async function GetChartData(map, metro, algo) {
  // assumes that GetRoutes has already computed
  // and cached the data in memory.
  const algoDefinition = find(algoOptions, { value: algo });
  const numRoutes = algoDefinition.numRoutes;
  const numWaypoints = algoDefinition.numWaypoints || 0;
  const resultKey = getCacheKey(metro, algo, numRoutes, numWaypoints);
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

export { GetRoutes, GetChartData, getCacheKey };

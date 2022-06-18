let nextAlgoId = 0;

/**
 * Generates seed algo definition data.
 * @returns Seed data for algo definitions.
 */
function seedAlgos() {
  return {
    rp: {
      name: "Routes Preferred - traffic unaware",
      numRoutes: 100,
      api: "RoutesPreferred",
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_UNAWARE",
    },
    rp_traffic_aware: {
      name: "Route Preferred - traffic aware",
      numRoutes: 100,
      api: "RoutesPreferred",
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_AWARE",
    },
    rp_traffic_aware_optimal: {
      name: "Route Preferred - traffic aware optimal",
      numRoutes: 100,
      api: "RoutesPreferred",
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_AWARE_OPTIMAL",
    },
    rp_bicycle: {
      name: "Route Preferred - bicycle",
      numRoutes: 100,
      api: "RoutesPreferred",
      travelMode: "BICYCLE",
    },
    rp_twowheeler: {
      name: "Route Preferred - two wheeler",
      numRoutes: 100,
      api: "RoutesPreferred",
      travelMode: "TWO_WHEELER",
    },
    rp_avoid_highway: {
      name: "Route Preferred - avoid highway",
      numRoutes: 100,
      api: "RoutesPreferred",
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_AWARE",
      options: {
        avoidHighways: true,
      },
    },
    rp_avoid_tolls: {
      name: "Route Preferred - avoid tolls",
      numRoutes: 100,
      api: "RoutesPreferred",
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_AWARE",
      options: {
        avoidTolls: true,
      },
    },
    rp_25_waypoints: {
      name: "Route Preferred - 25 waypoints",
      numRoutes: 1,
      numWaypoints: 25,
      api: "RoutesPreferred",
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_AWARE",
    },
    directions_25_waypoints: {
      name: "Directions - 25 waypoints",
      numRoutes: 1,
      numWaypoints: 25,
      api: "DirectionsJsSDK",
      travelMode: "DRIVING",
    },
    directions_25_waypoints_optimized: {
      name: "Directions - 25 waypoints (optimized)",
      numRoutes: 1,
      numWaypoints: 25,
      api: "DirectionsJsSDK",
      travelMode: "DRIVING",
      options: {
        optimizeWaypoints: true,
      },
    },
    directions: {
      name: "Directions - Driving",
      // Directions hits quota issues w/ more than 15
      numRoutes: 15,
      api: "DirectionsJsSDK",
      travelMode: "DRIVING",
    },
    directions_bicycle: {
      name: "Directions - Bike",
      numRoutes: 15,
      api: "DirectionsJsSDK",
      travelMode: "BICYCLING",
    },
    directions_avoid_highway: {
      name: "Directions - Avoid Highways",
      numRoutes: 15,
      api: "DirectionsJsSDK",
      travelMode: "DRIVING",
      options: {
        avoidHighways: true,
      },
    },
    directions_avoid_tolls: {
      name: "Directions - Avoid Tolls",
      numRoutes: 15,
      api: "DirectionsJsSDK",
      travelMode: "DRIVING",
      options: {
        avoidTolls: true,
      },
    },
  };
}

/**
 * Adds an algo definition to existing algos.
 * @param {Object} algos - The existing algos.
 * @param {Object} algoDefinition - The new algo to add.
 * @returns A new algos object that contains the original and new definitions.
 */
function addAlgo(algos, algoDefinition) {
  const id = `custom_algo_${nextAlgoId++}`;
  return {
    id: id,
    newAlgos: {
      ...algos,
      [id]: algoDefinition,
    },
  };
}

/**
 * Updates an existing algo definition.
 * @param {*} algos - The existing algos.
 * @param {*} id - The id of the algo to update.
 * @param {*} algoDefinition - The new algo definition to update to.
 * @returns A new algos object with the updated definition.
 */
function updateAlgoForId(algos, id, algoDefinition) {
  // Todo: Maybe throw exception if id cannot be found.
  return {
    id: id,
    newAlgos: {
      ...algos,
      [id]: algoDefinition,
    },
  };
}

export { seedAlgos, addAlgo, updateAlgoForId };

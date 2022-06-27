let nextAlgoId = 0;

/**
 * Generates seed algo definition data.
 * @returns Seed data for algo definitions.
 */
async function seedAlgos() {
  try {
    const result = await fetch("seedAlgos.json", {
      headers: {
        Accept: "application/json",
      },
    });
    return await result.json();
  } catch (err) {
    console.log(`${err.name}: ${err.message}`);
    return;
  }
}

/**
 * Adds an algo definition given existing algos.
 *
 * @param {Object} algos - The existing algos.
 * @param {Object} algoDefinition - The new algo to add.
 * @returns The id created and a new algos object that contains the original and new definitions.
 */
function addAlgo(algos, algoDefinition) {
  let id = `custom_algo_${nextAlgoId++}`;
  return {
    id: id,
    newAlgos: {
      ...algos,
      [id]: algoDefinition,
    },
  };
}

/**
 * Updates an algo definition given existing algos.
 *
 * @param {Object} algos - The existing algos.
 * @param {string} id - The id of the existing algo to update.
 * @param {Object} algoDefinition - The algo to add.
 * @returns The id that was updated and a new algos object that contains the original and updated definitions.
 */
function updateAlgo(algos, id, algoDefinition) {
  return {
    id: id,
    newAlgos: {
      ...algos,
      [id]: algoDefinition,
    },
  };
}

/**
 * Deletes an algo definition from the existing algos.
 *
 * @param {Object} algos - The existing algos.
 * @param {string} id - The id of the existing algo to delete.
 * @returns The id that was deleted and a new algos object that contains the original definitions minus the one deleted.
 */
function deleteAlgo(algos, id) {
  const newAlgos = { ...algos };
  delete newAlgos[id];
  return {
    id: id,
    newAlgos: newAlgos,
  };
}

export { seedAlgos, addAlgo, updateAlgo, deleteAlgo };

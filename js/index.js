// Logica para resetear la página cuando se presione el banner
const btnSearch = document.querySelector(`#btn-search`);
const inputSearch = document.querySelector(`#pokemon`);
const clearBtn = document.querySelector(`#btn-clear`);
const pokemonCard = document.querySelector(`#pokemon-card`);
const btnEvolution = document.querySelector(`#btn-evolution`);
let contEvolutions = 1;

btnEvolution.addEventListener("click", async (event) => {
  let evolution = event.target
    .getAttribute("class")
    .split("poke-")
    .pop()
    .trim()
    .split(",");
  let nextEvolution = evolution.shift().trim();
  await evolutionPokemon(nextEvolution, evolution);
});

// Lógica para limpiar el botón de búsqueda
clearBtn.addEventListener("click", () => {
  inputSearch.value = ``;
  pokemonCard.classList.add("hidden");
  inputSearch.focus();
});

// Tomamos el contenido del form en el momento en el que se le da click al boton de submit
btnSearch.addEventListener(`click`, async (event) => {
  event.preventDefault();
  const pokemonName = inputSearch.value.toLowerCase().trim();

  if (pokemonName === ``) return alert(`Debes ingresar un nombre de pokemon`);

  try {
    inputSearch.value = ``;
    const pokemonData = await getPokemon(pokemonName);

    // Verificamos si puede evolucionar
    let evolutionName = await validateEvolution(pokemonData.id);

    const pokemon = {
      name: pokemonData.name,
      sprite: pokemonData.sprites.front_default,
      description: `${pokemonData.name} es un pokemon de tipo '${pokemonData.types[0].type.name}'`,
      moves: pokemonData.moves.map((move) => move.move.name).splice(0, 5), //tomamos solo 5 movimientos.
      skills: pokemonData.stats.map(
        (skill) => `${skill.stat.name}: ${skill.base_stat}`
      ),
      evolution: evolutionName,
    };
    generatePokemonCard(pokemon);
  } catch (error) {
    alert(`No se ha encontrado el pokemon: ${pokemonName}`);
    throw new Error(`Error al consultar los datos del pokemon: ${pokemonName}`);
  }
});

const getPokemon = async (pokemonName) => {
  const resp = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
  if (resp.ok) return await resp.json();
  else alert(`No se ha encontrado el pokemon: ${pokemonName}`);
};

const generatePokemonCard = ({
  name,
  sprite,
  description,
  moves,
  skills,
  evolution,
}) => {
  if (evolution == name || evolution == "") {
    btnEvolution.classList.add("hidden");
    btnEvolution.classList.forEach((classValue) => {
      if (classValue.includes("poke")) {
        btnEvolution.classList.remove(classValue);
      }
    });
  } else {
    btnEvolution.classList.add(`poke-${evolution}`);
    btnEvolution.classList.remove("hidden");
  }

  let pokemonName = document.querySelector(`.pokemon-name`);
  name = name.charAt(0).toUpperCase() + name.slice(1);
  pokemonName.innerHTML = `<strong>Nombre: </strong> ${name}`;

  let pokemonSprite = document.querySelector(`.pokemon-sprite`);
  pokemonSprite.src = sprite;

  let pokemonDescription = document.querySelector(`.pokemon-description`);
  pokemonDescription.innerHTML = `<strong>Descripción: </strong> ${description}`;

  let pokemonMoves = document.querySelector(`.pokemon-moves`);
  pokemonMoves.innerHTML = `<strong>Movimientos: </strong> ${moves.join(", ")}`;

  let pokemonSkills = document.querySelector(`.pokemon-skills`);
  pokemonSkills.innerHTML = `<strong>Habilidades: </strong> ${skills.join(
    ", "
  )}`;

  pokemonCard.classList.remove("hidden");
};

const validateEvolution = async (pokemonId) => {
  try {
    const resp = await fetch(
      `https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`
    );
    const data = await resp.json();
    const evolutionUrl = data.evolution_chain.url;
    const respEvolution = await fetch(evolutionUrl);
    const dataEvolution = await respEvolution.json();

    // si no existe el array de evoluciones retornamos unicamente el nombre del pokemon
    if (dataEvolution.chain.evolves_to.length === 0) {
      const evolutionArray = [dataEvolution.chain.species.name];
      return evolutionArray;
    }

    // array de posibles evoluciones
    if (dataEvolution.chain.evolves_to.length === 1) {
      const evolutionArray = [
        dataEvolution.chain.evolves_to[0].evolves_to[0].species.name,
      ];
      return evolutionArray;
    }
    const evolutionArray = dataEvolution.chain.evolves_to.map(
      (evolution) => evolution.species.name
    );
    //aliminamos el primer elemento del array
    return evolutionArray;
  } catch (error) {
    throw new Error(
      `Error al consultar la evolución del pokemon: ${pokemonId}`
    );
  }
};

const evolutionPokemon = async (pokemonName, evolutions) => {
  try {
    const envolvedPokemon = await getPokemon(pokemonName);

    // Verificamos si puede evolucionar nuevamente
    // let evolutionName = await validateEvolution(envolvedPokemon.id);
    const pokemon = {
      name: envolvedPokemon.name,
      sprite: envolvedPokemon.sprites.front_default,
      description: `${envolvedPokemon.name} es un pokemon de tipo '${envolvedPokemon.types[0].type.name}'`,
      moves: envolvedPokemon.moves.map((move) => move.move.name).splice(0, 5), //tomamos solo 5 movimientos.
      skills: envolvedPokemon.stats.map(
        (skill) => `${skill.stat.name}: ${skill.base_stat}`
      ),
      evolution: evolutions,
    };

    generatePokemonCard(pokemon);
  } catch (error) {
    throw new Error(`Error al consultar los datos del pokemon: ${pokemonName}`);
  }
};

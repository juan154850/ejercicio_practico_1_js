// Logica para resetear la página cuando se presione el banner
const btnSearch = document.querySelector(`#btn-search`);
const inputSearch = document.querySelector(`#pokemon`);
const clearBtn = document.querySelector(`#btn-clear`);
const pokemonCard = document.querySelector(`#pokemon-card`);

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
    const evolutionName = await validateEvolution(pokemonData.id);

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
    throw new Error(`Error al consultar los datos del pokemos: ${pokemonName}`);
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
  const btnEvolution = document.querySelector(`#btn-evolution`);
  if (evolution === name) {
    btnEvolution.classList.add("hidden");
  } else {
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
  console.log(name, sprite, description, moves, skills, evolution);
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
    // Retornamos el nombre de la evolución para comparar posteriormente si es el mismo pokemon
    return dataEvolution.chain.species.name;
  } catch (error) {
    throw new Error(
      `Error al consultar la evolución del pokemon: ${pokemonId}`
    );
  }
};

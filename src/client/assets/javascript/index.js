
// The store will hold all information needed globally
const store = {
  track_id: undefined,
  player_id: undefined,
  race_id: undefined,
};


// list of racer names
const racerName = {
  "Racer 1": "Mario",
  "Racer 2": "Yoshi",
  "Racer 3": "Peach",
  "Racer 4": "Toad",
  "Racer 5": "Luigi",
}


// list of track names
const trackName = {
  "Track 1": "Rainbow Road",
  "Track 2": "DK Mountain",
  "Track 3": "Yoshi Valley",
  "Track 4": "Bowser's Castle",
  "Track 5": "Royal Raceway",
  "Track 6": "Banshee Boardwalk",
}

// Updatestore function
const updateStore = (store, newState) => {
  store = Object.assign(store, newState);
};

// We need our javascript to wait until the DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  onPageLoad();
  setupClickHandlers();
});

async function onPageLoad() {
  try {
    getTracks().then((tracks) => {
      const html = renderTrackCards(tracks);
      renderAt("#tracks", html);
    });

    getRacers().then((racers) => {
      const html = renderRacerCars(racers);
      renderAt("#racers", html);
    });
  } catch (error) {
    console.log("Problem getting tracks and racers ::", error.message);
    console.error(error);
  }
}

function setupClickHandlers() {
  document.addEventListener(
    "click",
    function (event) {
      const { target } = event;

      // Race track form field
      if (target.matches(".card.track")) {
        handleSelectTrack(target);
      }

      // Podracer form field
      if (target.matches(".card.podracer")) {
        handleSelectPodRacer(target);
      }

      // Submit create race form
      if (target.matches("#submit-create-race")) {
        event.preventDefault();

        // start race
        handleCreateRace();
      }

      // Handle acceleration click
      if (target.matches("#gas-peddle")) {
        handleAccelerate(target);
      }
    },
    false
  );
}

async function delay(ms) {
  try {
    return await new Promise((resolve) => setTimeout(resolve, ms));
  } catch (error) {
    console.log("an error shouldn't be possible here");
    console.log(error);
  }
}


// This async function controls the flow of the race, add the logic and error handling
async function handleCreateRace() {
  // render starting UI

  try {
    // 
    const track_id = store.track_id;
    const player_id = store.player_id;
    console.log(track_id);
    console.log(player_id);

    if (!track_id) {
      alert("Please choose your track");
      return;
    }

    if (!player_id) {
      alert("Please choose a player");
      return;
    }

    // invokes the API call to create the race, then saves the result
    const race = await createRace(track_id, player_id);
    console.log(race);

    renderAt("#race", renderRaceStartView(race.Track));

    // updates the store with the race id


    updateStore(store, {race_id: race.ID - 1});
    console.log(store);
    
    // starts the countdown
    await runCountdown();

    // calls the async function startRace
    await startRace(store.race_id);

    // calls the async function runRace
    await runRace(store.race_id);
  } catch (error) {
    console.log("We were unable to create your race");
    console.log(error);
  }
}

function runRace(raceID) {
  return new Promise((resolve) => {
    // setInterval method gets race info every 500ms
    const interval = setInterval( () => {
      const currentRace =  getRace(raceID);
      console.log(currentRace);
      return currentRace
      .then(currentRace => {
// if the race info status property is "in-progress" or "finished", update the leaderboard 
        if (currentRace.status === "in-progress") {
          renderAt("#leaderBoard", raceProgress(currentRace.positions));
        } else if (currentRace.status === "finished") {
          clearInterval(interval);
          renderAt("#race", resultsView(currentRace.positions)); // to render the results view
          resolve(currentRace); // resolve the promise
        }
        
      }).catch((err) =>
      console.log("There was a problem getting your race", err)
    );
    
  }, 500);
}
)
}

async function runCountdown() {
  try {
    // counts down once per second
    await delay(1000);
    let timer = 3;

    return new Promise((resolve) => {
      // decrements countdown for user
      let interval = setInterval(() => {
        document.getElementById("big-numbers").innerHTML = --timer;
      
        if (timer <= 0) {
          clearInterval(interval);
          resolve(console.log("Completed"));
        }
      
      }, 1000);
    });
  } catch (error) {
    console.log(error);
  }
}

function handleSelectPodRacer(target) {
  console.log("selected a pod", target.id);

  // removes class selected from all racer options
  const selected = document.querySelector("#racers .selected");
  if (selected) {
    selected.classList.remove("selected");
  }

  // adds class selected to current target
  target.classList.add("selected");

  // saves the selected racer to the store

  updateStore(store, {player_id: target.id});

}

function handleSelectTrack(target) {
  console.log("selected a track", target.id);

  // removes class selected from all track options
  const selected = document.querySelector("#tracks .selected");
  if (selected) {
    selected.classList.remove("selected");
  }

  // add class selected to current target
  target.classList.add("selected");
console.log(selected);
  // saves the selected track id to the store

 updateStore(store, {track_id: target.id});
 console.log(store);
}

function handleAccelerate() {
  console.log("accelerate button clicked");

  const player_id = store.player_id;
  //  Invokes the API call to accelerate
  accelerate(store.race_id).then(() => console.log("accelerate button clicked")).catch(error => console.log(error));
}

// HTML VIEWS ------------------------------------------------

// renders racer card array
function renderRacerCars(racers) {
  if (!racers.length) {
    return `
			<h4>Loading Racers...</4>
		`;
  }

  const results = racers.map(renderRacerCard).join("");

  return `
		<ul id="racers">
			${results}
		</ul>
	`;
}

// renders racer cards
function renderRacerCard(racer) {
  const { id, driver_name, top_speed, acceleration, handling } = racer;

  return `
		<li class="card podracer" id="${id}">
			<h3>${racerName[driver_name]}<span><img class='racer-icon' src='/assets/images/${racerName[driver_name]}.png'> </span></h3>
			<p>Top Speed: ${top_speed}</p>
			<p>Acceleration: ${acceleration}</p>
			<p>Handling: ${handling}</p>
		</li>
	`;
}

function renderTrackCards(tracks) {
  if (!tracks.length) {
    return `
			<h4>Loading Tracks...</4>
		`;
  }

  const results = tracks.map(renderTrackCard).join("");

  return `
		<ul id="tracks">
			${results}
		</ul>
	`;
}


// renders track cards
function renderTrackCard(track) {
  const { id, name } = track;

  return `
		<li id="${id}" class="card track">
			<h3>${trackName[name]}</h3>
      <img class="trackcard-images" src="/assets/images/${trackName[name]}.jpg" alt="${trackName[name]}">
		</li>
	`;
}

function renderCountdown(count) {
  return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`;
}

// renders the start of the race after countdown finishes
function renderRaceStartView(track, racers) {

  return `
		<header>
			<h1>Race: ${trackName[track.name]} </h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>

			<section id="accelerate">
				<h2>Directions</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle">Click Me To Win!</button>
			</section>
		</main>
		<footer></footer>
	`;
}

// logic for race positioning
function resultsView(positions) {
  positions.sort((a, b) => (a.final_position > b.final_position ? 1 : -1));

  return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main>
			${raceProgress(positions)}
			<a href="/race">Start a new race</a>
		</main>
	`;
}

function raceProgress(positions) {


  const userPlayer = positions.find((e) => e.id === parseInt(store.player_id));
  userPlayer.driver_name[racerName[name]] += " (you)";

  positions = positions.sort((a, b) => (a.segment > b.segment ? -1 : 1));
  let count = 1;

  const results = positions.map((p) => {
    // if (p.id === parseInt(store.player_id)) {
    //   return `
		// 	<tr>
		// 		<td>
		// 			<h3>${count++} - ${p.driver_name}<span>  <img class='progress-racer-icon' src='/assets/images/${p.driver_name}.png'>
    //       </span></h3>
		// 		</td>
		// 	</tr>
		// `;
    // } else
    return `
			<tr>
				<td>
					<h3>${count++} - ${racerName[p.driver_name]} <span>  <img class='racer-icon' src='/assets/images/${racerName[p.driver_name]}.png'>
            </span></h3>
				</td>
			</tr>
		`;
  });

  return `
		<main>
			<h3>Leaderboard</h3>
			<section id="leaderBoard">
				${results.join("")}
			</section>
		</main>
	`;
}

function renderAt(element, html) {
  const node = document.querySelector(element);

  node.innerHTML = html;
}



// API CALLS ------------------------------------------------

const SERVER = "http://localhost:8000";

function defaultFetchOpts() {
  return {
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": SERVER,
    },
  };
}

// fetch call for tracks

function getTracks() {
  return fetch(`${SERVER}/api/tracks`, {
    method: "GET",
    ...defaultFetchOpts(),
  })
    .then((res) => res.json())
    .catch((err) => console.log("Problem with tracks request::", err));
}


// fetch call for racers
function getRacers() {
  return fetch(`${SERVER}/api/cars`, {
    method: "GET",
    ...defaultFetchOpts(),
  })
    .then((res) => res.json())
    .catch((err) => console.log("Problem with cars request::", err));
}


// post request for creating race based on selected tracks and players
function createRace(player_id, track_id) {
  player_id = parseInt(player_id);
  track_id = parseInt(track_id);
  const body = { player_id, track_id };

  return fetch(`${SERVER}/api/races`, {
    method: "POST",
    ...defaultFetchOpts(),
    dataType: "jsonp",
    body: JSON.stringify(body),
  })
    .then((res) => res.json())
    .catch((err) => console.log("Problem with createRace request::", err));
}

// GET request for race
function getRace(id) {
  return fetch(`${SERVER}/api/races/${id}`, {
    method: "GET",
    ...defaultFetchOpts(),
  })
    .then((res) => res.json())
    .catch((err) => console.log("Problem with cars request::", err));
}

// POST request for starting race
function startRace(id) {
  return fetch(`${SERVER}/api/races/${id}/start`, {
    method: "POST",
    ...defaultFetchOpts(),
  })
    .catch((err) => console.log("Problem with start race request::", err));
}

// POST request for accelerating on click
function accelerate(id) {

  return fetch(`${SERVER}/api/races/${id}/accelerate`, {
    method: "POST",
    ...defaultFetchOpts(),
  }).catch((err) =>
    console.log("Problem with acceleration request::", err)
  );
 
}

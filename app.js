const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");
const sqlite3 = require("sqlite3");
let db = null;
const initializeServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`db error:${e.message}`);
    process.exit(1);
  }
};
initializeServer();

const convertDbObjectToArray = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//Returns a list of all players in the team
app.get("/players/", async (request, response) => {
  const allPlayersQuery = `
    SELECT * FROM cricket_team;
    `;
  const allPlayersArray = await db.all(allPlayersQuery);
  response.send(allPlayersArray.map((i) => convertDbObjectToArray(i)));
});

//Creates a new player in the team (database).

app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const newPlayerQuery = `
    INSERT INTO cricket_team
    (player_name,jersey_number,role)
    VALUES ('${playerName}',${jerseyNumber},'${role}')
    `;
  const newPlayerArray = await db.run(newPlayerQuery);
  response.send("Player Added to Team");
});

//Returns a player based on a player ID

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerQuery = `
    select * from cricket_team
    where player_id=${playerId}
    `;
  const playerArray = await db.get(playerQuery);
  response.send(convertDbObjectToArray(playerArray));
});

//Updates the details of a player

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;
  const updateQuery = `
    update cricket_team
    set 
    player_name='${playerName}',
    jersey_number=${jerseyNumber},
    role='${role}' 
    where player_id=${playerId}
    `;

  const updateArray = await db.run(updateQuery);
  response.send("Player Details Updated");
});

//Deletes a player from the team (

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `
    delete from cricket_team
    where player_id=${playerId}
    `;
  const deleteArray = await db.run(deleteQuery);
  response.send("Player Removed");
});
module.exports = app;

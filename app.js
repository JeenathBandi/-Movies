const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "moviesData.db");

const app = express();

app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(4000, () =>
      console.log("Server Running at http://localhost:4000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const covertToObject = (object) => {
  return {
    movieId: object.movie_id,
    directorId: object.director_id,
    movieName: object.movie_name,
    leadActor: object.lead_actor,
  };
};

const convertToObjectDirector = (object) => {
  return {
    directorId: object.director_id,
    directorName: object.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMovieNamesQuery = `SELECT movie_name FROM movie`;
  const dbResponse = await db.all(getMovieNamesQuery);
  response.send(
    dbResponse.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postDbQuery = `INSERT INTO movie(director_id,movie_name,lead_actor)
    VALUES('${directorId}','${movieName}','${leadActor}');
    `;
  await db.run(postDbQuery);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieIdQuery = `
    SELECT * FROM movie
    WHERE movie_id = ${movieId};`;
  const dbResponse = await db.get(getMovieIdQuery);
  response.send(covertToObject(dbResponse));
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const putDbQuery = `
        UPDATE movie
        SET director_id = '${directorId}',
        movie_name = '${movieName}',
        lead_actor = '${leadActor}';
    `;
  await db.run(putDbQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `
        DELETE FROM movie
        WHERE movie_id = ${movieId};
    `;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `
        SELECT * FROM director;
    `;
  const dbResponse = await db.all(getDirectorQuery);
  response.send(
    dbResponse.map((eachDirector) => convertToObjectDirector(eachDirector))
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const query = `
        SELECT movie_name FROM movie
        WHERE director_id = '${directorId}';
    `;
  const myArray = await db.all(query);
  response.send(
    myArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

module.exports = app;

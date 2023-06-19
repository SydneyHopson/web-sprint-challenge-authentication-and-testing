const db = require("../../data/dbConfig.js");

function getById(id) {
  return db("users").where("id", id).first();
}

async function insert(userData) {
  const [id] = await db("users").insert(userData);
  return getById(id);
}

function getByUsername(username) {
  return db("users").where("username", username).first();
}
module.exports = {
    insert,
    getById,
    getByUsername
  };
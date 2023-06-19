// Write your tests here
const request = require("supertest");
const server = require("./server");
const db = require("../data/dbConfig");

const testUser = { username: "testuser", password: "testpassword" };

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});

afterAll(async () => {
  await db.destroy();
});

it("sanity check jokes", () => {
  expect(true).not.toBe(false);
});

describe("server.js", () => {
  describe("auth endpoints", () => {
    beforeEach(async () => {
      await db("users").truncate();
    });

    it("[POST] /api/auth/register adds a new user with a bcrypted password to the users table on success", async () => {
      await request(server).post("/api/auth/register").send(testUser);
      const user = await db("users").first();

      expect(user).toHaveProperty("id");
      expect(user).toHaveProperty("username");
      expect(user).toHaveProperty("password");
      expect(user.password).toMatch(/^\$2[ayb]\$.{56}$/);
      expect(user.username).toBe(testUser.username);
    });

    it("[POST] /api/auth/register responds with the new user with a bcrypted password on success", async () => {
      const { body } = await request(server).post("/api/auth/register").send(testUser);

      expect(body).toHaveProperty("id");
      expect(body).toHaveProperty("username");
      expect(body).toHaveProperty("password");
      expect(body.password).toMatch(/^\$2[ayb]\$.{56}$/);
      expect(body.username).toBe(testUser.username);
    });

    it("[POST] /api/auth/login responds with a proper status code on successful login", async () => {
      await db("users").truncate();
      await request(server).post("/api/auth/register").send(testUser);

      const res = await request(server).post("/api/auth/login").send(testUser);

      expect(res.status).toBe(200);
    });

    it("[POST] /api/auth/login responds with a welcome message and a token on successful login", async () => {
      await db("users").truncate();
      await request(server).post("/api/auth/register").send(testUser);

      const res = await request(server).post("/api/auth/login").send(testUser);

      expect(res.body).toHaveProperty("message");
      expect(res.body).toHaveProperty("token");
    });
  });

  describe("jokes endpoint", () => {
    beforeEach(async () => {
      await db("users").truncate();
      await request(server).post("/api/auth/register").send(testUser);
    });

    it("[GET] /api/jokes responds with an error status code on missing token", async () => {
      const res = await request(server).get("/api/jokes");
      expect(res.status + "").toMatch(/4|5/);
    });

    it('[GET] /api/jokes responds with a "token required" message on missing token', async () => {
      const res = await request(server).get("/api/jokes");
      expect(JSON.stringify(res.body)).toEqual(expect.stringMatching(/required/i));
    });
  });
});

const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { insert, getByUsername } = require("./auth-model");

router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(403).json("username and password required");
  }

  const userExist = await getByUsername(username);
  if (userExist) {
    return res.status(403).json("username taken");
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);
  const newUser = await insert({ username, password: passwordHash });
  return res.status(200).json(newUser);
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(403).json("username and password required");
  }

  const userExist = await getByUsername(username);

  if (!userExist || !bcrypt.compareSync(password, userExist.password)) {
    return res.status(401).json("invalid credentials");
  } else {
    const token = jwt.sign(
      {
        id: userExist.id,
        username: userExist.username,
      },
      process.env.SECRET || 'TestSecretKey',
      {
        expiresIn: '1d'
      }
    );
    return res.status(200).json({
      message: `welcome, ${username}`,
      token,
    });
  }
});
// test

module.exports = router;
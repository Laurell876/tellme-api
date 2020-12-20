const router = require("express").Router();
const pool = require("../db");
const bcrypt = require("bcryptjs");
const { registerValidation, loginValidation, extendSessionValidation } = require("../validation");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/verifyToken");

router.get("/me",verifyToken ,async (req, res) => {
    const userExists = await pool.query("SELECT * FROM app_user WHERE id = $1", [
        req.user.id,
    ]);
    if (!userExists.rows[0]) {
        return res.status(400).send({
            message: "Invalid token",
          });
    }

    let user = userExists.rows[0];
    return res.send({
        ...user,
        password: null
    });
})


router.post("/extend-session", async (req, res) => {
    const {
        error,
        value
    } = extendSessionValidation(req.body);
    if (error) return res.status(400).send(error);


    let validRefreshToken;
    try{
        validRefreshToken = jwt.verify(req.body.refreshToken ,process.env.REFRESH_TOKEN_SECRET);
    } catch(err) {
        return res.status(400).send(err);
    }

    const {accessToken, refreshToken} = generateAccessAndRefreshToken(validRefreshToken.user);

    return res.send({
        user: {
            ...validRefreshToken.user,
            password: null
        },
        accessToken,
        refreshToken
    });
    
})

router.post("/register", async (req, res) => {
  try {
    const { error, value } = registerValidation(req.body);
    if (error) return res.status(400).send(error);

    const { firstName, lastName, email, password } = value;

    // check if email is unique
    const isUnique = await pool.query("SELECT * FROM app_user WHERE email = $1", [
      email,
    ]);
    if (isUnique.rows[0]) {
      return res.status(409).send({ message: "Email address taken" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const text =
      "INSERT INTO app_user(first_name, last_name, email, password, is_admin) VALUES ($1, $2, $3, $4, $5) RETURNING *";
    const values = [firstName, lastName, email, hashedPassword, "f"];

    const result = await pool.query(text, values);
    const createdUser = result.rows[0];

    const { accessToken, refreshToken } = generateAccessAndRefreshToken(
      createdUser
    );

    res.json({
      user: { ...createdUser, password: null },
      accessToken,
      refreshToken,
    });
  } catch (e) {
    console.error(e.stack);
    res.status(400).send(e.response.message);
  }
});

router.post("/login", async (req, res) => {
  try {

    const { error, value } = loginValidation(req.body);
    if (error) return res.status(400).send(error);


    const { email, password } = value;

    const userExists = await pool.query("SELECT * FROM app_user WHERE email = $1", [
        email,
    ]);
    if (!userExists.rows[0]) {
        return res.status(400).send({
            message: "Invalid credentials",
          });
    }

    const loggedInUser = userExists.rows[0];

    if (!loggedInUser) {
      return res.status(400).send({ message: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, loggedInUser.password);
    if (!validPassword)
      return res.status(400).send({
        message: "Invalid credentials",
      });

    const { accessToken, refreshToken } = generateAccessAndRefreshToken(
        loggedInUser
    );

    return res.send({
      user: {
        ...loggedInUser,
        password: null,
      },
      accessToken,
      refreshToken,
    });

  } catch (e) {
    console.error(e.stack);
    res.status(400).send(e.response.message);
  }

});

const generateAccessAndRefreshToken = (user) => {
  // Create and assign tokens
  const accessToken = jwt.sign(
    {
      user: {
        ...user,
        password: null,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      //expiresIn: "15m",
    }
  );
  const refreshToken = jwt.sign(
    {
      user: {
        ...user,
        password: null,
      },
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "14d",
    }
  );
  return {
    accessToken,
    refreshToken,
  };
};

module.exports = router;

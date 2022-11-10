import express from "express";
import db from "./db.js";
import bodyParser from "body-parser";
import cors from "cors";
import {v4 as uuidv4} from "uuid";
import {body, validationResult} from "express-validator";

const app = express();
app.use(bodyParser.json());
app.use(cors());
const PORT = process.env.PORT || 3030;

app.post(
  "/register",
  body("email").isEmail().custom(async email => {
      const user = await db.getUserByEmail(email)
      if (user) {
        throw new Error("e-Mail address already in use")
      }
    }
  ),
  body("password").isLength({min: 6}),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()});
    }

    const clientId = uuidv4();
    await db.saveUser(req.body.email, req.body.password, clientId);

    res.status(201).send({clientId});
  },
);

app.post(
  "/login",
  body("email").isEmail(),
  body("password").isLength({min: 6}),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()});
    }

    const user = await db.getUserByEmail(req.body.email);
    const feedbacks = await db.getAllFeedbacks(user.clientId);

    res.status(200).send({
      clientId: user.clientId,
      feedbacks,
    });
  }
);

app.post(
  "/feedbacks",
  body("text").notEmpty(),
  body("text").isLength({max: 200}),
  body("clientId").custom(async clientId => {
    const user = await db.getUserByClientId(clientId)
    if (!user) {
      throw new Error("Invalid client id")
    }
  }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()});
    }
    await db.saveFeedback(req.body.clientId, req.body.text);

    res.status(201).send();
  }
);

app.listen(PORT, async () => {
  await db.open();
  await db.createTablesIfNotExists();
  console.log(`Feedback app started on port ${PORT}`)
});

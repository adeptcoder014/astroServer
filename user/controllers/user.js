const model = require("../models/user");
const planetModel = require("../models/planet");
const houseModel = require("../models/house");
const userCreationValidation = require("../../user/validation/user");
const { default: axios } = require("axios");
const astroUtils = require("../../utils/astro");
const ObjectId = require("mongodb").ObjectId;

//==================================================
module.exports = {
  getPlanet: async (req, res) => {
    try {
      const data = await planetModel.find({});
      console.log("-------- data ----------", data);
      jsonResponse = {
        message: "user found successfully",
        data: data,
        count: data.length,
      };
      res.status(200).json(jsonResponse);
    } catch (error) {
      console.error("Error fetching user data:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  //===============  GET ====================================
  getUser: async (req, res) => {
    try {
      console.log("-------- data ----------", model);
      const data = await model.find({}).populate(['houses','planets']);
      res.status(200).json(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  //===============  GET_BY_ID ====================================
  getUserById: async (req, res) => {
    const data = await model.find({ _id: req.body._id });
    res.status(200).json(data);
  },
  //===============  POST ====================================
  createUser: async (req, res) => {
    try {
      // =========== VALIDATION ==================
      // return;
      const { error, value } = userCreationValidation.validate(req.body);
      // error=null
      //================== REQUEST_HANDLING ==========================
      if (error) {
        return res.status(400).json({
          response: error.details[0].message,
        });
      } else {
        // =========== NATAL ==================
        const natalData = await astroUtils.getNatal(value);


        let dateTime = new Date();
        let dateObj = {
          createdAt: dateTime,
        };
        const mergedObject = { ...req.body, ...dateObj };

        const user = new model(mergedObject);
        console.log("user   =========", user );

        for (let index = 0; index < natalData.userPlanets.length; index++) {
          const element = natalData.userPlanets[index];
          const planet = new planetModel(element);
          await planet.save();

          user.planets = user.planets.concat(planet.id);
          await user.save();
        }

        // console.log("natalData.userHouses.length  =========", natalData.userHouses.length);
        for (let index = 0; index < natalData.userHouses.length; index++) {
          const houseElement = natalData.userHouses[index];
          // console.log("houseElement  =========", houseElement);
          const house = new houseModel(houseElement);
          // console.log("house  =========", house);
          await house.save();

          user.houses = user.houses.concat(house._id);
          await user.save();
        }

        return res.status(201).json(user);
      }
    } catch (error) {
      res.status(500).json({
        message: "Error creating user",
        error: error.message,
      });
    }
  },

  //=============== GET_USER_HOUSE_SIGNS ====================================
  getUserHouseSigns: async (req, res) => {
    const user = await model.findById(req.body.id);
    const userSigns = astroUtils.generateZodiacCycle(user.lagna);
    user.userSignsHouse.push(userSigns);
    await user.save();
    res.status(200).json(user);
  },
};

import User from "../../Model/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Token from "../../Model/token.js";
import sendMail from "../../utils/sendMail.js";
import crypto from "crypto";
import Artist from "../../Model/artistModel.js";


export const allArtists = async (req, res) => {
  try {
    const Artists = await Artist.find({ is_Confirm: true });
    if (!Artists) {
      return res.status(400).json({ message: "no artist here" });
    }

    return res.status(200).json({ Artists });
  } catch (error) {
    console.log(error);
  }
};

export const singleArtistDetails = async (req, res) => {
  try {
    const ArtistData = await Artist.findOne({
      _id: req.params.id,
      is_Confirm: true,
    });
    if (!ArtistData) {
      return res.status(401).res.json({ message: "No Artist Found" });
    }
    return res.status(200).json(ArtistData);
  } catch (error) {
    console.log(error);
  }
};
export const suggestArtist = async (req, res) => {
  try {
    const { category } = await Artist.findOne(
      { _id: req.params.id },
      { category: 1, _id: 0 }
    );
    const ArtistData = await Artist.find({
      _id: { $ne: req.params.id },
      is_Confirm: true,
      category,
    }).limit(3);

    if (!ArtistData) {
      return res.status(401).res.json({ message: "No Artist Found" });
    }
    return res.status(200).json(ArtistData);
  } catch (error) {
    console.log(error);
  }
};
export const filteredData = async (req, res) => {
  try {
    const category = req.params.category;
    const search = req.params.search;
    const value = req.params.value;
    const page = (value - 1) * 6;
    let query = {};

    if (category != "All") {
      query.category = category;
    }
    if (search != 0) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { place: { $regex: search, $options: "i" } },
      ];
    }
    const totalArtists = await Artist.countDocuments(query);
    const ArtistData = await Artist.find(query).skip(page).limit(6);
    const artistsPerPage = 6;
    const totalPages = Math.ceil(totalArtists / artistsPerPage);

    return res.status(200).json({ ArtistData, totalPages });
  } catch (error) {
    console.log(error);
  }
};

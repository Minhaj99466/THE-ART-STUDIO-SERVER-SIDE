import Artist from "../../Model/artistModel.js";
import jwt from "jsonwebtoken";
import Booking from "../../Model/bookingModel.js";

export const dateNotification = async (req, res) => {
  try {
    let token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWTARTISTKEY);

    const artist = await Artist.find({
      _id: decoded.artistId,
    }).populate({
      path: "bookingsPending",
      match: { status: "Pending" },
      model: "booking",
      populate: {
        path: "userId",
        model: "User",
        options: { distinct: true },
      },
    });
    if (!artist) {
      return res.status(400).json({ message: "userNot found" });
    }
    const b = artist[0].bookingsPending;

    const UserData = [];
    for (const iterator of b) {
      UserData.push(iterator.userId);
    }

    return res.status(200).json({ artist, UserData });
  } catch (error) {
    console.log(error);
  }
};

export const changeBookingStatus = async (req, res) => {
  try {
    const {
      changeData: { Id, status },
    } = req.body;

    const bookingUpdated = await Booking.findOneAndUpdate(
      { _id: Id },
      { $set: { status: status } }
    );

    if (!bookingUpdated) {
      return res.status(200).json({ message: "status change not Done" });
    }

    return res.status(200).json({ change: true, message: "status Changed" });
  } catch (error) {
    console.log(error);
  }
};
export const allOrders = async (req, res) => {
  try {
    let token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWTARTISTKEY);

    const allOrders = await Booking.findOne({
      artistId: decoded.artistId,
    })
    console.log(allOrders);
    if (!allOrders) {
      return res.status(400).json({ message: "no booking available" });
    }
    return res.status(200).json({ allOrders });
  } catch (error) {
    console.log(error);
  }
};

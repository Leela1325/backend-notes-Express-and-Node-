import {Ticket} from "../../models/ticket.model.js";
const ticketSummary = async (req, res) => {
  try {
    let data = await Ticket.find({ status: "PENDING" });
    const result = data.map((ticket) => ({
      id: ticket._id,
      ...ticket._doc
    }));
    data = { count: data.length, tickets: result }  ;
    res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch ticket stats",
      error: err.message,
    });
  }
}

export default ticketSummary
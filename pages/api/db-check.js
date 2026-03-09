import dbConnect from "../../db/connect";

export default async function handler(request, response) {
  try {
    await dbConnect();
    response.status(200).json({ status: "Connected to MongoDB! 🚀" });
  } catch (error) {
    console.error(error);
    response
      .status(500)
      .json({ status: "Connection failed", error: error.message });
  }
}

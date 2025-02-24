require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

(mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err)))();

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
});

const MenuItem = mongoose.model("MenuItem", menuItemSchema);

app.post("/menu", async (req, res) => {
  try {
    const { name, description, price } = req.body;
    if (!name || !price) return res.status(400).json({ error: "Name and price are required" });

    const newItem = new MenuItem({ name, description, price });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/menu", async (req, res) => {
  try {
    const items = await MenuItem.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put("/menu/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedItem = await MenuItem.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedItem) return res.status(404).json({ error: "Menu item not found" });

    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ error: "Invalid request or menu item not found" });
  }
});

app.delete("/menu/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = await MenuItem.findByIdAndDelete(id);

    if (!deletedItem) return res.status(404).json({ error: "Menu item not found" });

    res.json({ message: "Menu item deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: "Invalid request or menu item not found" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// backend/controllers/menuController.js
const Menu = require("../models/Menu");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { google } = require("googleapis");

// Helper function to safely parse numbers
function parseNumber(value) {
  const num = parseFloat(value);
  return isNaN(num) ? undefined : num;
}

// Initialize Google Drive API
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

const drive = google.drive({ version: "v3", auth: oauth2Client });

// Upload to Google Drive utility
async function uploadToGoogleDrive(buffer, originalName) {
  const fileName = `${uuidv4()}-${originalName}`;
  const filePath = path.join(__dirname, "../temp", fileName);

  // Save buffer to temp file
  fs.writeFileSync(filePath, buffer);

  try {
    const fileMetadata = {
      name: fileName,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID] // Folder must be set
    };

    const media = {
      mimeType: "image/jpeg",
      body: fs.createReadStream(filePath)
    };

    const res = await drive.files.create({
      resource: fileMetadata,
      media: media
    });

    // Make publicly accessible
    await drive.permissions.create({
      fileId: res.data.id,
      requestBody: {
        role: "reader",
        type: "anyone"
      }
    });

    const imageUrl = `https://drive.google.com/uc?export=view&id=${res.data.id}`;
    fs.unlinkSync(filePath); // Clean up temp file
    return imageUrl;
  } catch (err) {
    console.error("Upload to Google Drive failed:", err.message);
    throw new Error("Failed to upload image to Google Drive");
  }
}

// GET /menus - Get all menus
exports.getMenus = async (req, res) => {
  try {
    const menus = await Menu.find({});
    res.json(menus);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch menus" });
  }
};

// POST /menu - Create new menu
exports.createMenu = async (req, res) => {
  const { name, description, price, cost, category, minimumQty } = req.body;

  const parsedPrice = parseNumber(price);
  const parsedCost = parseNumber(cost);
  const parsedMinimumQty = parseInt(minimumQty);

  if (
    (price && isNaN(parsedPrice)) ||
    (cost && isNaN(parsedCost)) ||
    (minimumQty && isNaN(parsedMinimumQty))
  ) {
    return res.status(400).json({ error: "Price, Cost, and Quantity must be valid numbers" });
  }

  let imageUrl = "/uploads/default.jpg";

  // If image is uploaded → upload to Google Drive
  if (req.file) {
    try {
      imageUrl = await uploadToGoogleDrive(req.file.buffer, req.file.originalname);
    } catch (err) {
      console.error("Image upload failed:", err.message);
      return res.status(500).json({ error: "Failed to upload image to Google Drive" });
    }
  }

  try {
    const newMenu = new Menu({
      name,
      description,
      price: parsedPrice,
      cost: parsedCost,
      category: category || "Main Course",
      imageUrl,
      isActive: true,
      minimumQty: parsedMinimumQty,
      currentQty: parsedMinimumQty
    });

    await newMenu.save();
    res.json(newMenu);
  } catch (err) {
    console.error("Create failed:", err.message);
    res.status(400).json({ error: "Failed to add menu item" });
  }
};

// PUT /menu/:id - Update menu
exports.updateMenu = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const price = parseNumber(updates.price);
  const cost = parseNumber(updates.cost);
  const minimumQty = updates.minimumQty ? parseInt(updates.minimumQty) : undefined;
  const currentQty = updates.currentQty ? parseInt(updates.currentQty) : undefined;
  const availableQty = updates.availableQty ? parseInt(updates.availableQty) : undefined;

  if (
    (updates.price && isNaN(price)) ||
    (updates.cost && isNaN(cost)) ||
    (updates.minimumQty && isNaN(minimumQty)) ||
    (updates.currentQty && isNaN(currentQty)) ||
    (updates.availableQty && isNaN(availableQty))
  ) {
    return res.status(400).json({ error: "Price, Cost, and Quantity must be valid numbers" });
  }

  const updateFields = {};
  if (price !== undefined) updateFields.price = price;
  if (cost !== undefined) updateFields.cost = cost;
  if (minimumQty !== undefined) updateFields.minimumQty = minimumQty;
  if (currentQty !== undefined) updateFields.currentQty = currentQty;
  if (availableQty !== undefined) updateFields.availableQty = availableQty;
  if (updates.category) updateFields.category = updates.category;
  if (updates.description) updateFields.description = updates.description;

  if (req.file) {
    try {
      const driveUrl = await uploadToGoogleDrive(req.file.buffer, req.file.originalname);
      updateFields.imageUrl = driveUrl;
    } catch (err) {
      return res.status(500).json({ error: "Failed to upload image to Google Drive" });
    }
  }

  try {
    const updated = await Menu.findByIdAndUpdate(id, { $set: updateFields }, {
      new: true,
      runValidators: true
    });

    if (!updated) {
      return res.status(404).json({ error: "Menu not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("Update failed:", err.message);
    res.status(500).json({ error: "Failed to update menu" });
  }
};

// DELETE /menu/:id - Delete menu
exports.deleteMenu = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Menu.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: "Menu not found" });
    }
    res.json({ message: "Menu deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete menu" });
  }
};
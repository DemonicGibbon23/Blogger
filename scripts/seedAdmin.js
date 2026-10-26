#!/usr/bin/env node
/**
 * scripts/seedAdmin.js
 *
 * Creates the single administrator account for Bloggr.
 * Run once after initial deployment:
 *
 *   node scripts/seedAdmin.js
 *
 * You will be prompted for the admin email and password,
 * OR you can set ADMIN_EMAIL and ADMIN_PASSWORD environment variables.
 *
 * This script is intentionally not accessible through any HTTP endpoint.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const readline = require("readline");

const User = require("../src/models/userModel");

async function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  if (!process.env.MONGO_URI) {
    console.error("Error: MONGO_URI is not set in .env");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  const existingAdmin = await User.findOne({ role: "admin" });
  if (existingAdmin) {
    console.log(`Admin account already exists: ${existingAdmin.email}`);
    console.log("Only one admin account is allowed. Exiting.");
    await mongoose.disconnect();
    process.exit(0);
  }

  const email =
    process.env.ADMIN_EMAIL ||
    (await prompt("Admin email: "));

  const password =
    process.env.ADMIN_PASSWORD ||
    (await prompt("Admin password (min 8 chars): "));

  const name =
    process.env.ADMIN_NAME ||
    (await prompt("Admin display name [Admin]: ")) ||
    "Admin";

  if (!email || !email.includes("@")) {
    console.error("Invalid email.");
    process.exit(1);
  }

  if (!password || password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const existingEmail = await User.findOne({ email: email.trim().toLowerCase() });
  if (existingEmail) {
    console.error("A user with this email already exists.");
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    name: name.trim() || "Admin",
    email: email.trim().toLowerCase(),
    password: hashedPassword,
    role: "admin"
  });

  console.log(`\n✓ Admin account created: ${email.trim().toLowerCase()}`);
  console.log("Keep these credentials safe — there is no public admin registration path.");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Seed script error:", err.message);
  process.exit(1);
});

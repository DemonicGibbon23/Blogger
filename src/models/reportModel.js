
const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
    {
        reporter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        targetType: {
            type: String,
            enum: ["Blog", "Comment"],
            required: true
        },

        target: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: "targetType"
        },

        reason: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000
        },

        status: {
            type: String,
            enum: [
                "pending",
                "reviewed",
                "resolved",
                "rejected"
            ],
            default: "pending"
        }
    },
    {
        timestamps: true
    }
);

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;

import { Engineer } from "../model/engineerModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import User from "../model/userModel.js";
import { Certificate } from "../model/certificateModel.js";
import { Portfolio } from "../model/portofolioModel.js";

const getEducation = catchAsync(async (req, res, next) => {
  const engineer = await Engineer.findOne({ user: req.params.id });

  res.status(200).json({
    education: engineer.education,
  });
});

const getAllEngineers = catchAsync(async (req, res, next) => {
  const engineers = await Engineer.find().populate({
    path: "user",
    select: "fullName email role profilePic createdAt",
    match: { role: "engineer" },
  });

  // Filter out any engineers where the user didn't match (role isn't 'engineer')
  const filteredEngineers = engineers.filter(
    (engineer) => engineer.user !== null
  );

  res.status(200).json({
    status: "success",
    results: filteredEngineers.length,
    data: {
      engineers: filteredEngineers,
    },
  });
});

const getEngineerById = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  console.log("User ID received:", userId);

  // Find engineer by user ID and populate the user field

  const engineer = await Engineer.findOne({ user: userId }).populate("user");
  const certificates = await Certificate.find({ engineer: userId });
  const portfolios = await Portfolio.find({ user: userId });
  console.log(engineer);
  console.log(certificates);
  console.log(portfolios);
  // If no engineer is found, return a 404 error
  if (!engineer) {
    console.log("Engineer not found for user ID:", userId); // Debugging: Log if no engineer is found
    return next(new AppError("Engineer not found with this user ID", 404));
  }

  // Set up the base URL, using an environment variable for production, fallback to localhost for development
  const baseURL = process.env.BASE_URL || "http://localhost:8000";

  // Check if profilePic exists and it's not the default RoboHash URL
  if (
    engineer.user.profilePic &&
    engineer.user.profilePic !== "https://robohash.org/bali"
  ) {
    // If the profilePic is not an external URL, prepend the local server path
    if (!engineer.user.profilePic.startsWith("http")) {
      engineer.user.profilePic = `http://localhost:8000/my-uploads/users/${engineer.user.profilePic}`;
    }
  }

  // Send the response with the engineer details
  res.status(200).json({
    status: "success",
    data: {
      engineer,
      portfolios,
      certificates,
    },
  });
});

const getEngineerByEngineerId = catchAsync(async (req, res, next) => {
  const { engineerId } = req.params;

  console.log("Engineer ID received:", engineerId);

  // Find the engineer by _id and populate the certificates and portfolios fields
  const engineer = await Engineer.findOne({ _id: engineerId })
    .populate("user")
    .populate("certificates")
    .populate("portfolios"); // Populate portfolios as well

  if (!engineer) {
    console.log("Engineer not found for ID:", engineerId);
    return next(new AppError("Engineer not found with this ID", 404));
  }

  // Respond with the engineer data, including populated certificates and portfolios
  res.status(200).json({
    status: "success",
    data: {
      engineer,
    },
  });
});

const updateEducation = async (req, res, next) => {
  let engineerId = req.user.id; //user id from token
  let engineerEducation = await Engineer.findByIdAndUpdate(
    engineerId,
    {
      education: {
        title: req.body.title,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
      },
    },
    { new: true }
  );

  res
    .status(200)
    .json({ message: "Education added successfully", engineerEducation });
};

const addTitle = async (req, res, next) => {
  let id = req.params.id;
  const user = await User.findById(id);
  await Engineer.findOneAndUpdate(
    { user: user._id },
    { title: req.body.title }
  );

  res.status(200).json({ message: "Title added successfully" });
};

const addSkill = catchAsync(async (req, res, next) => {
  const engineerId = req.params.id;
  const { skillsToAdd } = req.body;

  // Find the engineer by ID
  const engineer = await Engineer.findOne({ user: engineerId });

  if (!engineer) {
    return res.status(404).json({ message: "Engineer not found" });
  }

  // Merge skills and avoid duplicates
  const updatedSkills = [...new Set([...engineer.skills, ...skillsToAdd])];

  // Update the engineer's skills
  engineer.skills = updatedSkills;
  await engineer.save();

  res.status(200).json({
    message: "Skills updated successfully",
    data: { skills: engineer.skills },
  });
});

// frontend will update the skills array and save them in the database

const addOverview = async (req, res, next) => {
  let { id } = req.params;

  const { profileOverview } = req.body;

  if (!profileOverview) {
    return res.status(400).json({ message: "Profile Overview is required." });
  }
  const user = await User.findById(id);
  await Engineer.findOneAndUpdate(
    { user: user._id },
    { overview: profileOverview }
  );

  res.status(200).json({ message: "Overview added successfully" });
};

const addEducation = catchAsync(async (req, res, next) => {
  const { title, startDate, endDate } = req.body;
  const { id } = req.params;

  if (!title || !startDate || !endDate) {
    return res
      .status(400)
      .json({ message: "Title, Start Date, and End Date are required." });
  }

  const engineer = await Engineer.findOne({ user: id });

  const updatedEngineer = await Engineer.findByIdAndUpdate(
    engineer._id,
    {
      education: {
        title,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    },
    { new: true }
  );
  res.json({ message: "Education added successfully", updatedEngineer });
});

// Save a service (job) to an engineer's saved jobs
const saveJob = async (req, res, next) => {
  try {
    const { engineerId, serviceId } = req.body; // Extract both engineerId and serviceId from the request body

    if (!serviceId || !engineerId) {
      return res
        .status(400)
        .json({ message: "Service ID and Engineer ID are required." });
    }

    // Find the engineer by their ID
    const engineer = await Engineer.findById(engineerId);
    if (!engineer) {
      return res.status(404).json({ message: "Engineer not found." });
    }

    // Check if the job is already saved
    const alreadySaved = engineer.savedJobs.find(
      (job) => job.service.toString() === serviceId
    );

    if (alreadySaved) {
      return res.status(400).json({ message: "Job already saved." });
    }

    // Save the job
    engineer.savedJobs.push({ service: serviceId });
    await engineer.save();

    res.status(200).json({
      message: "Job saved successfully",
      savedJobs: engineer.savedJobs,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const removeSavedJob = async (req, res, next) => {
  try {
    const { engineerId, serviceId } = req.body; // Extract both engineerId and serviceId from the request body

    if (!serviceId || !engineerId) {
      return res
        .status(400)
        .json({ message: "Service ID and Engineer ID are required." });
    }

    // Find the engineer by their ID
    const engineer = await Engineer.findById(engineerId);
    if (!engineer) {
      return res.status(404).json({ message: "Engineer not found." });
    }

    // Remove the job from saved jobs
    engineer.savedJobs = engineer.savedJobs.filter(
      (job) => job.service.toString() !== serviceId
    );

    await engineer.save();

    res.status(200).json({
      message: "Job removed successfully",
      savedJobs: engineer.savedJobs,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get all saved services (jobs) for an engineer
const getSavedJobs = catchAsync(async (req, res, next) => {
  const engineerId = req.user._id;

  const engineer = await Engineer.findById(engineerId).populate("savedJobs"); // Populate saved service details

  res.status(200).json({
    status: "success",
    data: {
      savedJobs: engineer.savedJobs,
    },
  });
});

// Update engineer profile by ID
const updateEngineer = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  console.log("User ID:", userId);
  console.log("Request body:", req.file);
  const data = {};

  // Check if there is a 'fullName' in the request body and update the User model
  if (req.body.fullName) {
    data.fullName = req.body.fullName;
  }

  // Handle profilePic upload, if file exists
  if (req.file) {
    data.profilePic = `http://localhost:8000/my-uploads/users/${req.file.filename}`;
  }
  console.log(data);
  // Update the Engineer document
  const user = await User.findOneAndUpdate({ _id: userId }, data, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new AppError("Engineer not found for this user ID", 404));
  }

  // Return the updated engineer with populated user data
  res.status(200).json({
    status: "success",
  });
});

export {
  updateEngineer,
  updateEducation,
  addTitle,
  addSkill,
  addOverview,
  addEducation,
  getAllEngineers,
  getSavedJobs,
  saveJob,
  getEngineerById,
  getEngineerByEngineerId,
  getEducation,
};

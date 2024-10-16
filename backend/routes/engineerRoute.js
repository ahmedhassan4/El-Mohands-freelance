import express from "express";
import {
  addEducation,
  addOverview,
  addSkill,
  addTitle,
  getAllEngineers,
  getEngineerByEngineerId,
  getEngineerById,
  getSavedJobs,
  removeSavedJob,
  saveJob,
  updateEngineer,
  getEducation,
} from "../controllers/engineerController.js";
import userProfileUpload from "../middleware/uploads/userProfileUpload.js";

const engineerRouters = express.Router();
engineerRouters.get("/all", getAllEngineers);
engineerRouters.get("/:userId", getEngineerById);
engineerRouters.get("/engineerId/:engineerId", getEngineerByEngineerId);
engineerRouters.put("/addeducation/:id", addEducation);
engineerRouters.get("/education/:id", getEducation);

engineerRouters.post("/addskill/:id", addSkill);
engineerRouters.post("/addtitle/:id", addTitle);
engineerRouters.post("/addoverview/:id", addOverview);
engineerRouters.post("/savejob", saveJob);
engineerRouters.post("/removejob", removeSavedJob);
engineerRouters.get("/savedjobs", getSavedJobs);
engineerRouters.put(
  "/updateEngineer/:userId",
  userProfileUpload.single("profilePic"),
  updateEngineer
);

export default engineerRouters;

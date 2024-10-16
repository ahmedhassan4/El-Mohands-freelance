import { Engineer } from "../model/engineerModel.js";
import { Proposal } from "../model/proposalModel.js";
import Service from "../model/serviceModel.js";

import catchAsync from "../utils/catchAsync.js";

const addProposal = catchAsync(async (req, res, next) => {
  const { content, budget, service, engineerId } = req.body;
  console.log("Received Proposal Data:", req.body);

  // Validate input
  if (!content || !service || !budget || !engineerId) {
    return res.status(400).json({ message: "Complete all required fields" });
  }

  // Fetch the engineer
  const engineer = await Engineer.findById(engineerId);
  if (!engineer) {
    return res.status(404).json({ message: "Engineer not found." });
  }

  // Check if the service exists
  const serviceDoc = await Service.findById(service);
  if (!serviceDoc) {
    return res.status(404).json({ message: "Service not found." });
  }

  // Check if the engineer has already submitted a proposal for this service
  const existingProposal = engineer.submittedProposals.some(
    (proposal) => proposal.service.toString() === service
  );
  if (existingProposal) {
    return res.status(400).json({
      message: "You have already submitted a proposal for this service.",
    });
  }

  // Create a new proposal
  const newProposal = await Proposal.create({
    engineer: engineerId,
    service: service,
    content,
    budget,
  });

  // Add the proposal to the service's proposals array
  serviceDoc.proposals.push(newProposal._id);
  await serviceDoc.save();

  // Add the new proposal to the engineer's submittedProposals array
  engineer.submittedProposals.push({
    service: service,
    proposal: newProposal._id, // Ensure you track the proposal ID as well
  });
  await engineer.save();

  // Respond with success and return the newly created proposal
  res.status(201).json({
    message: "Proposal added successfully",
    proposal: newProposal,
  });
});

const updateProposal = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const engineer = req.user.id;
  const { content, budget, service } = req.body;

  const proposal = await Proposal.findOneAndUpdate(
    { engineer, _id: id },
    { content, budget, service },
    { new: true }
  );

  if (!proposal) return res.status(404).json({ message: "Proposal not found" });
  res.status(200).json({ message: "Proposal updated successfully", proposal });
});

const getProposalsByUserId = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const proposals = await Proposal.find({ engineer: userId });

  if (!proposals.length)
    return res.status(404).json({ message: "No proposals found" });
  res.status(200).json({ proposals });
});

const getProposalsByServiceId = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Validate input
  if (!id) {
    return res.status(400).json({ message: "Service ID is required" });
  }

  // Find the service and populate its proposals
  const service = await Service.findById(id).populate({
    path: "proposals",
    populate: {
      path: "engineer", // First populate the engineer details
      populate: {
        path: "user", // Then populate the user inside the engineer
      },
    },
  });

  if (!service) {
    return res.status(404).json({ message: "Service not found" });
  }

  // Check if the service has any proposals
  if (!service.proposals || service.proposals.length === 0) {
    return res
      .status(404)
      .json({ message: "No proposals found for this service" });
  }

  res.status(200).json({
    status: "success",
    data: {
      proposals: service.proposals,
    },
  });
});

export const acceptProposal = catchAsync(async (req, res, next) => {
  const { proposalId } = req.params;

  // Find the proposal by ID
  const proposal = await Proposal.findById(proposalId);

  if (!proposal) {
    return res.status(404).json({ message: "Proposal not found" });
  }

  // Mark the proposal as accepted
  proposal.accepted = true;
  await proposal.save();

  res.status(200).json({
    status: "success",
    message: "Proposal accepted successfully",
    data: proposal,
  });
});

export {
  addProposal,
  updateProposal,
  getProposalsByUserId,
  getProposalsByServiceId,
};

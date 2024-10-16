// ProfilePage.js
import React from "react";
import ProfileHeader from "../../Components/ProfileHeader/ProfileHeader";
import ProfileSummary from "../../Components/ProfileSummary/ProfileSummary";
import ProfileSkills from "../../Components/ProfileSkills/ProfileSkills";
import ProfilePortfolio from "../../Components/ProfilePortofolio/ProfilePortfolio";
import ProfileSideBar from "../../Components/ProfileSideBar/ProfileSideBar";
import ProfileCertifications from "../../Components/ProfileCertifications/ProfileCertifications";
import ProfileEducation from "../../Components/ProfileEducation/ProfileEducation";
import { Toaster } from "react-hot-toast";

function ProfilePage() {
  return (
    <div className="App bg-gray-100 min-h-screen py-8">
      {/* Toaster placed here to handle toast notifications */}
      <Toaster position="top-right" reverseOrder={false} />

      <div className="container mx-auto px-10">
        <div className="flex flex-col lg:flex-row gap-12 px-10">
          <div className="w-full lg:w-4/4 flex flex-col gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <ProfileHeader />
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <ProfileSummary />
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <ProfileSkills />
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <ProfilePortfolio />
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <ProfileCertifications />
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <ProfileEducation />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;

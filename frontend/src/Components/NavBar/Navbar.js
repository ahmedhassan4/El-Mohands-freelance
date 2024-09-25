import React, { useState, useEffect } from "react";
import logo from "../../assets/logo.png";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { fetchUserById } from "../../redux/slices/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/slices/authSlice";

export default function Navbar() {
  const [subNavContent, setSubNavContent] = useState("");
  const [isSubNavVisible, setIsSubNavVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [verifiedStatus, setVerifiedStatus] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Handle token decoding to get the first part of the user's full name and role
  useEffect(() => {
    const updateUserInfo = async () => {
      const token = localStorage.getItem("Token");
      if (token) {
        const decodedToken = jwtDecode(token); // Decode the token to get user info
        const fullName = decodedToken.fullName.split(" ")[0]; // Get the first part of the full name
        const role = decodedToken.role;
        const id = decodedToken.id;

        // Fetch user data using the decoded user ID
        const user = await dispatch(fetchUserById(id));

        // Set user name, role, and verification status in state
        setUserName(fullName);
        setUserRole(role);
        setUserId(id);
        setVerifiedStatus(...(user?.payload?.verifiedStatus || "pending")); // Set verification status
      } else {
        // Clear user data if token is not found
        setUserName(null);
        setUserRole(null);
        setVerifiedStatus(null);
      }
    };

    // Initial call to set the user info when the component mounts
    updateUserInfo();

    // Polling `localStorage` every second to detect changes within the same tab
    const intervalId = setInterval(() => {
      updateUserInfo();
    }, 1000);

    // Listen for `localStorage` changes across different tabs
    window.addEventListener("storage", updateUserInfo);

    // Cleanup the interval and event listener when component unmounts
    return () => {
      clearInterval(intervalId);
      window.removeEventListener("storage", updateUserInfo);
    };
  }, [dispatch]);

  const handleLogout = () => {
    setIsLoggingOut(true);

    // Clear user-related state and token
    setUserName(null);
    setUserRole(null);
    setVerifiedStatus(null);

    // Remove the token and user info from localStorage
    localStorage.removeItem("Token");
    localStorage.removeItem("UserName");
    localStorage.removeItem("UserRole");

    // Set timeout to delay the navigation for 1 second
    setTimeout(() => {
      dispatch(logout()); // Dispatch the logout action
      navigate("/signin"); // Navigate to the sign-in page
      setIsLoggingOut(false); // Reset logging out state
    }, 1000); // Wait for 1 second before redirecting
  };
  const handleMouseEnterLi = (content) => {
    setSubNavContent(content);
    setIsSubNavVisible(true);
  };

  const handleMouseLeaveLi = () => {
    setTimeout(() => {
      if (!isSubNavVisible) {
        setIsSubNavVisible(false);
      }
    }, 100);
  };

  const handleMouseEnterSubNav = () => {
    setIsSubNavVisible(true);
  };

  const handleMouseLeaveSubNav = () => {
    setIsSubNavVisible(false);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className="bg-white w-full ">
        <nav className="border-amber-300  border-b-2   px-10 py-2.5 datext-black">
          <div className="flex flex-wrap items-center justify-between px-4 mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <Link to={""} className="flex items-center mr-8">
                  <img
                    src={logo}
                    className="h-12 w-12 mr-2"
                    alt="Handas Logo"
                  />
                  <span className="font self-center text-xl font-semibold whitespace-nowrap dark:text-white">
                    Handesly
                  </span>
                </Link>
              </div>
            </div>
            <div className="flex items-center lg:order-2">
              <div className="flex gap-10 justify-center items-center">
                {userName ? (
                  <>
                    <div className="flex items-center">
                      <Link to={`/profile/${userId}`} className="mr-2">
                        Hello, {userName}
                      </Link>

                      {/* Warning Icon with tooltip positioned to the left */}
                      <div className="relative group">
                        {verifiedStatus === "pending" && (
                          <>
                            <Link to="/verify">
                              <i className="fa-solid fa-exclamation-circle text-yellow-500 cursor-pointer"></i>
                            </Link>
                            {/* Tooltip for pending status */}
                            <div
                              className="absolute right-0 mt-2 p-4 bg-white rounded-lg shadow-lg border-2 border-amber-400 text-sm hidden group-hover:block hover:block max-w-xs w-64 whitespace-normal z-50"
                              onMouseEnter={() => {
                                document.querySelector(
                                  ".group .hover-block"
                                ).style.display = "block";
                              }}
                              onMouseLeave={() => {
                                document.querySelector(
                                  ".group .hover-block"
                                ).style.display = "none";
                              }}>
                              <p className="mb-2">
                                {userRole === "client"
                                  ? "Please verify your identity to hire engineers and post jobs."
                                  : "Please verify your identity to find jobs and submit proposals."}
                              </p>
                            </div>
                          </>
                        )}{" "}
                        {verifiedStatus === "accepted" && (
                          <img
                            src="/images/verified.png"
                            alt="Verified"
                            className="w-6 h-6" // Adjust the size as needed
                          />
                        )}{" "}
                        {verifiedStatus === "rejected" && (
                          <>
                            <span
                              role="img"
                              aria-label="error"
                              className="text-red-500">
                              ❌
                            </span>
                            {/* Tooltip for rejected status */}
                            <div className="absolute right-0 mt-2 p-4 bg-white rounded-lg shadow-lg border-2 border-red-400 text-sm hidden group-hover:block hover:block max-w-xs w-64 whitespace-normal z-50">
                              <p className="mb-2">
                                Your verification was rejected. Please re-upload
                                your documents for verification.
                              </p>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Logout Button */}
                      <button
                        className="ml-4 bg-red-500 text-white px-4 py-2 rounded-lg"
                        onClick={handleLogout}>
                        Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <NavLink to={"/signin"} className="cursor-pointer text-lg">
                      Login
                    </NavLink>
                    <Link
                      to={"/get-started"}
                      className="text-whitetext-black hover:bg-amber-400 bg-amber-300 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-4 lg:px-6 py-2 lg:py-2.5 sm:mr-2 lg:mr-0 dark:bg-purple-600 dark:hover:text-black focus:outline-none dark:focus:ring-purple-800">
                      Sign up
                    </Link>
                  </>
                )}
              </div>

              <button
                onClick={toggleMenu}
                data-collapse-toggle="mobile-menu-2"
                type="button"
                className="inline-flex items-center p-2 ml-1 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hovetext-black dark:focus:ring-gray-600"
                aria-controls="mobile-menu-2"
                aria-expanded={isOpen}>
                <span className="sr-only">Open main menu</span>
                <svg
                  className={`w-6 h-6 ${isOpen ? "hidden" : "block"}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    fillRule="evenodd"
                    d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"></path>
                </svg>
                <svg
                  className={`w-6 h-6 ${isOpen ? "block" : "hidden"}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"></path>
                </svg>
              </button>
            </div>
            <div
              className={`items-center justify-between w-full lg:flex lg:w-auto lg:order-1 ${
                isOpen ? "block" : "hidden"
              }`}
              id="mobile-menu-2">
              {/* Original Nav Links */}
              <ul className="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
                <li>
                  <NavLink
                    to={""}
                    className="block py-2 pl-3 pr-4 text-black border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-amber-400 lg:p-0">
                    Home
                  </NavLink>
                </li>

                {/* Conditional "Find Talent" for client or when not logged in */}
                {userRole === null ? (
                  // Fallback UI, e.g., loading spinner, until role is determined
                  <div>Find Projects</div>
                ) : userRole === "client" ? (
                  <li
                    onMouseEnter={() =>
                      handleMouseEnterLi(
                        <div className="md:flex gap-2">
                          <div className="options border-r border-gray-400 md:w-1/4">
                            <div className="option rounded-lg hover:bg-yellow-50 mr-4 p-4">
                              <p className="my-2 font-medium text-sm text-black">
                                <Link to={"/client"}>
                                  Post job and hire Engineer
                                </Link>
                              </p>
                              <p className="font-medium text-sm text-black">
                                Engineers Catalog
                              </p>
                            </div>
                          </div>
                          <div className="selected-option p-3 md:w-1/3">
                            <p className="my-2 text-black font-bold">
                              At Handas
                            </p>
                            <p className="my-2 font-medium text-black">
                              You can find the right engineer for your job.
                            </p>
                            <p className="text-sm leading-7 my-2 font-medium">
                              <span className="text-black font-bold">
                                Specialized Expertise:
                              </span>{" "}
                              With access to a wide range of engineers, you can
                              find individuals with specific expertise that
                              perfectly matches your project requirements.
                            </p>
                            <p className="text-amber-600 underline text-sm font-bold">
                              <Link to={"/engineers-list"}>
                                Browse all Engineers
                              </Link>
                            </p>
                          </div>
                        </div>
                      )
                    }
                    onMouseLeave={handleMouseLeaveLi}>
                    <NavLink
                      to="/client"
                      className="block py-2 pl-3 pr-4 text-black border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-amber-400 lg:p-0">
                      Client Dashboard
                    </NavLink>
                  </li>
                ) : userRole === "engineer" ? (
                  <li
                    onMouseEnter={() =>
                      handleMouseEnterLi(
                        <div className="md:flex gap-2">
                          <div className="find-work md:w-1/4 border-r border-gray-600">
                            <p className="text-black font-bold">Ways to Earn</p>
                            <p className="text-black text-sm">
                              Learn why Handas is the best for you.
                            </p>
                          </div>
                          <div className="md:w-1/3 ms-3 border-r hover:bg-amber-100 border-gray-600">
                            <p className="text-black font-bold">
                              <Link to={"/jobs"}>
                                Find work for your Skills
                              </Link>
                            </p>
                            <p className="text-black text-sm">
                              Explore the kind of work that will be available in
                              your field.
                            </p>
                          </div>
                        </div>
                      )
                    }
                    onMouseLeave={handleMouseLeaveLi}>
                    <NavLink
                      to="/jobs"
                      className="block py-2 pl-3 pr-4 text-black border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-amber-300 lg:p-0">
                      Find Work
                    </NavLink>
                  </li>
                ) : null}

                <li
                  onMouseEnter={() =>
                    handleMouseEnterLi(
                      <>
                        <div className="find-work md:flex">
                          <div className="md:w-1/4 border-r border-gray-600">
                            <p className="text-black font-bold">
                              <Link to={"/about"}>Success Stories</Link>
                            </p>
                            <p className=" text-black text-sm  md:w-1/2">
                              Discover how teams work strategically and grow
                              together{" "}
                            </p>
                          </div>
                          <div className="md:w-1/4 ms-3 border-r border-gray-600">
                            <p className="text-black font-bold">Reviews </p>
                            <p className=" text-black text-sm  md:w-1/2">
                              Explore all the good and bad reviews for every
                              client or engineer{" "}
                            </p>
                          </div>{" "}
                          <div className="md:w-1/4 ms-3 border-r border-gray-600">
                            <p className="text-black font-bold">How to hire </p>
                            <p className=" text-black text-sm  md:w-1/2">
                              Learn the best ways to find the right hire{" "}
                            </p>
                          </div>
                          <div className="md:w-1/4 ms-3 border-r border-gray-600">
                            <p className="text-black font-bold">
                              How to find work
                            </p>
                            <p className=" text-black text-sm  md:w-1/2">
                              Learn the best ways to find the available work
                              based on your type{" "}
                            </p>
                          </div>
                        </div>
                      </>
                    )
                  }
                  onMouseLeave={handleMouseLeaveLi}>
                  <a
                    href="#"
                    className="block py-2 pl-3 pr-4 text-black border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-amber-300 lg:p-0">
                    Why Handesly{" "}
                    <i className="ttext-black fa-solid fa-chevron-down"></i>
                  </a>
                </li>

                <li>
                  <NavLink
                    to={"/contact"}
                    className="block py-2 pl-3 pr-4 text-black border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-amber-300 lg:p-0">
                    Contact
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to={"/about"}
                    className="block py-2 pl-3 pr-4 text-black border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-amber-300 lg:p-0">
                    About
                  </NavLink>
                </li>
              </ul>
            </div>
          </div>
        </nav>
        <div
          className={`sub-nav z-20  bg-white ttext-black border-b-2 border-amber-300 w-full p-10 md:fixed transition-opacity duration-300 ${
            isSubNavVisible ? "opacity-100" : "opacity-0 hidden"
          }`}
          onMouseEnter={handleMouseEnterSubNav}
          onMouseLeave={handleMouseLeaveSubNav}>
          {subNavContent}
        </div>

        <script src="https://unpkg.com/flowbite@1.4.1/dist/flowbite.js"></script>
      </div>
    </>
  );
}

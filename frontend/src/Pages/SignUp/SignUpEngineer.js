import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { signUp } from "../../redux/slices/authSlice"; // Update the path as necessary
import { useNavigate, Link } from "react-router-dom";

export default function SignUpEngineer() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [successMessage, setSuccessMessage] = useState(""); // Success message state
  const [isLoading, setIsLoading] = useState(false); // New loading state

  // Validation schema
  const validationSchema = Yup.object().shape({
    fullName: Yup.string()
      .required("Full Name is required")
      .matches(
        /^[A-Za-z]+(?:\s[A-Za-z]+)*$/,
        "Only alphabetic characters and one space between words are allowed"
      )
      .min(3, "Full Name must be at least 3 characters")
      .max(30, "You cannot enter more than 30 characters"),
    username: Yup.string()
      .required("Username is required")
      .min(3, "Username must be at least 3 characters")
      .max(20, "You cannot enter more than 20 characters"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters")
      .max(20, "You cannot enter more than 20 characters"),
    passwordConfirm: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm your password"),
    gender: Yup.string().required("Gender is required"),
    country: Yup.string().required("Country is required"),
    terms: Yup.bool().oneOf([true], "Please agree to the terms and conditions"),
  });

  const formik = useFormik({
    initialValues: {
      fullName: "",
      username: "",
      email: "",
      password: "",
      passwordConfirm: "",
      gender: "",
      country: "",
      terms: false,
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      setIsLoading(true); // Show loading screen
      const formData = { ...values, role: "engineer" }; // or "client"
      const result = await dispatch(signUp(formData));

      let isMounted = true;
      if (!result.payload?.error) {
        setTimeout(() => {
          if (isMounted) {
            resetForm(); // Clear form inputs on successful submission
            setSuccessMessage("Account created successfully!"); // Show success message
            navigate("/signin"); // Navigate to sign in
          }
          setIsLoading(false); // Hide loading screen after navigation
        }, 3000); // 3-second delay
      } else {
        setIsLoading(false); // Hide loading screen on error
        setSuccessMessage(""); // Reset success message in case of an error
      }

      return () => {
        isMounted = false;
      };
    },
  });

  const handleCheckboxChange = (e) => {
    formik.setFieldValue("terms", e.target.checked);
  };

  return isLoading ? (
    <div className="flex justify-center items-center h-screen">
      <div className="loader border-t-4 border-blue-500 rounded-full w-8 h-8 animate-spin"></div>
      <p className="ml-4">Loading...</p>
    </div>
  ) : (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div
        className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full"
        style={{ minHeight: "650px" }} // Fixed height
      >
        <h2 className="text-2xl font-bold text-center mb-6">
          Sign up as Client
        </h2>
        <form onSubmit={formik.handleSubmit}>
          <div className="space-y-10">
            {/* Full Name Input */}
            <div className="relative">
              <input
                type="text"
                name="fullName"
                value={formik.values.fullName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Full Name"
                className="w-full p-4 border border-gray-300 rounded-lg"
              />
              {formik.touched.fullName && formik.errors.fullName && (
                <div className="absolute text-red-500 text-sm -bottom-5 left-0">
                  {formik.errors.fullName}
                </div>
              )}
            </div>

            {/* Username Input */}
            <div className="relative">
              <input
                type="text"
                name="username"
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Username"
                className="w-full p-4 border border-gray-300 rounded-lg"
              />
              {formik.touched.username && formik.errors.username && (
                <div className="absolute text-red-500 text-sm -bottom-5 left-0">
                  {formik.errors.username}
                </div>
              )}
            </div>

            {/* Email Input */}
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Email"
                className="w-full p-4 border border-gray-300 rounded-lg"
              />
              {formik.touched.email && formik.errors.email && (
                <div className="absolute text-red-500 text-sm -bottom-5 left-0">
                  {formik.errors.email}
                </div>
              )}
            </div>

            {/* Password Input */}
            <div className="relative">
              <input
                type="password"
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Password"
                className="w-full p-4 border border-gray-300 rounded-lg"
              />
              {formik.touched.password && formik.errors.password && (
                <div className="absolute text-red-500 text-sm -bottom-5 left-0">
                  {formik.errors.password}
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="relative">
              <input
                type="password"
                name="passwordConfirm"
                value={formik.values.passwordConfirm}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Confirm Password"
                className="w-full p-4 border border-gray-300 rounded-lg"
              />
              {formik.touched.passwordConfirm &&
                formik.errors.passwordConfirm && (
                  <div className="absolute text-red-500 text-sm -bottom-5 left-0">
                    {formik.errors.passwordConfirm}
                  </div>
                )}
            </div>

            {/* Gender Input */}
            <div className="relative">
              <select
                name="gender"
                value={formik.values.gender}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full p-4 border border-gray-300 rounded-lg">
                <option value="" label="Select your gender" />
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              {formik.touched.gender && formik.errors.gender && (
                <div className="absolute text-red-500 text-sm -bottom-5 left-0">
                  {formik.errors.gender}
                </div>
              )}
            </div>

            {/* Country Input */}
            <div className="relative">
              <select
                name="country"
                value={formik.values.country}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full p-4 border border-gray-300 rounded-lg">
                <option value="" label="Select your country" />
                <option value="Egypt">Egypt</option>
                <option value="USA">USA</option>
                <option value="UAE">UAE</option>
                {/* Add more countries as necessary */}
              </select>
              {formik.touched.country && formik.errors.country && (
                <div className="absolute text-red-500 text-sm -bottom-5 left-0">
                  {formik.errors.country}
                </div>
              )}
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="mt-8">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="terms"
                checked={formik.values.terms}
                onChange={handleCheckboxChange}
              />
              <span>Agree to the terms and conditions</span>
              {formik.touched.terms && formik.errors.terms && (
                <div className="text-red-500 text-sm mt-2">
                  {formik.errors.terms}
                </div>
              )}
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-yellow-300 text-black py-3 px-4 rounded-lg mt-4"
            disabled={loading || isLoading}>
            {loading || isLoading ? (
              <i className="fa fa-spin fa-spinner"></i>
            ) : (
              "Create Freelancer Account"
            )}
          </button>

          {error && <div className="text-red-800 text-sm mt-4">{error}</div>}
          {successMessage && (
            <div className="text-green-500 text-sm mt-4">
              {successMessage} <br />
              Please{" "}
              <Link to="/signin" className="text-blue-500 hover:underline">
                log in
              </Link>{" "}
              to continue.
            </div>
          )}

          <p className="mt-4 text-center">
            Already have an account?{" "}
            <Link to="/signin" className="text-blue-500 hover:underline">
              Log In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Employee",
    department: "",
    designation: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const passwordCriteria = {
    length: form.password.length >= 8,
    uppercase: /[A-Z]/.test(form.password),
    lowercase: /[a-z]/.test(form.password),
    number: /[0-9]/.test(form.password),
    match:
      form.password !== "" &&
      form.password === form.confirmPassword,
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !passwordCriteria.length ||
      !passwordCriteria.uppercase ||
      !passwordCriteria.lowercase ||
      !passwordCriteria.number
    ) {
      setError("Password does not meet complexity requirements.");
      return;
    }

    if (!passwordCriteria.match) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await axios.post("http://localhost:5000/api/register", {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        role: form.role,
        department:
          form.role === "Employee" ? form.department : undefined,
        designation:
          form.role === "Employee" ? form.designation : undefined,
      });

      alert("Registration Successful!");
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Registration Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid bg-light min-vh-100 d-flex align-items-center justify-content-center py-5">
      <div
        className="card shadow-lg border-0"
        style={{ maxWidth: "550px", width: "100%" }}
      >
        <div className="card-body p-4">

          <h2 className="text-center mb-4 text-primary">
            Create Account
          </h2>

          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister}>

            <div className="mb-3">
              <label className="form-label">
                Full Name
              </label>
              <input
                type="text"
                className="form-control"
                name="fullName"
                placeholder="Enter Full Name"
                value={form.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">
                Email Address
              </label>
              <input
                type="email"
                className="form-control"
                name="email"
                placeholder="Enter Email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">
                Password
              </label>

              <input
                type="password"
                className="form-control"
                name="password"
                placeholder="Enter Password"
                value={form.password}
                onChange={handleChange}
                required
              />

              {form.password && (
                <div className="card mt-3">
                  <div className="card-body py-2">
                    <h6>Password Requirements</h6>

                    <ul className="mb-0">

                      <li className={passwordCriteria.length ? "text-success" : "text-danger"}>
                        {passwordCriteria.length ? "✔" : "✖"} Minimum 8 characters
                      </li>

                      <li className={passwordCriteria.uppercase ? "text-success" : "text-danger"}>
                        {passwordCriteria.uppercase ? "✔" : "✖"} One Uppercase Letter
                      </li>

                      <li className={passwordCriteria.lowercase ? "text-success" : "text-danger"}>
                        {passwordCriteria.lowercase ? "✔" : "✖"} One Lowercase Letter
                      </li>

                      <li className={passwordCriteria.number ? "text-success" : "text-danger"}>
                        {passwordCriteria.number ? "✔" : "✖"} One Number
                      </li>

                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">
                Confirm Password
              </label>

              <input
                type="password"
                className={`form-control ${
                  form.confirmPassword
                    ? passwordCriteria.match
                      ? "is-valid"
                      : "is-invalid"
                    : ""
                }`}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />

              {!passwordCriteria.match &&
                form.confirmPassword && (
                  <div className="invalid-feedback d-block">
                    Passwords do not match.
                  </div>
                )}
            </div>

            <div className="mb-3">
              <label className="form-label">
                Role
              </label>

              <select
                className="form-select"
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <option value="Employee">
                  Employee
                </option>

                <option value="Admin">
                  Admin
                </option>
              </select>
            </div>

            {form.role === "Employee" && (
              <div className="border rounded p-3 mb-3 bg-light">

                <div className="mb-3">
                  <label className="form-label">
                    Department
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    name="department"
                    placeholder="Department"
                    value={form.department}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-0">
                  <label className="form-label">
                    Designation
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    name="designation"
                    placeholder="Designation"
                    value={form.designation}
                    onChange={handleChange}
                    required
                  />
                </div>

              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>

                  Registering...
                </>
              ) : (
                "Create Account"
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
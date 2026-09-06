import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000/api";

function Register() {
  const navigate = useNavigate(); // variable 


  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    phone_number: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);



  // e= event

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,

     // usename: Samrat
    }));

    setErrors((previousErrors) => ({
      ...previousErrors,
      [name]: "",
    }));
  }
  

  async function handleSubmit(event) {
    event.preventDefault();

    setErrors({});
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors(data);
        return;
      }

      

      setMessage("Registration successful. Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch {
      setMessage("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }



//   async function handleSubmit(event) {
//   event.preventDefault();

//   setErrors({});
//   setMessage("");
//   setLoading(true);

//   try {
//     const response = await axios.post(
//       `${API_URL}/register/`,
//       formData
//     );

//     console.log(response.data);

//     setMessage(
//       "Registration successful. Redirecting to login..."
//     );

//     setTimeout(() => {
//       navigate("/login");
//     }, 1200);
//   } catch (error) {
//     if (error.response) {
//       // Django responded with a validation error,
//       // such as an existing username or invalid email.
//       setErrors(error.response.data);
//     } else {
//       // The Django server could not be reached.
//       setMessage("Could not connect to the server.");
//     }
//   } finally {
//     setLoading(false);
//   }
// }





  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Create an account</h1>

        <p style={styles.subtitle}>
          Enter your information to register.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div>
            <label style={styles.label}>Username</label>

            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username"
              required
              style={styles.input}
            />

            {errors.username && (
              <p style={styles.error}>{errors.username[0]}</p>
            )}
          </div>

          <div>
            <label style={styles.label}>Full name</label>

            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              style={styles.input}
            />

            {errors.full_name && (
              <p style={styles.error}>{errors.full_name[0]}</p>
            )}
          </div>

          <div>
            <label style={styles.label}>Phone number</label>

            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="Enter phone number"
              required
              style={styles.input}
            />

            {errors.phone_number && (
              <p style={styles.error}>
                {errors.phone_number[0]}
              </p>
            )}
          </div>

          <div>
            <label style={styles.label}>Email</label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              required
              style={styles.input}
            />

            {errors.email && (
              <p style={styles.error}>{errors.email[0]}</p>
            )}
          </div>

          <div>
            <label style={styles.label}>Password</label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 8 characters"
              minLength={8}
              required
              style={styles.input}
            />

            {errors.password && (
              <p style={styles.error}>{errors.password[0]}</p>
            )}
          </div>

          {errors.non_field_errors && (
            <p style={styles.error}>
              {errors.non_field_errors[0]}
            </p>
          )}

          {message && <p style={styles.message}>{message}</p>}

          <button
            type="submit"
            disabled={loading}
            style={styles.button}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p style={styles.bottomText}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}





const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "30px 16px",
    background: "#f3f4f6",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "430px",
    padding: "32px",
    background: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 15px 40px rgba(0,0,0,0.1)",
  },
  title: {
    margin: "0 0 8px",
    fontSize: "30px",
  },
  subtitle: {
    margin: "0 0 24px",
    color: "#6b7280",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontWeight: "600",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "15px",
  },
  button: {
    padding: "13px",
    border: "none",
    borderRadius: "8px",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
  },
  error: {
    margin: "5px 0 0",
    color: "#dc2626",
    fontSize: "13px",
  },
  message: {
    margin: 0,
    color: "#16a34a",
    fontSize: "14px",
  },
  bottomText: {
    marginTop: "20px",
    textAlign: "center",
    color: "#6b7280",
  },
  link: {
    color: "#2563eb",
    fontWeight: "600",
    textDecoration: "none",
  },
};

export default Register;
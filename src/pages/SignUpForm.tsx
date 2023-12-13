import { useState } from "react";
import { Button, Form, Input, message, Typography } from "antd";
import { auth, db } from "../config/config";
import { sendPasswordResetEmail } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { getDocs, query, where  } from "firebase/firestore";
import TopNavigation from "../components/TopNavigation";
const { Title, Text } = Typography;

const SignUpForm = () => {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const [emailValue, setEmailValue] = useState(""); 
  const navigate = useNavigate();

  const handleFormToggle = () => {
    setIsSignUp(!isSignUp);
  };

   const handleEmailChange = (e: any) => {
    setEmailValue(e.target.value);
  };

const checkUsernameUniqueness = async (username: string) => {
  const usersCollection = collection(db, "users");
  const q = query(usersCollection, where("username", "==", username));
  
  const querySnapshot = await getDocs(q);

  if (querySnapshot.size > 0) {
    // Username already exists in the collection
    return false;
  }

  return true; // Username is unique
};

const handleSubmit = async (values: any) => {
  setLoading(true);

  try {
    if (isSignUp) {
      // If it's a sign-up, create a new user account
      const { email, password, firstName, lastName, username } = values;

      // Check if the username is unique
      const isUsernameUnique = await checkUsernameUniqueness(username);

      if (!isUsernameUnique) {
        setLoading(false);
        message.error("Username is already taken. Please choose a different one.");
        return;
      }

      // Create the user account
      await createUserWithEmailAndPassword(auth, email, password);

      // Store additional user information in the 'users' collection in Firestore
      const usersCollection = collection(db, "users");
      await addDoc(usersCollection, {
        email,
        firstName,
        lastName,
        username,
      });
      const backlogCollection = collection(db, "savedSlugIDs");
      await addDoc(backlogCollection, {
        email,
        names: [],
        games: [],
        ratings: [],
        status: [],
      });
      message.success("Account created successfully!");
    } else {
      values.email = emailValue;
      const { email, password } = values;
      // If it's a sign-in, handle sign-in logic (you can use signInWithEmailAndPassword)
      // ...
      // console.log(values)
      try {
        await signInWithEmailAndPassword(auth, email, password)
        message.success("Sign in successful!");
        navigate('/', {state: {email: email}});
      } catch (error) {
          message.error('User not found. Please check your email or sign up.');
      }
    }
  } catch (error) {
    console.error("Error creating user account:", error);
    message.error("Failed to create user account. Please try again.");
  } finally {
    setLoading(false);
  }

  form.resetFields();
};

const [form] = Form.useForm();

  const handleForgotPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, emailValue); // Use the stored email value
      message.success("Password reset email sent. Check your inbox.");
    } catch (error) {
      message.error("Failed to send a password reset email. Please check your email address if correct/exists.");
    }
  };

  

  return (
    <div>
      <TopNavigation email={""}></TopNavigation>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#004080' }}>
      <div className="signup-form" style={{ backgroundColor: '#e6f7ff', color: 'white', padding: '20px', borderRadius: '8px', width: '800px' }}>
        <Title className="signup-form-title" level={1}>
          {isSignUp ? "Sign Up" : "Sign In"}
        </Title>
        <Form form={form} onFinish={handleSubmit}>
        {!isSignUp && (
          <>
    <Form.Item
              className="signup-form-item"
              label="Email"
              name="email"
              rules={[
                // { required: true, message: "Please enter your email" },
                { type: "email", message: "Please enter a valid email" },
              ]}
            >
              <Input onChange={handleEmailChange}/> {/* Add onChange event handler */}
            </Form.Item>
           <Form.Item
              className="signup-form-item"
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please enter your password" },
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item className="signup-form-forgot-password">
              <Button type="link" onClick={handleForgotPassword}>
                Forgot Password
              </Button>
            </Form.Item>
          </>
        )}
        {isSignUp && (
          <>
            <Form.Item
              className="signup-form-item"
              label="First Name"
              name="firstName"
            >
              <Input />
            </Form.Item>
            <Form.Item
              className="signup-form-item"
              label="Last Name"
              name="lastName"
            >
              <Input />
            </Form.Item>
            <Form.Item
              className="signup-form-item"
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Please enter a valid email" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              className="signup-form-item"
              label="Username"
              name="username"
              rules={[
                { required: true, message: "Please enter your username" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              className="signup-form-item"
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please enter your password" },
              ]}
            >
              <Input.Password />
            </Form.Item>
          </>
        )}
        <Form.Item className="signup-form-submit-button">
          <Button type="primary" htmlType="submit" loading={loading} size={'middle'} block>
            {isSignUp ? "Sign Up" : "Sign In"}
          </Button>
        </Form.Item>
        <Form.Item className="signup-form-toggle">
          <Text>
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
            <Button type="link" onClick={handleFormToggle}>
              {isSignUp ? "Sign In" : "Sign Up"}
            </Button>
          </Text>
        </Form.Item>
      </Form>
      </div>
      </div>
      </div>
  );
};

export default SignUpForm;

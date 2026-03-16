export const login = async (email, password) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Mock Login avec:", email);
      resolve({ token: "fake-jwt-token", user: { email } });
    }, 1000);
  });
};
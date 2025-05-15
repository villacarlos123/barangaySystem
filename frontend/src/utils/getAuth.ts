export const getAuth = () => {
    const data = sessionStorage.getItem("user");
    return data ? JSON.parse(data) : null;
  };
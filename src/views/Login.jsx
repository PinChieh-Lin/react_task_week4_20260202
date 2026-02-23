import { useState } from "react";
import axios from "axios";
const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function Login({setIsAuth,getProducts}) {
  const [formData, setFormData] = useState({
    username: "p55482301@yahoo.com.tw",
    password: "dingdong",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // console.log(name, value); //檢查輸入的欄位名稱與值
    setFormData((preData) => ({
      ...preData,//解構先前的資料
      [name]: value,//動態設定欄位名稱與值
    }));
  }

  const onSubmit = async (e) => {
    try {
      e.preventDefault();
      const response = await axios.post(`${API_BASE}/admin/signin`, formData);
      // console.log(response.data);
      const { token, expired } = response.data;
      // 設定 Cookie
      document.cookie = `hexToken=${token};expires=${new Date(expired)};`;
      // 修改實體建立時所指派的預設配置
      axios.defaults.headers.common['Authorization'] = token;
      getProducts();

      setIsAuth(true);
    } catch (err) {
      setIsAuth(false);
      console.log(err.response);
      //印出錯誤訊息
      // alert(err.response?.data?.message);
    }
  }
  return (
    <div className="container login">
      <h1>請先登入</h1>
      <form className="form-floating" onSubmit={(e) => onSubmit(e)}>
        <div className="form-floating mb-3">
          <input type="email" className="form-control" name="username" placeholder="name@example.com"
            value={formData.username}
            onChange={(e) => handleInputChange(e)} />
          <label htmlFor="username">Email address</label>
        </div>
        <div className="form-floating">
          <input type="password" className="form-control" name="password" placeholder="Password"
            value={formData.password}
            onChange={(e) => handleInputChange(e)} />
          <label htmlFor="password">Password</label>
        </div>
        <button type="submit" className="btn btn-primary w-100 mt-2">登入</button>
      </form>
    </div>
  )
} export default Login;
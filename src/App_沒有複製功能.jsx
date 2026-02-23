import React, { useEffect, useState } from 'react'
import axios from "axios";
import * as bootstrap from 'bootstrap';
import { useRef } from 'react'
// App.jsx
import "./assets/style.css";

//檢查環境變數是否有正確載入
// console.log('import.meta.env', import.meta.env);
// API 設定
const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

//產品初始值
const INITA_TEMPATE_DATA = {
  id: "",
  title: "",
  category: "",
  origin_price: "",
  price: "",
  unit: "",
  description: "",
  content: "",
  is_enabled: false,
  imageUrl: "",
  imagesUrl: [],
};

function App() {
  const [formData, setFormData] = useState({
    username: "p55482301@yahoo.com.tw",
    password: "dingdong",
  });
  const [isAuth, setIsAuth] = useState(false);
  const [products, setProducts] = useState([]);
  const [templateProduct, setTemplateProduct] = useState(INITA_TEMPATE_DATA);
  const [modalType, setModalType] = useState(""); //新增或編輯

  const productModalRef = useRef(null);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // console.log(name, value); //檢查輸入的欄位名稱與值
    setFormData((preData) => ({
      ...preData,//解構先前的資料
      [name]: value,//動態設定欄位名稱與值
    }));
  }

  const handleModalInputChange = (e) => {
    const { name, value, checked, type } = e.target; //取得輸入欄位的名稱、值、選取狀態與類型
    // console.log(name, value); //檢查輸入的欄位名稱與值
    setTemplateProduct((preData) => ({
      ...preData,//解構先前的資料
      [name]: type === 'checkbox' ? checked : value, //如果是checkbox則取checked值，否則取value值
    }));
  }

  const handleAddImage = () => {
    setTemplateProduct((pre) => {
      const newImage = [...pre.imagesUrl]//複製陣列
      newImage.push("") //在陣列末端新增一個空字串
      return {
        ...pre,
        imagesUrl: newImage //更新陣列
      }
    })
  }
  const handleRemoveImage = () => {
    setTemplateProduct((pre) => {
      const newImage = [...pre.imagesUrl]; //複製陣列
      newImage.pop(); //移除陣列末端的元素
      return {
        ...pre,
        imagesUrl: newImage, //更新陣列
      }
    })


  }

  const handleModlaImageChange = (index, value) => {
    setTemplateProduct((pre) => {
      const newImage = [...pre.imagesUrl]; //複製陣列
      newImage[index] = value; //更新指定索引的值

      if (value !== "" && index === newImage.length - 1 && newImage.length < 5) {
        newImage.push(""); //如果最後一個輸入框有值且小於5張圖片，則新增一個空字串
      }

      //自動移除多餘的空白輸入框
      if (value === "" && newImage.length > 1 && newImage[newImage.length - 1] === "") {
        newImage.pop(); //如果輸入框為空且陣列長度大於1且最後一個元素為空字串，則移除最後一個元素
      }
      return { //返回新的物件
        ...pre,
        imagesUrl: newImage, //更新陣列
      }
    })
  }

  const gatProducts = async () => {
    try {

      const response = await axios.get(`${API_BASE}/api/${API_PATH}/products`);
      // console.log(response.data.products);
      setProducts(response.data.products);
    } catch (err) {
      console.log(err.response);
    }
  }

  const updateProduct = async () => {
    let url = `${API_BASE}/api/${API_PATH}/admin/product`;
    let method = "post";
    if (modalType === "edit") {
      url = `${API_BASE}/api/${API_PATH}/admin/product/${templateProduct.id}`;
      method = "put";
    }


    const productData = {
      data: {
        ...templateProduct,
        origin_price: Number(templateProduct.origin_price),//轉換為數字
        price: Number(templateProduct.price),
        is_enabled: templateProduct.is_enabled ? 1 : 0,//三元運算子轉換為0或1(布林值)
        imageUrl: [...templateProduct.imagesUrl.filter(url => url !== "")], //展開陣列並過濾空字串 
      }
    }
    try {
      // const response = await axios.post(url,productData);
      const response = await axios[method](url, productData);
      console.log(response.data);
      gatProducts();
      closeModal();
    } catch (err) {
      console.log(err.response);
    }
  }

  const delProduct = async (id) =>{
    try{
        const response =await axios.delete(`${API_BASE}/api/${API_PATH}/admin/product/${id}`)
          console.log(response.data);
          gatProducts();
          closeModal();
    }catch(err){
      console.log(err.response);
    }
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
      gatProducts();

      setIsAuth(true);
    } catch (err) {
      setIsAuth(false);
      console.log(err.response);
      //印出錯誤訊息
      // alert(err.response?.data?.message);
    }
  }



  useEffect(() => {
    // 讀取 Cookie
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("hexToken="))
      ?.split("=")[1];
    if (token) {

      axios.defaults.headers.common['Authorization'] = token;
    }
    productModalRef.current = new bootstrap.Modal('#productModal', {
      keyboard: false,
    })
    const checkLogin = async () => {
      try {
        const response = await axios.post(`${API_BASE}/api/user/check`);
        console.log(response.data);
        setIsAuth(true);
        gatProducts();
      } catch (err) {
        console.log(err.response);
        alert("目前為未登入狀態");
      }
    }
    checkLogin();
  }, []);

  const openModal = (type, product) => { //type:新增或編輯
    // console.log(type,product); //檢查參數
    setModalType(type);
    setTemplateProduct((pre) => ({
      ...pre, //解構先前的資料 pre是templateProduct先前的值
      ...product //覆蓋要編輯的產品資料 
    }));
    productModalRef.current.show();
  }

  const closeModal = () => {
    productModalRef.current.hide();
  }
  return (
    <>
      {/* !isAuth 代表未登入 */}
      {!isAuth ? (<div className="container login">
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
      </div>) : (<div className="container">

        <h2>產品列表</h2>
        <div className="text-end mt-4">
          <button
            type="button"
            className="btn btn-primary mb-3"
            onClick={() => openModal("create", INITA_TEMPATE_DATA)}>
            建立新的產品
          </button>
          
        </div>

        <table className="table">
          <thead className="table-dark">
            <tr>
              <th>分類</th>
              <th>產品名稱</th>
              <th>原價</th>
              <th>售價</th>
              <th>是否啟用</th>
              <th>編輯</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.category}</td>
                <td>{product.title}</td>
                <td>{product.origin_price}</td>
                <td>{product.price}</td>
                <td className={`${product.is_enabled && 'text-success'}`}>{product.is_enabled ? "啟用" : "不啟用"}</td>
                <td>
                  <div className="btn-group" role="group" aria-label="Basic example">
                    <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => openModal("edit", product)}>編輯</button>
                    <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => openModal('delete', product)}>刪除</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
        // </div>
      )
      }

      <div className="modal fade" id="productModal" tabIndex="-1" aria-labelledby="productModalLabel" aria-hidden="true"
        ref={productModalRef}>
        <div className="modal-dialog modal-xl">
          <div className="modal-content border-0">
            <div className={`modal-header bg-${modalType === 'delete' ? 'danger' : 'dark'} text-white`}>
              <h5 id="productModalLabel" className="modal-title">
                <span>{modalType === 'delete' ? '刪除' : modalType === 'edit' ? '編輯' : '新增'}產品</span>
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {modalType === 'delete' ? (<p className="fs-4">
                確定要刪除
                <span className="text-danger">{templateProduct.title}</span>嗎？
              </p>) : (
                <div className="row">
                  <div className="col-sm-4">
                    <div className="mb-2">
                      <div className="mb-3">
                        <label htmlFor="imageUrl" className="form-label">
                          輸入圖片網址
                        </label>
                        <input
                          type="text"
                          id="imageUrl"
                          name="imageUrl"
                          className="form-control"
                          placeholder="請輸入圖片連結"
                          value={templateProduct.imageUrl}
                          onChange={(e) => handleModalInputChange(e)}
                        />
                      </div>
                      {templateProduct.imageUrl && ( // 只有 imageUrl 有值時才顯示圖片
                        <img className="img-fluid" src={templateProduct.imageUrl} alt="主圖" />

                      )}
                    </div>
                    <div>
                      {templateProduct.imagesUrl.map((url, index) => (

                        <div key={index}>
                          <label htmlFor="imageUrl" className="form-label">
                            輸入圖片網址
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder={`圖片網址${index + 1}`}
                            value={url}
                            onChange={(e) => handleModlaImageChange(index, e.target.value)} //更新指定索引的圖片網址 
                          />
                          {url && ( // 只有 url 有值時才顯示圖片
                            <img
                              className="img-fluid"
                              src={url}
                              alt={`副圖${index + 1}`}
                            />

                          )}
                        </div>

                      ))}

                      {/* 新增圖片按鈕，當圖片數量小於5且最後一個輸入框有值時顯示 */}                    {templateProduct.imagesUrl.length < 5 &&
                        templateProduct.imagesUrl[templateProduct.imagesUrl.length - 1] !== "" &&
                        <button className="btn btn-outline-primary btn-sm d-block w-100"
                          onClick={() => handleAddImage()}>
                          新增圖片
                        </button>
                      }

                    </div>
                    <div>
                      {/* 刪除圖片按鈕，當圖片數量大於等於1時顯示 */}
                      {templateProduct.imagesUrl.length >= 1 &&
                        <button className="btn btn-outline-danger btn-sm d-block w-100"
                          onClick={() => handleRemoveImage()}>
                          刪除圖片
                        </button>
                      }
                    </div>
                  </div>
                  <div className="col-sm-8">
                    <div className="mb-3">
                      <label htmlFor="title" className="form-label">標題</label>
                      <input
                        name="title"
                        id="title"
                        type="text"
                        className="form-control"
                        placeholder="請輸入標題"
                        value={templateProduct.title}
                        onChange={(e) => handleModalInputChange(e)} //輸入變更時觸發
                        disabled={modalType === 'edit'}//編輯模式下禁止修改標題
                      />
                    </div>

                    <div className="row">
                      <div className="mb-3 col-md-6">
                        <label htmlFor="category" className="form-label">分類</label>
                        <input
                          name="category"
                          id="category"
                          type="text"
                          className="form-control"
                          placeholder="請輸入分類"
                          value={templateProduct.category}
                          onChange={(e) => handleModalInputChange(e)}
                          disabled={modalType === 'edit'}//編輯模式下禁止修改分類
                        />
                      </div>
                      <div className="mb-3 col-md-6">
                        <label htmlFor="unit" className="form-label">單位</label>
                        <input
                          name="unit"
                          id="unit"
                          type="text"
                          className="form-control"
                          placeholder="請輸入單位"
                          value={templateProduct.unit}
                          onChange={(e) => handleModalInputChange(e)}
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="mb-3 col-md-6">
                        <label htmlFor="origin_price" className="form-label">原價</label>
                        <input
                          name="origin_price"
                          id="origin_price"
                          type="number"
                          min="0"
                          className="form-control"
                          placeholder="請輸入原價"
                          value={templateProduct.origin_price}
                          onChange={(e) => handleModalInputChange(e)}
                        />
                      </div>
                      <div className="mb-3 col-md-6">
                        <label htmlFor="price" className="form-label">售價</label>
                        <input
                          name="price"
                          id="price"
                          type="number"
                          min="0"
                          className="form-control"
                          placeholder="請輸入售價"
                          value={templateProduct.price}
                          onChange={(e) => handleModalInputChange(e)}
                        />
                      </div>
                    </div>
                    <hr />

                    <div className="mb-3">
                      <label htmlFor="description" className="form-label">產品描述</label>
                      <textarea
                        name="description"
                        id="description"
                        className="form-control"
                        placeholder="請輸入產品描述"
                        value={templateProduct.description}
                        onChange={(e) => handleModalInputChange(e)}
                      ></textarea>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="content" className="form-label">說明內容</label>
                      <textarea
                        name="content"
                        id="content"
                        className="form-control"
                        placeholder="請輸入說明內容"
                        value={templateProduct.content}
                        onChange={(e) => handleModalInputChange(e)}
                      ></textarea>
                    </div>
                    <div className="mb-3">
                      <div className="form-check">
                        <input
                          name="is_enabled"
                          id="is_enabled"
                          className="form-check-input"
                          type="checkbox"
                          checked={templateProduct.is_enabled}
                          onChange={(e) => handleModalInputChange(e)}
                        />
                        <label className="form-check-label" htmlFor="is_enabled">
                          是否啟用
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
            <div className="modal-footer">
              {modalType === 'delete' ? (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick = {()=> delProduct(templateProduct.id)}
                >
                  刪除
                </button>

              ) : (
                <> <button
                  type="button"
                  className="btn btn-outline-secondary"
                  data-bs-dismiss="modal"
                  onClick={() => closeModal()}
                >
                  取消
                </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => updateProduct(templateProduct.id)}>確認
                  </button></>

              )}

            </div>
          </div>
        </div>
      </div>
    </>

  );
}

export default App

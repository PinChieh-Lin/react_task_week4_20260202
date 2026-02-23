import React, { useEffect, useState } from 'react'
import axios from "axios";
import * as bootstrap from 'bootstrap';
import { useRef } from 'react'
// App.jsx
import "./assets/style.css";
import ProductModal from './components/ProductModal';
import Pagination from './components/Pagination';
import Login from './views/Login';

//檢查環境變數是否有正確載入
// console.log('import.meta.env', import.meta.env);
// API 設定
const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

//產品初始值
const INITIAL_TEMPLATE_DATA = {
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
  size:"",
};

function App() {
  
  const [isAuth, setIsAuth] = useState(false);
  const [products, setProducts] = useState([]);
  const [templateProduct, setTemplateProduct] = useState(INITIAL_TEMPLATE_DATA);
  const [modalType, setModalType] = useState(""); //新增或編輯
  const [pagination, setPagination] = useState({});
  const productModalRef = useRef(null);
 



  const getProducts = async (page = 1) => {
    try {
      //?page=${page}` 分頁參數
      const response = await axios.get(`${API_BASE}/api/${API_PATH}/products?page=${page}`);
      // console.log(response.data.products);
      setProducts(response.data.products);
      setPagination(response.data.pagination);
    } catch (err) {
      console.log(err.response);
    }
  }
  //原本少加id






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
        getProducts();
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
    // setTemplateProduct((pre) => ({ //前一筆資料會殘留
    //   ...pre, //解構先前的資料 pre是templateProduct先前的值
    //   ...product //覆蓋要編輯的產品資料 
    // }));
    setTemplateProduct({
    ...INITIAL_TEMPLATE_DATA,
    ...product,
  });
    productModalRef.current.show();
  }

  const closeModal = () => {
    productModalRef.current.hide();
  }
  return (
    <>
      {/* !isAuth 代表未登入 */}
      {!isAuth ? (
        <Login setIsAuth={setIsAuth} getProducts={getProducts} />
        ) : (<div className="container">

        <h2>產品列表_挑戰拆分</h2>
        <div className="text-end mt-4">
          <button
            type="button"
            className="btn btn-primary mb-3"
            onClick={() => openModal("create", INITIAL_TEMPLATE_DATA)}>
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
        <Pagination pagination={pagination} onChangePage={getProducts}/>

      </div>
        // </div>
      )
      }
      {/* 產品模態框元件 */}
      <ProductModal
        modalType={modalType}
        templateProduct={templateProduct}
        getProducts={getProducts}
        closeModal={closeModal}
      />

    </>

  );
}

export default App

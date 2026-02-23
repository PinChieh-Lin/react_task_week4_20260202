import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function ProductModal({
    modalType,
    templateProduct,
    getProducts,
    closeModal,
}) {
    const [tempData, setTempData] = useState(templateProduct);
    //當前暫存的產品資料
    useEffect(() => {
        setTempData(templateProduct);//當templateProduct改變時，更新tempData
    }, [templateProduct])//依賴陣列監聽templateProduct的變化

    const handleModalInputChange = (e) => {
        const { name, value, checked, type } = e.target; //取得輸入欄位的名稱、值、選取狀態與類型
        // console.log(name, value); //檢查輸入的欄位名稱與值
        setTempData((preData) => ({
            ...preData,//解構先前的資料
            [name]: type === 'checkbox' ? checked : value, //如果是checkbox則取checked值，否則取value值
        }));
    }

    const handleAddImage = () => {
        setTempData((pre) => {
            const newImage = [...pre.imagesUrl]//複製陣列
            newImage.push("") //在陣列末端新增一個空字串
            return {
                ...pre,
                imagesUrl: newImage //更新陣列
            }
        })
    }
    const handleRemoveImage = () => {
        setTempData((pre) => {
            const newImage = [...pre.imagesUrl]; //複製陣列
            newImage.pop(); //移除陣列末端的元素
            return {
                ...pre,
                imagesUrl: newImage, //更新陣列
            }
        })


    }

    const handleModalImageChange = (index, value) => {
        setTempData((pre) => {
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

    const updateProduct = async (id) => {
        let url = `${API_BASE}/api/${API_PATH}/admin/product`;
        let method = "post";
        if (modalType === "edit") {
            url = `${API_BASE}/api/${API_PATH}/admin/product/${id}`;
            method = "put";
        }


        const productData = {
            data: {
                ...tempData,
                origin_price: Number(tempData.origin_price),//轉換為數字
                price: Number(tempData.price),
                is_enabled: tempData.is_enabled ? 1 : 0,//三元運算子轉換為0或1(布林值)
                // imageUrl: [...tempData.imagesUrl.filter(url => url !== "")], 寫錯少一個s
                imagesUrl: [...tempData.imagesUrl.filter(url => url !== "")], //展開陣列並過濾空字串 
            }
        }
        try {
            const response = await axios[method](url, productData);
            console.log(response.data);
            getProducts();
            closeModal();
        } catch (err) {
            console.log(err.response);
        }
    }

    const delProduct = async (id) => {
        try {
            const response = await axios.delete(`${API_BASE}/api/${API_PATH}/admin/product/${id}`)
            console.log(response.data);
            getProducts();
            closeModal();
        } catch (err) {
            console.log(err.response);
        }
    }

    const uploadImage = async (e) => {
        const file = e.target.files?.[0];
        if (!file) {
            return
        }
        try {
            const formData = new FormData();//建立FormData物件
            formData.append('file-to-upload', file);//加入檔案
            const response = await axios.post(`${API_BASE}/api/${API_PATH}/admin/upload`, formData,

            );
            setTempData((pre) => ({
                ...pre,
                imageUrl: response.data.imageUrl,
            }));
        } catch (error) {
            console.log(error.response);
        }
    }
    return (
        <div className="modal fade" id="productModal" tabIndex="-1" aria-labelledby="productModalLabel" aria-hidden="true">
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
                            <span className="text-danger">{tempData.title}</span>嗎？
                        </p>) : (
                            <div className="row">
                                <div className="col-sm-4">
                                    <div className="mb-2">
                                        <div className="mb-3">
                                            <label htmlFor="fileUpload" className="form-label">
                                                上傳圖片
                                            </label>
                                            <input className="form-control"
                                                type="file"
                                                name="fileUpload"
                                                id="fileUpload"
                                                accept=".jpg, .jpeg, .png"
                                                onChange={(e) => uploadImage(e)}
                                            />
                                        </div>
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
                                                value={tempData.imageUrl}
                                                onChange={(e) => handleModalInputChange(e)}
                                            />
                                        </div>
                                        {tempData.imageUrl && ( // 只有 imageUrl 有值時才顯示圖片
                                            <img className="img-fluid" src={tempData.imageUrl} alt="主圖" />

                                        )}
                                    </div>
                                    <div>
                                        {tempData.imagesUrl.map((url, index) => (

                                            <div key={index}>
                                                <label htmlFor="imageUrl" className="form-label">
                                                    輸入圖片網址
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder={`圖片網址${index + 1}`}
                                                    value={url}
                                                    onChange={(e) => handleModalImageChange(index, e.target.value)} //更新指定索引的圖片網址 
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

                                        {/* 新增圖片按鈕，當圖片數量小於5且最後一個輸入框有值時顯示 */}                    {tempData.imagesUrl.length < 5 &&
                                            tempData.imagesUrl[tempData.imagesUrl.length - 1] !== "" &&
                                            <button className="btn btn-outline-primary btn-sm d-block w-100"
                                                onClick={() => handleAddImage()}>
                                                新增圖片
                                            </button>
                                        }

                                    </div>
                                    <div>
                                        {/* 刪除圖片按鈕，當圖片數量大於等於1時顯示 */}
                                        {tempData.imagesUrl.length >= 1 &&
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
                                            value={tempData.title}
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
                                                value={tempData.category}
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
                                                value={tempData.unit}
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
                                                value={tempData.origin_price}
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
                                                value={tempData.price}
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
                                            value={tempData.description}
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
                                            value={tempData.content}
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
                                                checked={tempData.is_enabled}
                                                onChange={(e) => handleModalInputChange(e)}
                                            />
                                            <label className="form-check-label" htmlFor="is_enabled">
                                                是否啟用
                                            </label>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-check-label" htmlFor="size">
                                            尺寸
                                        </label>
                                        <select
                                            id="size"
                                            name="size"
                                            className="form-select"
                                            aria-label="Default select example"
                                            value={tempData.size}
                                            onChange={(e) => handleModalInputChange(e)}
                                        >
                                            <option value="">請選擇</option>
                                            <option value="lg">大杯</option>
                                            <option value="md">中杯</option>
                                            <option value="sm">小杯</option>
                                        </select>
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
                                onClick={() => delProduct(templateProduct.id)}
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
                                    // onClick={() => updateProduct(templateProduct.id)} 原本沒有判斷
                                    onClick={() => modalType === 'edit' ? updateProduct(templateProduct.id) : updateProduct()}>確認
                                </button></>

                        )}

                    </div>
                </div>
            </div>
        </div>
    )
} export default ProductModal
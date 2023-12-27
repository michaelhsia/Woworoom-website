import axios from "axios";
import Swal from "sweetalert2";
import moment from "moment/moment";

const url =
  "https://livejs-api.hexschool.io/api/livejs/v1/customer/michaelhsia";

// Scrollspy
document.addEventListener("DOMContentLoaded", function () {
  const ele = document.querySelector(".recommendation-wall");
  ele.style.cursor = "grab";
  let pos = { top: 0, left: 0, x: 0, y: 0 };
  const mouseDownHandler = function (e) {
    ele.style.cursor = "grabbing";
    ele.style.userSelect = "none";

    pos = {
      left: ele.scrollLeft,
      top: ele.scrollTop,
      // Get the current mouse position
      x: e.clientX,
      y: e.clientY,
    };

    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("mouseup", mouseUpHandler);
  };
  const mouseMoveHandler = function (e) {
    // How far the mouse has been moved
    const dx = e.clientX - pos.x;
    const dy = e.clientY - pos.y;

    // Scroll the element
    ele.scrollTop = pos.top - dy;
    ele.scrollLeft = pos.left - dx;
  };
  const mouseUpHandler = function () {
    ele.style.cursor = "grab";
    ele.style.removeProperty("user-select");

    document.removeEventListener("mousemove", mouseMoveHandler);
    document.removeEventListener("mouseup", mouseUpHandler);
  };
  // Attach the handler
  ele.addEventListener("mousedown", mouseDownHandler);
});

// 初始渲染
function init() {
  getProduct();
  getCart();
}

// 包裝用 function
// 購物車沒東西時跳出視窗通知
function clearCartAlert() {
  Swal.fire({
    title: "購物車沒東西了！快買點東西！",
    icon: "warning",
    showConfirmButton: false,
    timer: 2000,
  });
}

// 捕捉錯誤跳出視窗通知
function catchErrorAlert(err) {
  Swal.fire({
    icon: "error",
    title: "錯誤",
    text: `${err.message}`,
  });
}

// 每次做更新後重新渲染購物車
function reRenderCart(res) {
  cartData = res.data.carts;
  finalTotal = res.data.finalTotal;
  renderShoppingCart(cartData, finalTotal);
}

// 商品列表相關
// 宣告變數儲存商品資訊
let productData = [];

// 取得商品資料功能
function getProduct() {
  axios
    .get(`${url}/products`)
    .then((res) => {
      productData = res.data.products;
      renderProductList(productData);
    })
    .catch((err) => {
      catchErrorAlert(err);
    });
}

// 渲染商品列表資訊
const productWrap = document.querySelector(".productWrap");

function renderProductList(data) {
  let str = ``;
  // data-id 是商品id 加入購物車 post 時使用
  data.forEach((item) => {
    str += `<li class="productCard">
    <h4 class="productType">新品</h4>
    <img
      src="${item.images}"
      alt=""
    />
    <a href="#" class="addCardBtn" data-id=${item.id}>加入購物車</a>
    <h3>${item.title}</h3>
    <del class="originPrice">NT$${item.origin_price}</del>
    <p class="nowPrice">NT$${item.price}</p>
  </li>`;
  });

  productWrap.innerHTML = str;
}

// 商品列表篩選監聽
const productSelect = document.querySelector(".productSelect");

productSelect.addEventListener("change", renderSelectProducts);

// 商品列表篩選功能
function renderSelectProducts(e) {
  if (e.target.value === undefined) {
    return;
  }

  // 篩選全部 -> 渲染所有商品
  if (e.target.value === "全部") {
    renderProductList(productData);
  } else {
    // filter 用來裝篩選後的產品
    let filterData = [];
    productData.forEach((item) => {
      if (e.target.value === item.category) {
        filterData.push(item);
      }
    });
    renderProductList(filterData);
  }
}

// 購物車相關
// 裝購物車資料，每一個商品加入購物車後都有獨立的購物車id(cartId)
let cartData = [];
// 購物車總價
let finalTotal = 0;

// 取得購物車資料
function getCart() {
  axios
    .get(`${url}/carts`)
    .then((res) => {
      reRenderCart(res);
      if (cartData.length === 0) {
        clearCartAlert();
      }
    })
    .catch((err) => {
      catchErrorAlert(err);
    });
}

// 渲染購物車表格監聽
const shoppingCartTable = document.querySelector(".shoppingCart-table");

// 渲染購物車功能
function renderShoppingCart(data, finalTotal) {
  // 如果購物車沒東西就不渲染，直接 return
  if (cartData.length === 0) {
    shoppingCartTable.innerHTML = `<p>快去買點東西，不要當鐵公雞</p>`;
    return;
  }

  let str = `<thead>
  <tr>
    <th width="40%">品項</th>
    <th width="15%">單價</th>
    <th width="15%">數量</th>
    <th width="15%">金額</th>
    <th width="15%"></th>
  </tr>
</thead>`;

  // data-num 追蹤購物車的商品數量、data-id 用來更新購物車時戳 API 使用
  data.forEach(function (item) {
    str += `<tr>
    <td>
      <div class="cardItem-title">
        <img src="${item.product.images}" alt="" />
        <p>${item.product.title}</p>
      </div>
    </td>
    <td>NT$${item.product.price}</td>
    <td>
    <div class="d-flex justify-content-between align-items-center">
        <button class="countIcon">
        <span class="material-icons" data-name="cartAmount-icon" data-num=${
          item.quantity - 1
        } data-id=${item.id}>removed</span>
        </button>
       ${
         item.quantity
       }<button class="countIcon"><span class="material-icons"  data-name="cartAmount-icon" data-num=${
      item.quantity + 1
    } data-id=${item.id}>add</span>
        </button>
        </div>
    </td>
    <td>NT$${item.product.price * item.quantity}</td>
    <td class="discardBtn">
      <a href="#" class="material-icons" data-name="delete" data-id=${
        item.id
      }> clear </a>
    </td>
  </tr>`;
  });

  str += `<tfoot>
  <tr>
    <td>
      <a href="#" class="discardAllBtn">刪除所有品項</a>
    </td>
    <td></td>
    <td></td>
    <td>
      <p>總金額</p>
    </td>
    <td>NT$ ${finalTotal}</td>
  </tr>
</tfoot>`;

  shoppingCartTable.innerHTML = str;
}

// 購物車列表監聽
productWrap.addEventListener("click", function (e) {
  e.preventDefault();

  // 偵測是否為「加入購物車」按鈕
  if (e.target.getAttribute("class") !== "addCardBtn") {
    return;
  }

  let productId = e.target.getAttribute("data-id");
  let numCheck = 1;

  // 判斷購物車內是否已經有該商品，有的話商品數 + 1
  cartData.forEach((item) => {
    if (item.product.id === productId) {
      numCheck = item.quantity += 1;
    }
  });

  addProductToCart(productId, numCheck);
});

// 加入購物車功能，用三元運算子偵測 alert 顯示文字
function addProductToCart(productId, numCheck) {
  axios
    .post(`${url}/carts`, {
      data: {
        productId: productId,
        quantity: numCheck,
      },
    })
    .then((res) => {
      reRenderCart(res);

      Swal.fire({
        title: `${numCheck === 1 ? "成功加入新商品" : "成功更新已有商品數量"}`,
        icon: "success",
        showConfirmButton: false,
        timer: 1500,
      });
    })
    .catch((err) => {
      catchErrorAlert(err);
    });
}

// 購物車表格監聽
shoppingCartTable.addEventListener("click", function (e) {
  e.preventDefault();

  // id 為購物車 id，num 為該購物車商品數量
  let id = e.target.dataset.id;
  let num = parseInt(e.target.dataset.num);

  // 刪除單一購物車判斷
  if (e.target.getAttribute("data-name") === "delete") {
    delSingleBtn(id);
  }
  // 購物車數字加減按鈕判斷
  else if (e.target.getAttribute("data-name") === "cartAmount-icon") {
    editCartNum(num, id);
  }
  // 刪除所有購物車判斷
  else if (e.target.getAttribute("class") === "discardAllBtn") {
    delAllCart();
  }
});

// 刪除單一購物車功能
function delSingleBtn(id) {
  axios
    .delete(`${url}/carts/${id}`)
    .then((res) => {
      reRenderCart(res);

      Swal.fire({
        title: "成功刪除商品",
        icon: "success",
        showConfirmButton: false,
        timer: 1500,
      });
      if (cartData.length === 0) {
        setTimeout(function () {
          clearCartAlert();
        }, 1500);
      }
    })
    .catch(function (err) {
      catchErrorAlert(err);
    });
}

// 購物車數字加減按鈕功能
function editCartNum(num, id) {
  if (num > 0) {
    axios
      .patch(`${url}/carts`, {
        data: {
          id: id,
          quantity: num,
        },
      })
      .then((res) => {
        reRenderCart(res);
        Swal.fire({
          title: "成功更新已有商品數量",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
        });
      })
      .catch(function (err) {
        catchErrorAlert(err);
      });
  } else {
    delSingleBtn(id);
  }
}

// 刪除所有購物車功能
function delAllCart() {
  axios
    .delete(`${url}/carts`)
    .then((res) => {
      reRenderCart(res);
      Swal.fire({
        title: "成功清空購物車",
        icon: "success",
        showConfirmButton: false,
        timer: 1500,
      });

      setTimeout(function () {
        clearCartAlert();
      }, 1500);
    })
    .catch((err) => {
      catchErrorAlert(err);
    });
}

// 前台表單
const orderInfoForm = document.querySelector(".orderInfo-form");
const customerName = document.querySelector("#customerName");
const customerPhone = document.querySelector("#customerPhone");
const customerEmail = document.querySelector("#customerEmail");
const customerAddress = document.querySelector("#customerAddress");
const tradeWay = document.querySelector("#tradeWay");

orderInfoForm.addEventListener("submit", function (e) {
  e.preventDefault();
  if (
    customerName.value !== "" &&
    customerPhone.value !== "" &&
    customerEmail.value !== "" &&
    customerAddress.value !== "" &&
    tradeWay.value !== ""
  ) {
    postOrder();
  }
});

function postOrder() {
  axios
    .post(`${url}/orders`, {
      data: {
        user: {
          name: customerName.value,
          tel: customerPhone.value,
          email: customerEmail.value,
          address: customerAddress.value,
          payment: tradeWay.value,
          createTime: moment().format("YYYY/MM/DD, hh:mm:ss"),
        },
      },
    })
    .then(() => {
      // 送出後清空表單
      orderInfoForm.reset();
      // post orders 後，購物車會自動清空，直接 getCart 渲染就好
      getCart();
    })
    .catch((err) => {
      Swal.fire({
        icon: "error",
        title: "錯誤",
        text: `${err.message}`,
      });
    });
}

init();

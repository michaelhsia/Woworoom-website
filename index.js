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

// 宣告變數儲存商品資訊
let productData = [];

// 取得商品資料
function getProduct() {
  axios
    .get(`${url}/products`)
    .then(function (res) {
      productData = res.data.products;
      renderProductList(productData);
    })
    .catch(function (error) {
      console.log(error);
    });
}

getProduct();

// 渲染商品列表資訊
const productWrap = document.querySelector(".productWrap");

function renderProductList(data) {
  let str = ``;
  // data-id 加入購物車時使用
  data.forEach(function (item) {
    str += `<li class="productCard">
    <h4 class="productType">新品</h4>
    <img
      src="${item.images}"
      alt=""
    />
    <a href="#" class="addCardBtn" data-id=${item.id}>加入購物車</a>
    <h3>${item.title}</h3>
    <del class="originPrice">NT$${item.originPrice}</del>
    <p class="nowPrice">NT$${item.price}</p>
  </li>`;
  });

  productWrap.innerHTML = str;
}

// 商品列表篩選功能
const productSelect = document.querySelector(".productSelect");

productSelect.addEventListener("change", renderSelectProducts);

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
    data.forEach(function (item) {
      if (e.target.value === item.category) {
        filterData.push(item);
        renderProductList(filterData);
      }
    });
  }
}

// 裝購物車資料，每一個商品加入購物車後都有獨立的購物車id(cartId)
let cartData = [];

// 取得購物車資料
function getCart() {
  axios
    .get(`${url}/carts`)
    .then(function (res) {
      cartData = res.data.carts;
      let finalTotal = res.data.finalTotal;
      renderShoppingCart(cartData, finalTotal);
      if (cartData.length === 0) {
        Swal.fire({
          title: "購物車沒東西了！快買點東西！",
          icon: "warning",
          showConfirmButton: false,
          timer: 2000,
        });
      }

      console.log(cartData);
    })
    .catch(function (error) {
      console.log(error);
    });
}

getCart();

// 渲染購物車
const shoppingCartTable = document.querySelector(".shoppingCart-table");

function renderShoppingCart(data, finalTotal) {
  // 如果購物車沒東西就不渲染，直接 return
  if (cartData.length === 0) {
    shoppingCartTable.innerHTML = `<p>快去買點東西，不要當鐵公雞</p>`;
    return;
  }

  let str = `<tr>
    <th width="40%">品項</th>
    <th width="15%">單價</th>
    <th width="15%">數量</th>
    <th width="15%">金額</th>
    <th width="15%"></th>
    </tr>`;

  // data-productId 及 data-cartId 作為後續購物車商品數量加減及戳 API 使用
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
        <span class="material-icons" data-productId=${
          item.product.id
        } data-cartId=${item.id}>removed</span>
        </button>
       ${
         item.quantity
       }<button class="countIcon"><span class="material-icons" data-productId=${
      item.product.id
    } data-cartId=${item.id}>add</span>
        </button>
        </div>
    </td>
    <td>NT$${item.product.price * item.quantity}</td>
    <td class="discardBtn">
      <a href="#" class="material-icons" data-name="delete" data-cartId=${
        item.id
      }> clear </a>
    </td>
  </tr>`;
  });

  str += `<tr>
        <td>
        <a href="#" class="discardAllBtn">刪除所有品項</a>
        </td>
        <td></td>
        <td></td>
        <td>
        <p>總金額</p>
        </td>
        <td>NT$${finalTotal}</td>
    </tr>`;

  shoppingCartTable.innerHTML = str;
}

// 用物件計算該商品是否已被加過
let productObj = {};

// 加入購物車按鈕 -> 第一次加入用 post、第二次以上 patch quantity
productWrap.addEventListener("click", function (e) {
  e.preventDefault();

  // 偵測是否為「加入購物車」按鈕
  if (e.target.getAttribute("class") !== "addCardBtn") {
    return;
  }

  // 商品第一次加入
  let productId = e.target.getAttribute("data-id");

  // productObj 物件中還沒有該商品，就在物件中加入
  if (productObj[productId] === undefined) {
    productObj[productId] = 1;

    // post 加入購物車，要用 productId
    axios
      .post(`${url}/carts`, {
        data: {
          productId: productId,
          quantity: 1,
        },
      })
      .then(function () {
        getCart();
        Swal.fire({
          title: "成功加入新商品",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
        });

        console.log(`成功新增${e.target.getAttribute("data-id")}`);
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  // productObj 物件中已有該商品，每次值都加一
  else {
    // 購物車中該商品數量加一
    productObj[productId] += 1;

    cartData.forEach(function (item) {
      console.log(item.product.id, productId);
      // 如果購物車內已存在的商品 id 等於「加入購物車」按鈕的商品 id，就在該購物車 id(item.id)更新目前該商品的數量 productObj[productId]
      // patch 要使用購物車 id
      if (item.product.id === productId) {
        axios
          .patch(`${url}/carts`, {
            data: {
              id: item.id,
              quantity: productObj[productId],
            },
          })
          .then(function () {
            getCart();
          })
          .catch(function (error) {
            console.log(error);
          });
      }
    });
  }
});

// 購物車功能
shoppingCartTable.addEventListener("click", function (e) {
  e.preventDefault();

  // 取得點擊的購物車的 id
  let cartId = e.target.getAttribute("data-cartId");
  // 取得點擊的產品的 id，以當作 productObj 的 keys 來辨別購物車商品數量
  let productId = e.target.getAttribute("data-productId");

  console.log(productId, cartId);

  // 刪除所有購物車功能
  if (e.target.getAttribute("class") === "discardAllBtn") {
    axios
      .delete(`${url}/carts`)
      .then(function () {
        getCart();
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  // 刪除單一購物車功能
  else if (e.target.getAttribute("data-name") === "delete") {
    axios
      .delete(`${url}/carts/${cartId}`)
      .then(function () {
        getCart();
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  // 購物車產品減一
  else if (e.target.textContent === "removed") {
    // 按減號時，如果數字等於一，就跟刪除單一產品相同功能
    if (productObj[productId] === 1) {
      axios
        .delete(`${url}/carts/${cartId}`)
        .then(function () {
          getCart();
        })
        .catch(function (error) {
          console.log(error);
        });
    } else if (productObj[productId] > 1) {
      // 按減號時，如果數字大於一，就把該商品 id 數量減一後，重新 patch
      productObj[productId] -= 1;

      axios
        .patch(`${url}/carts`, {
          data: {
            id: cartId,
            quantity: productObj[productId],
          },
        })
        .then(function () {
          getCart();
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  }
  // 購物車產品加一
  else if (e.target.textContent === "add") {
    productObj[productId] += 1;

    axios
      .patch(`${url}/carts`, {
        data: {
          id: cartId,
          quantity: productObj[productId],
        },
      })
      .then(function () {
        getCart();
      })
      .catch(function (error) {
        console.log(error);
      });
  } else {
    return;
  }
});

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
    .then(function () {
      // 送出後清空表單
      orderInfoForm.reset();
      // post orders 後，購物車會自動清空，直接 getCart 渲染就好
      getCart();
    });
}

import axios from "axios";
import Swal from "sweetalert2";

const token = "oggzgZc1BxUhtj44EQmbV5QWDSI2";
const url = `https://livejs-api.hexschool.io/api/livejs/v1/admin/michaelhsia`;

const header = {
  headers: {
    Authorization: token,
  },
};

let orderData;

function getOrders() {
  axios
    .get(`${url}/orders`, header)
    .then(function (res) {
      console.log(res.data.orders);
      orderData = res.data.orders;
      renderOrderTable();
      renderC3();
    })
    .catch(function (error) {
      console.log(error);
    });
}
getOrders();

const orderTable = document.querySelector(".orderPage-table");

// 渲染表格
function renderOrderTable() {
  let str = `<thead>
  <tr>
    <th>訂單編號</th>
    <th>聯絡人</th>
    <th>聯絡地址</th>
    <th>電子郵件</th>
    <th>訂單品項</th>
    <th>訂單日期</th>
    <th>訂單狀態</th>
    <th>操作</th>
  </tr>
</thead>`;

  orderData.forEach(function (item) {
    str += `<tr>
    <td>${item.id}</td>
    <td>
      <p>${item.user.name}</p>
      <p>${item.user.tel}</p>
    </td>
    <td>${item.user.address}</td>
    <td>${item.user.email}</td>
    <td>`;

    // products 有多品項時是陣列，需拆出來跑 forEach 才能取得名稱跟數量
    item.products.forEach(function (item) {
      str += `<p>${item.title}X${item.quantity}</p>`;
    });

    str += `</td>
    <td>${item.user.createTime}</td>
    <td class="orderStatus">`;

    if (item.paid) {
      str += `<a href="#" class="orderPaid">已處理</a>`;
    } else {
      str += `<a href="#" class="orderUnpaid" data-orderId="${item.id}">未處理</a>`;
    }

    str += `
    </td>
    <td>
      <input type="button" class="delSingleOrder-Btn" value="刪除" data-orderId=${item.id} />
    </td>
  </tr>`;
  });

  orderTable.innerHTML = str;
}

// 修改訂單狀態
orderTable.addEventListener("click", function (e) {
  e.preventDefault();
  console.log(e.target);
  if (e.target.getAttribute("class") !== "orderUnpaid") {
    return;
  }

  let orderId = e.target.getAttribute("data-orderId");
  Swal.fire({
    title: "是否要修改訂單狀態？",
    text: "此動作無法復原",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "是",
    cancelButtonText: "否",
  }).then((result) => {
    if (result.isConfirmed) {
      updateOrderStatus(orderId);
    }
  });
});

// 訂單修改 put
function updateOrderStatus(orderId) {
  axios
    .put(
      `${url}/orders`,
      {
        data: {
          id: orderId,
          paid: true,
        },
      },
      header
    )
    .then(function () {
      getOrders();
      Swal.fire({
        title: "已成功修改訂單狀態",
        icon: "success",
      });
    })
    .catch(function (err) {
      console.log(err.response.data);
    });
}

// 刪除單筆訂單按鈕監聽
orderTable.addEventListener("click", function (e) {
  e.preventDefault();
  if (e.target.getAttribute("class") !== "delSingleOrder-Btn") {
    return;
  }

  let orderId = e.target.getAttribute("data-orderId");
  deleteSingleOrder(orderId);
});

// 刪除單筆訂單功能
function deleteSingleOrder(orderId) {
  axios
    .delete(`${url}/orders/${orderId}`, header)
    .then(function () {
      getOrders();
      Swal.fire({
        title: `已成功刪除訂單編號${orderId}`,
        icon: "success",
      });
    })
    .catch(function (err) {
      console.log(err.response.data);
    });
}

// 清除全部訂單按鈕監聽
const discardAllBtn = document.querySelector(".discardAllBtn");

discardAllBtn.addEventListener("click", deleteAllOrders);

// 刪除所有訂單功能
function deleteAllOrders() {
  axios
    .delete(`${url}/orders`, header)
    .then(function () {
      getOrders();
      Swal.fire({
        title: `已成功刪除所有訂單`,
        icon: "success",
      });
    })
    .catch(function (err) {
      console.log(err.response.data);
    });
}

// 圖表渲染
function renderC3() {
  // 計算每個產品數量
  let totalProduct = {};
  orderData.forEach(function (item) {
    item.products.forEach(function (product) {
      if (totalProduct[product.title] === undefined) {
        totalProduct[product.title] = product.quantity;
      } else {
        totalProduct[product.title] += product.quantity;
      }
    });
  });

  // 組成陣列包陣列以放進 c3 data 中
  let productArr = [];
  let products = Object.keys(totalProduct);
  products.forEach(function (item) {
    let arr = [];
    arr.push(item);
    arr.push(totalProduct[item]);
    productArr.push(arr);
  });

  var chart = c3.generate({
    bindto: "#chart",
    data: {
      columns: productArr,
      type: "pie",
    },
  });
}

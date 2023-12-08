import{S as d,a}from"./sweetalert2.all-148846b0.js";const h="oggzgZc1BxUhtj44EQmbV5QWDSI2",c="https://livejs-api.hexschool.io/api/livejs/v1/admin/michaelhsia",i={headers:{Authorization:h}};let l;function s(){a.get(`${c}/orders`,i).then(function(t){console.log(t.data.orders),l=t.data.orders,f(),B()}).catch(function(t){console.log(t)})}s();const u=document.querySelector(".orderPage-table");function f(){let t=`<thead>
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
</thead>`;l.forEach(function(e){t+=`<tr>
    <td>${e.id}</td>
    <td>
      <p>${e.user.name}</p>
      <p>${e.user.tel}</p>
    </td>
    <td>${e.user.address}</td>
    <td>${e.user.email}</td>
    <td>`,e.products.forEach(function(n){t+=`<p>${n.title}X${n.quantity}</p>`}),t+=`</td>
    <td>${e.user.createTime}</td>
    <td class="orderStatus">`,e.paid?t+='<a href="#" class="orderPaid">已處理</a>':t+=`<a href="#" class="orderUnpaid" data-orderId="${e.id}">未處理</a>`,t+=`
    </td>
    <td>
      <input type="button" class="delSingleOrder-Btn" value="刪除" data-orderId=${e.id} />
    </td>
  </tr>`}),u.innerHTML=t}u.addEventListener("click",function(t){if(t.preventDefault(),console.log(t.target),t.target.getAttribute("class")!=="orderUnpaid")return;let e=t.target.getAttribute("data-orderId");d.fire({title:"是否要修改訂單狀態？",text:"此動作無法復原",icon:"warning",showCancelButton:!0,confirmButtonColor:"#3085d6",cancelButtonColor:"#d33",confirmButtonText:"是",cancelButtonText:"否"}).then(n=>{n.isConfirmed&&p(e)})});function p(t){a.put(`${c}/orders`,{data:{id:t,paid:!0}},i).then(function(){s(),d.fire({title:"已成功修改訂單狀態",icon:"success"})}).catch(function(e){console.log(e.response.data)})}u.addEventListener("click",function(t){if(t.preventDefault(),t.target.getAttribute("class")!=="delSingleOrder-Btn")return;let e=t.target.getAttribute("data-orderId");g(e)});function g(t){a.delete(`${c}/orders/${t}`,i).then(function(){s(),d.fire({title:`已成功刪除訂單編號${t}`,icon:"success"})}).catch(function(e){console.log(e.response.data)})}const $=document.querySelector(".discardAllBtn");$.addEventListener("click",b);function b(){a.delete(`${c}/orders`,i).then(function(){s(),d.fire({title:"已成功刪除所有訂單",icon:"success"})}).catch(function(t){console.log(t.response.data)})}function B(){let t={};l.forEach(function(o){o.products.forEach(function(r){t[r.title]===void 0?t[r.title]=r.quantity:t[r.title]+=r.quantity})});let e=[];Object.keys(t).forEach(function(o){let r=[];r.push(o),r.push(t[o]),e.push(r)}),c3.generate({bindto:"#chart",data:{columns:e,type:"pie"}})}




/**************** CONFIG ****************/
const API_URL = "https://rfreshgrocery-3uv8.onrender.com";
const ADMIN_PASSWORD = "81787822";

/**************** ELEMENTS ****************/
const productsContainer = document.getElementById("products");
const cart = document.getElementById("cart");
const cartItems = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const totalEl = document.getElementById("total");
const searchInput = document.getElementById("search");
const addForm = document.getElementById("addForm");

/**************** STATE ****************/
let products = [];
let cartArray = [];

/**************** FETCH PRODUCTS ****************/
function fetchProducts() {
  fetch(`${API_URL}/products`)
    .then(res => res.json())
    .then(data => {
      products = data;
      renderProducts(products);
    })
    .catch(err => {
      console.error("❌ Product fetch failed:", err);
      alert("Failed to load products");
    });
}

/**************** RENDER PRODUCTS ****************/
function renderProducts(list) {
  productsContainer.innerHTML = list.map(p => `
    <div class="card">
      <img src="${API_URL}${p.img}" alt="${p.name}" />
      <h3>${p.name}</h3>
      <p>
        <span style="text-decoration:line-through;color:#888">₹${p.mrp}</span>
        <strong style="color:green"> ₹${p.price}</strong>
      </p>
      <button onclick="addToCart(${p.id}, '${p.name}', ${p.price}, ${p.mrp})">
        Add to Cart
      </button>
    </div>
  `).join("");
}

/**************** CART ****************/
function toggleCart() {
  cart.classList.toggle("open");
  renderCart();
}

function addToCart(id, name, price, mrp) {
  const item = cartArray.find(i => i.id === id);
  if (item) {
    item.qty++;
  } else {
    cartArray.push({ id, name, price, mrp, qty: 1 });
  }
  renderCart();
}

function removeFromCart(id) {
  cartArray = cartArray.filter(i => i.id !== id);
  renderCart();
}

function changeQty(id, amount) {
  const item = cartArray.find(i => i.id === id);
  if (!item) return;
  item.qty += amount;
  if (item.qty <= 0) removeFromCart(id);
  renderCart();
}

function renderCart() {
  cartItems.innerHTML = cartArray.map(i => `
    <div class="cart-item">
      <span>${i.name} x ${i.qty}</span>
      <div>
        <span style="text-decoration:line-through;color:#888">₹${i.mrp * i.qty}</span>
        <strong> ₹${i.price * i.qty}</strong>
      </div>
      <div>
        <button onclick="changeQty(${i.id}, -1)">-</button>
        <button onclick="changeQty(${i.id}, 1)">+</button>
        <button onclick="removeFromCart(${i.id})">X</button>
      </div>
    </div>
  `).join("");

  cartCount.textContent = cartArray.reduce((a, b) => a + b.qty, 0);
  totalEl.textContent = cartArray.reduce((a, b) => a + b.price * b.qty, 0);
}

/**************** SEARCH ****************/
searchInput.addEventListener("input", e => {
  const term = e.target.value.toLowerCase();
  renderProducts(products.filter(p => p.name.toLowerCase().includes(term)));
});

/**************** ADMIN LOGIN ****************/
if (confirm("Are you admin?")) {
  const key = prompt("Enter admin password:");
  if (key === ADMIN_PASSWORD) {
    document.getElementById("admin-panel").style.display = "block";
  } else {
    alert("Wrong admin password");
  }
}

/**************** ADMIN ADD PRODUCT ****************/
if (addForm) {
  addForm.addEventListener("submit", e => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", addForm.name.value);
    formData.append("mrp", addForm.mrp.value);
    formData.append("price", addForm.price.value);
    formData.append("img", addForm.img.files[0]);
    formData.append("key", ADMIN_PASSWORD);

    fetch(`${API_URL}/add-product`, {
      method: "POST",
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        alert(data.message);
        addForm.reset();
        fetchProducts();
      })
      .catch(err => {
        console.error(err);
        alert("Failed to add product");
      });
  });
}

/**************** PURCHASE ****************/
function purchase() {
  if (cartArray.length === 0) return alert("Cart is empty");

  const name = document.getElementById("cust-name").value.trim();
  const address = document.getElementById("cust-address").value.trim();
  const phone = document.getElementById("cust-phone").value.trim();

  if (!name || !address || !phone) {
    return alert("Fill all customer details");
  }

  let orderText = "";
  cartArray.forEach(i => {
    orderText += `${i.name} x ${i.qty} = ₹${i.price * i.qty}\n`;
  });

  emailjs.send("service_tgvp6kk", "template_o4nmme4", {
    customer_name: name,
    customer_address: address,
    customer_phone: phone,
    order_details: orderText,
    total_amount: totalEl.textContent
  })
  .then(() => {
    alert("✅ Order placed successfully!");
    cartArray = [];
    renderCart();
    document.getElementById("cust-name").value = "";
    document.getElementById("cust-address").value = "";
    document.getElementById("cust-phone").value = "";
  })
  .catch(err => {
    console.error("EmailJS error:", err);
    alert("❌ Order failed");
  });
}

/**************** START ****************/
fetchProducts();






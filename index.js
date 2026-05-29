/* ══════════════════════════════════════
   SCHOOL STORE – script.js
   SMKS Merdeka Bandung
   ══════════════════════════════════════ */

// ═══════════════════════════════════════
// DATA PRODUK
// ═══════════════════════════════════════

const PRODUCTS = [
  { id:1,  name:'Pulpen',            category:'ATK',              emoji:'🖊️', price:2000, variants:['Hitam','Merah','Biru'],   stock:80  },
  { id:2,  name:'Pensil 2B',         category:'ATK',              emoji:'✏️', price:1500, variants:['HB','2B','4B'],           stock:60  },
  { id:3,  name:'Penghapus',         category:'ATK',              emoji:'🧹', price:1000, variants:['Kecil','Besar'],          stock:45  },
  { id:4,  name:'Penggaris',         category:'ATK',              emoji:'📏', price:2500, variants:['30cm','60cm'],            stock:30  },
  { id:5,  name:'Print Hitam Putih', category:'Print & Photocopy',emoji:'🖨️', price:500,  variants:['A4','A5','F4'],           stock:999 },
  { id:6,  name:'Print Warna',       category:'Print & Photocopy',emoji:'🎨', price:1500, variants:['A4','A5'],               stock:999 },
  { id:7,  name:'Fotocopy',          category:'Print & Photocopy',emoji:'📠', price:300,  variants:['A4','F4'],               stock:999 },
  { id:8,  name:'Paper HVS A4',      category:'Paper',            emoji:'📄', price:500,  variants:['A5','A4','B5'],          stock:200 },
  { id:9,  name:'Paper HVS A3',      category:'Paper',            emoji:'🗒️', price:1000, variants:['A3'],                   stock:120 },
  { id:10, name:'Buku Tulis',        category:'ATK',              emoji:'📓', price:4000, variants:['40lbr','58lbr','100lbr'],stock:50  },
];

// ═══════════════════════════════════════
// STATE APLIKASI
// ═══════════════════════════════════════

let cart            = [];
let currentProduct  = null;
let currentQty      = 0;
let selectedVariant = null;
let selectedPayment = null;
let history         = [];
let currentUser     = { name:'Arina', email:'arina@smks.sch.id', role:'user' };

// ═══════════════════════════════════════
// NAVIGASI
// ═══════════════════════════════════════

function goto(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');

  if (page === 'home')  renderProducts(PRODUCTS);
  if (page === 'cart')  renderCart();
  if (page === 'admin') showAdmin('dashboard');
}

// ═══════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════

function doLogin() {
  const user = document.getElementById('login-user').value.trim();
  const pass = document.getElementById('login-pass').value.trim();

  if (!user || !pass) {
    alert('Isi username dan password!');
    return;
  }

  // Akun admin
  if (user.toLowerCase() === 'admin' && pass === 'admin') {
    goto('admin');
    return;
  }

  // Akun siswa
  document.getElementById('sidebar-name').textContent  = user;
  document.getElementById('sidebar-email').textContent = user + '@smks.sch.id';
  currentUser.name = user;
  goto('home');
}

// ═══════════════════════════════════════
// PRODUK – RENDER & FILTER
// ═══════════════════════════════════════

function renderProducts(prods) {
  const grid = document.getElementById('product-grid');

  if (!prods || prods.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="es-icon">🔍</div>
        <p>Produk tidak ditemukan</p>
      </div>`;
    return;
  }

  grid.innerHTML = '';
  prods.forEach(p => {
    grid.innerHTML += `
      <div class="category-card" onclick="openProduct(${p.id})">
        <div class="category-img">${p.emoji}</div>
        <div class="category-info">
          <h3>${p.name}</h3>
          <p>${p.category} · Rp ${p.price.toLocaleString('id')}</p>
        </div>
      </div>`;
  });
}

function filterProducts(q) {
  const filtered = PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(q.toLowerCase()) ||
    p.category.toLowerCase().includes(q.toLowerCase())
  );
  renderProducts(filtered);
}

function showSection(s) {
  document.getElementById('section-products').style.display = s === 'products' ? '' : 'none';
  document.getElementById('section-history').style.display  = s === 'history'  ? '' : 'none';

  ['products', 'history'].forEach(n => {
    const el = document.getElementById('nav-' + n);
    if (el) el.classList.toggle('active', n === s);
  });

  if (s === 'history') renderHistory();
}

// ═══════════════════════════════════════
// DETAIL PRODUK
// ═══════════════════════════════════════

function openProduct(id) {
  currentProduct  = PRODUCTS.find(p => p.id === id);
  currentQty      = 0;
  selectedVariant = currentProduct.variants[0];

  document.getElementById('detail-category').textContent = currentProduct.category;
  document.getElementById('detail-emoji').textContent    = currentProduct.emoji;
  document.getElementById('detail-name').textContent     = currentProduct.name;
  document.getElementById('detail-price').textContent    = `Harga: Rp ${currentProduct.price.toLocaleString('id')}`;
  document.getElementById('qty-display').textContent     = currentQty;

  // Render tombol varian
  const vEl = document.getElementById('detail-variants');
  vEl.innerHTML = currentProduct.variants.map((v, i) =>
    `<button class="variant-btn ${i === 0 ? 'selected' : ''}" onclick="selectVariant(this,'${v}')">${v}</button>`
  ).join('');

  goto('product');
}

function selectVariant(btn, v) {
  selectedVariant = v;
  document.querySelectorAll('.variant-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

function changeQty(d) {
  currentQty = Math.max(0, currentQty + d);
  document.getElementById('qty-display').textContent = currentQty;
}

function addToCart() {
  if (!currentQty) {
    alert('Pilih jumlah dulu!');
    return;
  }

  const existing = cart.find(c => c.id === currentProduct.id && c.variant === selectedVariant);
  if (existing) {
    existing.qty += currentQty;
  } else {
    cart.push({
      id:      currentProduct.id,
      name:    currentProduct.name,
      emoji:   currentProduct.emoji,
      price:   currentProduct.price,
      variant: selectedVariant,
      qty:     currentQty
    });
  }

  updateCartBadge();
  goto('home');
}

function updateCartBadge() {
  const total = cart.reduce((s, c) => s + c.qty, 0);
  document.getElementById('cart-count').textContent = total;
}

// ═══════════════════════════════════════
// KERANJANG
// ═══════════════════════════════════════

function openCart() { goto('cart'); }

function renderCart() {
  const el = document.getElementById('cart-items-list');

  if (!cart.length) {
    el.innerHTML = `
      <div class="empty-state">
        <div class="es-icon">🛒</div>
        <p>Keranjang masih kosong</p>
      </div>`;
    document.getElementById('cart-total').textContent = 'Rp 0';
    return;
  }

  el.innerHTML = cart.map((c, i) => `
    <div class="cart-item">
      <div class="cart-item-img">${c.emoji}</div>
      <div class="cart-item-info">
        <div class="item-name">${c.name}</div>
        <div class="item-variant">${c.variant}</div>
      </div>
      <span class="cart-item-qty">${c.qty}×</span>
      <span style="font-weight:700">Rp ${(c.price * c.qty).toLocaleString('id')}</span>
      <button class="remove-btn" onclick="removeCart(${i})">✕</button>
    </div>`).join('');

  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  document.getElementById('cart-total').textContent = `Rp ${total.toLocaleString('id')}`;
}

function removeCart(i) {
  cart.splice(i, 1);
  updateCartBadge();
  renderCart();
}

// ═══════════════════════════════════════
// PEMBAYARAN
// ═══════════════════════════════════════

function selectPayment(m) {
  selectedPayment = m;
  document.getElementById('opt-ewallet').classList.toggle('selected', m === 'ewallet');
  document.getElementById('opt-cash').classList.toggle('selected',   m === 'cash');
}

function confirmPayment() {
  if (!selectedPayment) {
    alert('Pilih metode pembayaran!');
    return;
  }

  const name  = document.getElementById('buyer-name').value  || currentUser.name;
  const cls   = document.getElementById('buyer-class').value || '-';
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const items = cart.map(c => `${c.name} (${c.variant}) ×${c.qty}`).join(', ');
  const now   = new Date().toLocaleDateString('id-ID', { day:'2-digit', month:'long', year:'numeric' });
  const method = selectedPayment === 'cash' ? 'Cash' : 'E-Wallet/QRIS';

  // Simpan ke riwayat
  history.unshift({ date:now, items, total, method, buyer:name, cls });

  // Tampilkan struk
  document.getElementById('receipt-detail').innerHTML = `
    <p><b>Pembeli:</b> ${name} – ${cls}</p>
    <p><b>Produk:</b> ${items}</p>
    <p><b>Total:</b> Rp ${total.toLocaleString('id')}</p>
    <p><b>Metode:</b> ${selectedPayment === 'cash' ? '💵 Cash' : '📱 E-Wallet/QRIS'}</p>
    <p><b>Tanggal:</b> ${now}</p>`;

  // Reset
  cart            = [];
  selectedPayment = null;
  updateCartBadge();
  goto('success');
}

// ═══════════════════════════════════════
// RIWAYAT TRANSAKSI
// ═══════════════════════════════════════

function renderHistory() {
  const el = document.getElementById('history-list');

  if (!history.length) {
    el.innerHTML = `
      <div class="empty-state">
        <div class="es-icon">📋</div>
        <p>Belum ada transaksi</p>
      </div>`;
    return;
  }

  el.innerHTML = history.map(h => `
    <div class="history-item">
      <div class="history-info">
        <div class="h-date">📅 ${h.date} · ${h.method}</div>
        <div class="h-items">${h.items}</div>
        <div style="font-size:0.8rem;color:var(--text-muted)">👤 ${h.buyer} – ${h.cls}</div>
      </div>
      <div class="history-total">Rp ${h.total.toLocaleString('id')}</div>
    </div>`).join('');
}

// ═══════════════════════════════════════
// ADMIN – VIEWS
// ═══════════════════════════════════════

const ADMIN_VIEWS = {

  dashboard() {
    const totalPenjualan = history.reduce((s, h) => s + h.total, 0);
    const transaksiRows  = history.map(h => `
      <tr>
        <td>${h.date}</td>
        <td>${h.buyer}</td>
        <td>${h.cls}</td>
        <td>${h.items}</td>
        <td>Rp ${h.total.toLocaleString('id')}</td>
        <td><span class="badge ${h.method === 'Cash' ? 'badge-green' : 'badge-yellow'}">${h.method}</span></td>
      </tr>`).join('');

    return `
      <p class="section-title">📊 Dashboard</p>
      <div class="admin-cards">
        <div class="stat-card">
          <div class="stat-icon">📦</div>
          <div class="stat-value">${PRODUCTS.length}</div>
          <div class="stat-label">Total Produk</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-value">42</div>
          <div class="stat-label">Total User</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💳</div>
          <div class="stat-value">${history.length}</div>
          <div class="stat-label">Transaksi</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-value">Rp ${totalPenjualan.toLocaleString('id')}</div>
          <div class="stat-label">Total Penjualan</div>
        </div>
      </div>
      <p class="section-title">Transaksi Terbaru</p>
      ${history.length
        ? `<table class="data-table">
             <thead><tr><th>Tanggal</th><th>Pembeli</th><th>Kelas</th><th>Produk</th><th>Total</th><th>Metode</th></tr></thead>
             <tbody>${transaksiRows}</tbody>
           </table>`
        : '<div class="empty-state"><div class="es-icon">📊</div><p>Belum ada transaksi</p></div>'
      }`;
  },

  produk() {
    const rows = PRODUCTS.map(p => `
      <tr>
        <td>${p.id}</td>
        <td>${p.emoji} ${p.name}</td>
        <td>${p.category}</td>
        <td>Rp ${p.price.toLocaleString('id')}</td>
        <td>${p.stock}</td>
        <td><span class="badge ${p.stock > 20 ? 'badge-green' : 'badge-pink'}">${p.stock > 20 ? 'Tersedia' : 'Hampir Habis'}</span></td>
      </tr>`).join('');

    return `
      <p class="section-title">📦 Kelola Produk</p>
      <table class="data-table">
        <thead><tr><th>ID</th><th>Produk</th><th>Kategori</th><th>Harga</th><th>Stok</th><th>Status</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  },

  stok() {
    const rows = PRODUCTS.map(p => `
      <tr>
        <td>${p.emoji} ${p.name}</td>
        <td>${p.stock}</td>
        <td><span class="badge ${p.stock > 20 ? 'badge-green' : 'badge-pink'}">${p.stock}</span></td>
        <td>${Math.floor(Math.random() * 30) + 10}</td>
        <td>${Math.floor(Math.random() * 15)}</td>
      </tr>`).join('');

    return `
      <p class="section-title">📋 Kelola Stok (Inventory)</p>
      <table class="data-table">
        <thead><tr><th>Nama Barang</th><th>Stok Barang</th><th>Barang Tersedia</th><th>Barang Masuk</th><th>Barang Keluar</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  },

  users() {
    const dummyUsers = [
      { name:'Arina Hanifah', email:'arina@smks.sch.id', role:'User',  status:'Aktif' },
      { name:'Budi Santoso',  email:'budi@smks.sch.id',  role:'User',  status:'Aktif' },
      { name:'Citra Dewi',    email:'citra@smks.sch.id', role:'User',  status:'Aktif' },
      { name:'Admin Toko',    email:'admin@smks.sch.id', role:'Admin', status:'Aktif' },
    ];
    const rows = dummyUsers.map(u => `
      <tr>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td><span class="badge badge-yellow">${u.role}</span></td>
        <td><span class="badge badge-green">${u.status}</span></td>
      </tr>`).join('');

    return `
      <p class="section-title">👥 Kelola Data Pengguna</p>
      <table class="data-table">
        <thead><tr><th>Nama</th><th>Email</th><th>Role</th><th>Status</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  },

  transaksi() {
    const rows = history.map(h => `
      <tr>
        <td>${h.date}</td>
        <td>${h.buyer}</td>
        <td>${h.cls}</td>
        <td>Rp ${h.total.toLocaleString('id')}</td>
        <td><span class="badge badge-yellow">${h.method}</span></td>
        <td><span class="badge badge-green">✅ Lunas</span></td>
      </tr>`).join('');

    return `
      <p class="section-title">💳 Kelola Pembayaran</p>
      ${history.length
        ? `<table class="data-table">
             <thead><tr><th>Tanggal</th><th>Pembeli</th><th>Kelas</th><th>Total</th><th>Metode</th><th>Status</th></tr></thead>
             <tbody>${rows}</tbody>
           </table>`
        : '<div class="empty-state"><div class="es-icon">💳</div><p>Belum ada data pembayaran</p></div>'
      }`;
  }
};

function showAdmin(section) {
  document.querySelectorAll('.admin-sidebar .sidebar-nav a').forEach(a => a.classList.remove('active'));
  const el = document.getElementById('adm-' + section);
  if (el) el.classList.add('active');
  document.getElementById('admin-content-area').innerHTML = ADMIN_VIEWS[section]();
}

// ═══════════════════════════════════════
// INISIALISASI
// ═══════════════════════════════════════
renderProducts(PRODUCTS);

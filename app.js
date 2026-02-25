const STORAGE_KEY = "expItems_v1";
let items = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
let editIndex = null;

const nameInput = document.getElementById("name");
const catInput = document.getElementById("category");
const purchaseInput = document.getElementById("purchase");
const expireInput = document.getElementById("expire");
const addBtn = document.getElementById("addBtn");
const updateBtn = document.getElementById("updateBtn");

const searchInput = document.getElementById("search");
const filterCat = document.getElementById("filterCat");
const listEl = document.getElementById("list");

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/* 残り日数計算 */
function daysLeft(exp) {
  if (!exp) return null;

  const d = new Date(exp);
  if (Number.isNaN(d.getTime())) return null;

  const today = new Date();
  d.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return Math.ceil((d - today) / (1000 * 60 * 60 * 24));
}

function render() {
  listEl.innerHTML = "";

  const kw = searchInput.value.toLowerCase();
  const fc = filterCat.value;

  let shown = items
    .map((it, idx) => ({ ...it, _idx: idx }))
    .filter((it) => it.name.toLowerCase().includes(kw))
    .filter((it) => (fc === "all" ? true : it.category === fc));

  /* ⭐ 常に「期限が近い順」でソートする */
  shown.sort((a, b) => {
    const da = daysLeft(a.expire);
    const db = daysLeft(b.expire);

    if (da === null && db === null) return 0;
    if (da === null) return 1;
    if (db === null) return -1;

    return da - db;
  });

  shown.forEach((item) => {
    const idx = item._idx;
    const d = daysLeft(item.expire);

    const card = document.createElement("div");
    card.className = "item";

    let badgeHtml = "";
    if (d !== null) {
      if (d <= 0){
        badgeHtml = `<div class="badge-expired">期限切れ</div>`;
      }
      else if (d <= 7){
        badgeHtml = `<div class="badge-warning">あと ${d} 日</div>`;
     }
    }

    const remainText =
      d === null
        ? "賞味期限: 未設定"
        : `賞味期限: ${item.expire} （残り ${d} 日）`;

    card.innerHTML = `
      ${badgeHtml}
      <div class="item-header">
        <div>
          <div class="item-name">${item.name}</div>
          <div class="item-date">${remainText}</div>
          <div class="item-date">購入日: ${item.purchase || "-"}</div>
        </div>
        <div class="item-cat">${item.category}</div>
      </div>

      <div class="actions">
        <button class="edit">編集</button>
        <button class="delete">削除</button>
      </div>
    `;

    card.querySelector(".edit").addEventListener("click", () => {
      editIndex = idx;
      nameInput.value = item.name;
      catInput.value = item.category;
      purchaseInput.value = item.purchase;
      expireInput.value = item.expire;

      addBtn.style.display = "none";
      updateBtn.style.display = "block";

      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    card.querySelector(".delete").addEventListener("click", () => {
      if (!confirm("削除しますか？")) return;
      items.splice(idx, 1);
      save();
      render();
    });

    listEl.appendChild(card);
  });

  if (shown.length === 0) {
    const empty = document.createElement("div");
    empty.className = "item";
    empty.innerHTML = `<div style="text-align:center;color:#777">データがありません</div>`;
    listEl.appendChild(empty);
  }
}

/* 追加 */
addBtn.addEventListener("click", () => {
  const name = nameInput.value.trim();
  const cat = catInput.value;
  const purchase = purchaseInput.value;
  const exp = expireInput.value;

  if (!name) return alert("商品名は必須です");
  if (!exp) return alert("賞味期限を入力してください");

  const parsed = new Date(exp);
  if (Number.isNaN(parsed.getTime())) return alert("日付が不正です");

  items.push({ name, category: cat, purchase, expire: exp });
  save();
  render();

  nameInput.value = "";
  purchaseInput.value = "";
  expireInput.value = "";
});

/* 更新 */
updateBtn.addEventListener("click", () => {
  if (editIndex === null) return;

  const name = nameInput.value.trim();
  const cat = catInput.value;
  const purchase = purchaseInput.value;
  const exp = expireInput.value;

  if (!name) return alert("商品名は必須です");
  if (!exp) return alert("賞味期限を入力してください");

  items[editIndex] = { name, category: cat, purchase, expire: exp };
  save();
  render();

  editIndex = null;
  nameInput.value = "";
  purchaseInput.value = "";
  expireInput.value = "";

  updateBtn.style.display = "none";
  addBtn.style.display = "block";
});

searchInput.addEventListener("input", render);
filterCat.addEventListener("change", render);

render();

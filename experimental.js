import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { 
  getFirestore, collection, query, where, getDocs, doc, setDoc 
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM取得
const searchInput = document.getElementById("searchUser");
const searchResult = document.getElementById("searchResult");
const searchBtn = document.getElementById("searchBtn");

// ログインチェック
onAuthStateChanged(auth, user => {
  if (!user) {
    alert("ログインが必要です");
    location.href = "index.html";
    return;
  }

  document.getElementById("loginStatus").textContent = `${user.email} でログイン中`;

  enableSearch(user);
});

function enableSearch(user) {

  // 入力したら検索
  searchInput.addEventListener("input", () => {
    search(user);
  });

  // ボタンを押したら検索
  searchBtn.addEventListener("click", () => {
    searchBtn.classList.add("animate");
    setTimeout(() => searchBtn.classList.remove("animate"), 150);
    search(user);
  });
}

// 検索処理を関数化
async function search(user) {
  const text = searchInput.value.trim();
  if (!text) {
    searchResult.innerHTML = "";
    return;
  }

  const loading = document.getElementById("loading");
  loading.style.display = "block";  // ← 検索中表示

  const q = query(
    collection(db, "users"),
    where("username", ">=", text),
    where("username", "<=", text + "\uf8ff")
  );

  const snap = await getDocs(q);

  loading.style.display = "none";   // ← 検索完了
  searchResult.innerHTML = "";      // ← 結果を描画する前にリセット

  snap.forEach(docSnap => {
    const u = docSnap.data();
    if (docSnap.id === user.uid) return;

    searchResult.innerHTML += `
      <div class="userCandidate">
        ${u.username}
        <button onclick="addFriend('${docSnap.id}')">フレンド申請</button>
      </div>
    `;
  });
}

// フレンド追加（即追加）
window.addFriend = async function(friendUid) {
  const myUid = auth.currentUser.uid;

  await setDoc(
    doc(db, "users", myUid, "friends", friendUid),
    { added: true }
  );

  alert("フレンドに追加しました！");
};

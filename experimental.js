import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { 
  getFirestore, collection, query, where, getDocs, doc, setDoc 
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM取得は先にしてOK
const searchInput = document.getElementById("searchUser");
const searchResult = document.getElementById("searchResult");

// ログインチェック
onAuthStateChanged(auth, user => {
  if (!user) {
    alert("ログインが必要です");
    location.href = "index.html";
    return;
  }

  // ログインしている時だけ検索を有効化
  enableSearch(user);
});

function enableSearch(user) {
  searchInput.addEventListener("input", async () => {
    const text = searchInput.value.trim();
    if (!text) {
      searchResult.innerHTML = "";
      return;
    }

    const q = query(
      collection(db, "users"),
      where("username", ">=", text),
      where("username", "<=", text + "\uf8ff")
    );

    const snap = await getDocs(q);

    searchResult.innerHTML = "";
    snap.forEach(docSnap => {
      const u = docSnap.data();

      // 自分自身は候補に出さない
      if (docSnap.id === user.uid) return;

      searchResult.innerHTML += `
        <div class="userCandidate">
          ${u.username}
          <button onclick="addFriend('${docSnap.id}')">フレンド申請</button>
        </div>
      `;
    });
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

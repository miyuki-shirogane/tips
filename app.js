// 配置项
const CONFIG = {
  CONNECT_TIMEOUT: 20000, // 20秒超时
  TIP_ADDRESS: "ckt1qrfrwcdnvssswdwpn3s9v8fp87emat306ctjwsm3nmlkjg8qyza2cqgqqx4q8n46evp22qlt934kn93auhp8kgrmkggxvm0n",
  TIP_AMOUNT: 2000 * 10 ** 8, // 2000 CKB
  STREAMLIT_URL: "http://192.168.12.100:8501"
};

// 全局状态
let walletConnected = false;
let connectTimer = null;

// DOM 元素
const statusEl = document.getElementById("status");
const connectBtn = document.getElementById("connectBtn");
const tipBtn = document.getElementById("tipBtn");
const enterAppBtn = document.getElementById("enterAppBtn");

// 更新状态提示
function updateStatus(text, type = "normal") {
  statusEl.textContent = text;
  statusEl.className = `status ${type}`;
}

// 初始化：检测钱包环境
function init() {
  // 检测钱包环境
  if (!window.superise) {
    updateStatus("非 SupeRISE 钱包环境，请在钱包内打开", "error");
    connectBtn.disabled = true;
    return;
  }

  updateStatus("已检测到 SupeRISE 钱包，请点击按钮连接", "warning");
  connectBtn.disabled = false;
  // 绑定连接按钮事件
  connectBtn.addEventListener("click", connectWalletWithTimeout);
  // 绑定打赏按钮事件
  tipBtn.addEventListener("click", handleTip);
}

// 连接钱包
async function connectWalletWithTimeout() {
  connectBtn.disabled = true;
  updateStatus("正在请求连接钱包，请在钱包内确认...", "warning");

  // 设置超时定时器
  connectTimer = setTimeout(() => {
    updateStatus("连接超时，请重新尝试", "error");
    connectBtn.disabled = false;
    walletConnected = false;
  }, CONFIG.CONNECT_TIMEOUT);

  try {
    // 显式连接钱包
    const walletInfo = await window.superise.connectCkb();
    clearTimeout(connectTimer);

    // 连接成功
    walletConnected = true;
    updateStatus("钱包连接成功！可点击打赏", "success");
    connectBtn.style.display = "none";
    tipBtn.style.display = "block";
  } catch (error) {
    clearTimeout(connectTimer);
    updateStatus(`连接失败：${error.message}`, "error");
    connectBtn.disabled = false;
    walletConnected = false;
  }
}

// 打赏逻辑
async function handleTip() {
  if (!walletConnected) {
    updateStatus("请先连接钱包", "error");
    return;
  }

  try {
    updateStatus("正在发起转账，请在钱包内确认...", "warning");
    tipBtn.disabled = true;

    // 调用转账API
    const res = await window.superise.transferCKB(
      CONFIG.TIP_ADDRESS,
      CONFIG.TIP_AMOUNT,
      Date.now() + 120000 // 2分钟过期
    );

    // 支付成功
    updateStatus("打赏成功！感谢支持～", "success");
    alert(`感谢支持！\n交易哈希：${res.txHash}`);
    // 自动跳转Streamlit
    window.location.href = CONFIG.STREAMLIT_URL;
  } catch (error) {
    updateStatus(`打赏失败：${error.message}`, "error");
    alert(`已取消或失败：${error.message}`);
    tipBtn.disabled = false;
  }
}

// 页面加载+Bridge就绪初始化
window.addEventListener("DOMContentLoaded", init);
window.addEventListener("superiseReady", init);

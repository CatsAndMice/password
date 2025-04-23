const { initCDP, cleanupCDP } = require("./cdp");
const { getCurrentClientPort } = require("./client");
const CDP = require("chrome-remote-interface");

const getTargets = async () => {
  try {
    const port = await getCurrentClientPort();
    if (!port) {
      throw new Error("未获取到浏览器调试端口");
    }
    return await CDP.List({ port });
  } catch (error) {
    console.error("获取标签页列表失败:", error);
    return [];
  }
};

const searchTarget = async (tab) => {
  if (!tab) {
    throw new Error("未提供标签页搜索条件");
  }
  
  if (!tab.by || !tab.searchValue || tab.by === "active") {
    const currentTab = await getCurrentTab();
    return currentTab;
  }

  const targets = await getTargets();
  if (!targets || targets.length === 0) {
    throw new Error("未找到任何标签页");
  }
  
  const target = targets.find((target) =>
    target[tab.by] && target[tab.by].includes(tab.searchValue)
  );
  
  if (!target) {
    throw new Error(`未找到目标标签页: ${tab.by} = ${tab.searchValue}`);
  }
  
  return target;
};

const getTabs = async () => {
  const targets = await getTargets();
  return targets
    .filter((target) => target.type === "page")
    .map((target) => ({
      url: target.url,
      title: target.title,
      id: target.id,
    }));
};

const getCurrentTab = async () => {
  const targets = await getTargets();
  const currentTarget = targets.find((target) => target.type === "page");


  if (!currentTarget) {
    // 没有页面时自动创建一个新标签页
    const port = await getCurrentClientPort();
    const target = await CDP.New({ port });
    const { Page } = await CDP({ port, target });
    Page.navigate({ url: 'https://zwf4g5rfwiy.feishu.cn/docx/Omr1d3C9Xompv4xd68kc0wRnnug' });
    return {
      url: "https://zwf4g5rfwiy.feishu.cn/docx/Omr1d3C9Xompv4xd68kc0wRnnug",
      title: "密码管家",
      id: target.targetId,
    };
  }

  return {
    url: currentTarget.url,
    title: currentTarget.title,
    id: currentTarget.id,
  };
};

const activateTab = async (tab) => {
  const target = await searchTarget(tab);
  const port = await getCurrentClientPort();
  await CDP.Activate({ id: target.id, port });
};

const createNewTab = async (url = "about:blank") => {
  try {
    const currentTab = await getCurrentTab();
    const { Target } = await initCDP(currentTab.id);
    
    // 添加超时控制
    const createTabPromise = Target.createTarget({ url });
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("创建新标签页超时")), 10000);
    });
    
    const { targetId } = await Promise.race([createTabPromise, timeoutPromise]);
    
    if (!targetId) {
      throw new Error("创建标签页失败: 未返回targetId");
    }
    
    const { targetInfo } = await Target.getTargetInfo({ targetId });
    await cleanupCDP(currentTab.id);
    
    return {
      url: targetInfo.url,
      title: targetInfo.title,
      id: targetId,
    };
  } catch (error) {
    console.error("创建新标签页失败:", error);
    throw error;
  }
};

const closeTab = async (tab) => {
  const target = await searchTarget(tab);
  const port = await getCurrentClientPort();
  await cleanupCDP(target.id);
  await CDP.Close({ id: target.id, port });
};

module.exports = {
  getTabs,
  getCurrentTab,
  activateTab,
  createNewTab,
  closeTab,
  getTargets,
  searchTarget,
};
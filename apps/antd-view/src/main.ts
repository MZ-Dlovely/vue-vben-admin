import { preferencesManager } from '@vben-core/preferences';

import { overridesPreferences } from './preferences';

/**
 * 应用初始化完成之后再进行页面加载渲染
 */
async function initApplication() {
  // name用于指定项目唯一标识
  // 用于区分不同项目的偏好设置以及存储数据的key前缀以及其他一些需要隔离的数据
  const env = import.meta.env.PROD ? 'prod' : 'dev';
  const namespace = `${import.meta.env.VITE_APP_NAMESPACE}-${env}`;

  // app偏好设置初始化
  await preferencesManager.initPreferences({
    namespace,
    overrides: overridesPreferences,
  });

  // 启动应用并挂载
  // vue应用主要逻辑及视图
  const { bootstrap } = await import('./bootstrap');
  await bootstrap(namespace);

  // 移除并销毁loading
  destoryAppLoading();
}

/**
 * 移除并销毁loading
 * 放在这里是而不是放在 index.html 的app标签内，主要是因为这样比较不会生硬，渲染过快可能会有闪烁
 * 通过先添加css动画隐藏，在动画结束后在移除loading节点来改善体验
 */
function destoryAppLoading() {
  // 全局搜索文件 loading.html, 找到对应的节点
  const loadingElement = document.querySelector('#__app-loading__');
  if (loadingElement) {
    loadingElement.classList.add('hidden');
    const injectLoadingElements = document.querySelectorAll(
      '[data-app-loading^="inject"]',
    );
    // 过渡动画结束后移除loading节点
    loadingElement.addEventListener(
      'transitionend',
      () => {
        loadingElement.remove();
        injectLoadingElements.forEach((el) => el?.remove());
      },
      { once: true },
    );
  }
}

initApplication();
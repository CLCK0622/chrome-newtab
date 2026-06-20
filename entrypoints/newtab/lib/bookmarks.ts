// 读 chrome.bookmarks，按文件夹分组。非扩展环境（如本地预览）下优雅降级。

export interface BookmarkLink {
  title: string;
  url: string;
}

export interface BookmarkGroup {
  folder: string;
  links: BookmarkLink[];
}

function hasBookmarksApi(): boolean {
  return (
    typeof chrome !== 'undefined' &&
    !!chrome.bookmarks &&
    typeof chrome.bookmarks.getTree === 'function'
  );
}

export function bookmarksAvailable(): boolean {
  return hasBookmarksApi();
}

function getTree(): Promise<chrome.bookmarks.BookmarkTreeNode[]> {
  return new Promise((resolve, reject) => {
    try {
      chrome.bookmarks.getTree((nodes) => {
        const err = chrome.runtime?.lastError;
        if (err) reject(new Error(err.message));
        else resolve(nodes);
      });
    } catch (e) {
      reject(e);
    }
  });
}

// 把书签树展平成「文件夹 → 直接子链接」的分组；空文件夹忽略。
export async function loadBookmarkGroups(maxPerFolder = 8): Promise<BookmarkGroup[]> {
  if (!hasBookmarksApi()) return [];
  const tree = await getTree();
  const groups: BookmarkGroup[] = [];

  function walk(node: chrome.bookmarks.BookmarkTreeNode, folderName: string) {
    if (!node.children) return;
    const directLinks: BookmarkLink[] = [];
    for (const child of node.children) {
      if (child.url) {
        directLinks.push({ title: child.title || child.url, url: child.url });
      } else {
        // 子文件夹：用其自身名字递归
        walk(child, child.title || '未命名文件夹');
      }
    }
    if (directLinks.length > 0) {
      groups.push({ folder: folderName, links: directLinks.slice(0, maxPerFolder) });
    }
  }

  // 根节点的孩子是「书签栏 / 其他书签」等顶层容器
  for (const root of tree) {
    if (root.children) {
      for (const top of root.children) {
        walk(top, top.title || '书签');
      }
    }
  }

  return groups;
}

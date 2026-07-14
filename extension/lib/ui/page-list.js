// Page list sidebar.

/**
 * Create a page list controller.
 * @param {HTMLUListElement} ul
 */
export function createPageList(ul) {
  let activePage = null;

  return {
    /**
     * Render the page list from app state.
     * @param {{ pages: Array<{ pageNumber: number, status: string, source: string }>, currentPage: number|null }} state
     */
    render(state) {
      ul.innerHTML = "";
      activePage = state.currentPage;
      for (const page of state.pages) {
        const li = document.createElement("li");
        li.dataset.pageNumber = String(page.pageNumber);
        if (page.pageNumber === activePage) li.classList.add("active");

        const title = document.createElement("span");
        title.textContent = `Page ${page.pageNumber}`;
        li.appendChild(title);

        const status = document.createElement("div");
        status.className = "status";
        status.textContent = `${page.source} · ${page.status}`;
        li.appendChild(status);

        ul.appendChild(li);
      }
    },

    /**
     * Set the active page.
     * @param {number} pageNumber
     */
    setActive(pageNumber) {
      activePage = pageNumber;
      for (const li of ul.children) {
        li.classList.toggle("active", Number(li.dataset.pageNumber) === pageNumber);
      }
    },
  };
}

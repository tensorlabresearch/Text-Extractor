// Result editor — editable OCR text lines.

/**
 * Create a result editor controller.
 * @param {HTMLDivElement} container
 */
export function createResultEditor(container) {
  let selectedId = null;

  return {
    /**
     * Render editable lines.
     * @param {Array<{ id: string, text: string, userEdited: boolean }>} lines
     * @param {Function} onEdit - (id, newText) => void
     */
    render(lines, onEdit) {
      container.innerHTML = "";
      for (const line of lines) {
        const div = document.createElement("div");
        div.className = "line-item";
        div.dataset.id = line.id;
        if (line.id === selectedId) div.classList.add("selected");

        const textarea = document.createElement("textarea");
        textarea.value = line.text;
        textarea.rows = 1;
        textarea.addEventListener("input", () => {
          onEdit(line.id, textarea.value);
        });

        div.appendChild(textarea);
        container.appendChild(div);
      }
    },

    /**
     * Select a line by ID.
     * @param {string|null} id
     */
    select(id) {
      selectedId = id;
      for (const el of container.children) {
        el.classList.toggle("selected", el.dataset.id === id);
      }
    },
  };
}

const fs = require('fs');
const content = fs.readFileSync('src/pages/AdminPage.jsx', 'utf8');

// 1. Inject isSelected and onSelect to CategoryRow props
let newContent = content.replace(
  /function CategoryRow\(\{ cat, onToggle, onRemove, isChild, children = \[\], isDraggingParent \}\) \{/,
  'function CategoryRow({ cat, onToggle, onRemove, isChild, children = [], isDraggingParent, isSelected, onSelect }) {'
);

// 2. Add checkbox inside CategoryRow
newContent = newContent.replace(
  /<div ref=\{setDragRef\}/,
  '<input type="checkbox" checked={isSelected} onChange={() => onSelect(cat.id)} className="w-5 h-5 accent-red-500 mr-1 cursor-pointer" />\n        <div ref={setDragRef}'
);

// 3. Propagate isSelected and onSelect to children Recursive
newContent = newContent.replace(
  /<CategoryRow key=\{sub\.id\} cat=\{sub\} onToggle=\{onToggle\} onRemove=\{onRemove\} isChild \/>/g,
  '<CategoryRow key={sub.id} cat={sub} onToggle={onToggle} onRemove={onRemove} isChild isSelected={selectedCats.has(sub.id)} onSelect={onSelect} />'
);
// Above requires `selectedCats` to be in scope or passed. Wait! CategoryRow doesn't have `selectedCats` in scope.
// So pass `selectedCats` to CategoryRow:
newContent = newContent.replace(
  /function CategoryRow\(\{ cat, onToggle, onRemove, isChild, children = \[\], isDraggingParent, isSelected, onSelect \}\) \{/,
  'function CategoryRow({ cat, onToggle, onRemove, isChild, children = [], isDraggingParent, isSelected, onSelect, selectedCats }) {'
);
newContent = newContent.replace(
  /<CategoryRow key=\{sub\.id\} cat=\{sub\} onToggle=\{onToggle\} onRemove=\{onRemove\} isChild isSelected=\{selectedCats\.has\(sub\.id\)\} onSelect=\{onSelect\} \/>/g,
  '<CategoryRow key={sub.id} cat={sub} onToggle={onToggle} onRemove={onRemove} isChild selectedCats={selectedCats} isSelected={selectedCats.has(sub.id)} onSelect={onSelect} />'
);

// 4. Inject selectedCats state and handlers into AdminPage component
const adminPageRegex = /(const \[newBanner, setNewBanner\]\s*=\s*useState\(\{ title:'', link:'' \}\);)/;
const injectedState = `$1
  const [selectedCats, setSelectedCats] = useState(new Set());

  const toggleSelectCat = (id) => {
    const next = new Set(selectedCats);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedCats(next);
  };

  const selectAllCats = () => {
    if (selectedCats.size === categories.length) setSelectedCats(new Set());
    else setSelectedCats(new Set(categories.map(c => c.id)));
  };

  const deleteSelectedCats = async () => {
    if (!window.confirm(\`Excluir \${selectedCats.size} categorias selecionadas de uma vez?\`)) return;
    setLoading(true);
    // Para simplificar e evitar problemas de assincronicidade pesada no cliente, deletamos em lote (batch-like loop)
    for (const id of Array.from(selectedCats)) {
      await deleteDoc(doc(db, 'categories', id));
    }
    setSelectedCats(new Set());
    await loadAll();
    setLoading(false);
  };
`;
newContent = newContent.replace(adminPageRegex, injectedState);

// 5. Update parentCats mapping to pass the selection props
const parentRowRegex = /<CategoryRow\s+key=\{parent\.id\}\s+cat=\{parent\}\s+children=\{childrenOf\(parent\.id\)\}\s+onToggle=\{toggleActive\}\s+onRemove=\{id => remove\('categories', id\)\}\s+isChild=\{false\}\s+isDraggingParent=\{activeId === parent\.id\}\s*\/>/g;
const injectedParentRow = `<CategoryRow
                      key={parent.id}
                      cat={parent}
                      children={childrenOf(parent.id)}
                      onToggle={toggleActive}
                      onRemove={id => remove('categories', id)}
                      isChild={false}
                      isDraggingParent={activeId === parent.id}
                      selectedCats={selectedCats}
                      isSelected={selectedCats.has(parent.id)}
                      onSelect={toggleSelectCat}
                    />`;
newContent = newContent.replace(parentRowRegex, injectedParentRow);

// 6. Inject the Action Bar above the list
const dndContextRegex = /<DndContext/;
const injectedActionBar = `
              <div className="flex items-center justify-between mb-4 p-4 rounded-xl" style={{background: selectedCats.size > 0 ? 'rgba(239,68,68,0.1)' : '#111', border: \`1px solid \${selectedCats.size > 0 ? '#ef4444' : '#222'}\`}}>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={categories.length > 0 && selectedCats.size === categories.length} onChange={selectAllCats} className="w-5 h-5 accent-red-500" />
                  <span className="text-xs font-black uppercase tracking-widest text-white">Selecionar Tudo</span>
                </label>
                {selectedCats.size > 0 && (
                  <button onClick={deleteSelectedCats} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors">
                    <span className="material-symbols-outlined text-sm">delete_sweep</span>
                    Excluir {selectedCats.size}
                  </button>
                )}
              </div>
              <DndContext`;
newContent = newContent.replace(dndContextRegex, injectedActionBar);

fs.writeFileSync('src/pages/AdminPage.jsx', newContent);
console.log('AdminPage.jsx patched with bulk delete functionality');

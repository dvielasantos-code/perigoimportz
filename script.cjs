const fs = require('fs');
const content = fs.readFileSync('src/pages/AdminPage.jsx', 'utf8');

let newContent = content;

// 1. Remove PRESET
newContent = newContent.replace(/\/\/ ─── Presets ───[\s\S]*?\];/g, '');

// 2. Componentes DND
const componentsRegex = /\/\/ ─── Chip draggável ───[\s\S]*?\/\/ ─── Página principal ───/g;
const newComponents = `// ─── Componentes de Categoria Draggável ──────────────────────────────────────
function CategoryRow({ cat, onToggle, onRemove, isChild, children = [], isDraggingParent }) {
  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({ id: cat.id });
  const { setNodeRef: setDropSortRef, isOver } = useDroppable({ id: cat.id });
  const { setNodeRef: setDropNestRef, isOver: isNestOver } = useDroppable({ id: \`drop:\${cat.id}\` });

  return (
    <div
      ref={setDropSortRef}
      className={"flex flex-col gap-2 transition-all w-full"}
      style={{
        opacity: isDragging ? 0.3 : 1,
        borderTop: isOver && !isChild ? '2px solid #22c55e' : 'none',
      }}
    >
      <div 
        className="flex items-center gap-3 p-3 rounded-xl transition-all"
        style={{
          background: isChild ? '#141414' : '#1a1a1a',
          border: \`1px solid \${isNestOver ? '#22c55e' : '#2a2a2a'}\`,
          marginLeft: isChild ? '2rem' : '0',
          position: 'relative'
        }}
      >
        <div ref={setDragRef} {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing text-[#555] hover:text-white px-2">
          <span className="material-symbols-outlined text-xl">drag_indicator</span>
        </div>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#222] text-xl shrink-0" style={{ opacity: cat.active ? 1 : 0.4 }}>
          {ri(cat.icon)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-sm uppercase tracking-tighter text-white" style={{ opacity: cat.active ? 1 : 0.4 }}>{cat.name}</p>
          {!isChild && (
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#555]">
              {children.length} subcategorias
            </p>
          )}
        </div>
        
        <label className="relative inline-flex items-center cursor-pointer mr-3" title={cat.active ? "Desativar" : "Ativar"}>
          <input type="checkbox" className="sr-only peer" checked={cat.active} onChange={() => onToggle(cat)} />
          <div className="w-9 h-5 bg-[#333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
        </label>
        
        <button onClick={() => onRemove(cat.id)} className="text-[#555] hover:text-red-500 transition-colors px-2">
          <span className="material-symbols-outlined text-lg">delete</span>
        </button>
      </div>

      {!isChild && children && children.length > 0 && (
         <div className="flex flex-col gap-2 mt-1 mb-2">
           {children.map(sub => (
             <CategoryRow key={sub.id} cat={sub} onToggle={onToggle} onRemove={onRemove} isChild />
           ))}
         </div>
      )}

      {!isChild && !isDraggingParent && (
        <div 
          ref={setDropNestRef} 
          className="ml-8 mb-3 p-3 rounded-xl border border-dashed transition-all flex items-center justify-center gap-2"
          style={{
            background: isNestOver ? 'rgba(34,197,94,0.05)' : 'transparent',
            borderColor: isNestOver ? '#22c55e' : '#2a2a2a',
            color: isNestOver ? '#22c55e' : '#555'
          }}
        >
          <span className="text-[10px] font-bold uppercase tracking-widest">
            {isNestOver ? 'Soltar aqui para aninhar' : 'Arraste para cá para aninhar em ' + cat.name}
          </span>
        </div>
      )}
    </div>
  );
}

function DragGhost({ cat }) {
  if (!cat) return null;
  return (
    <div className="flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl scale-105"
      style={{ background: '#22c55e', color: '#000', border: '1px solid #22c55e' }}>
      <span className="text-2xl leading-none">{ri(cat.icon)}</span>
      <span className="text-xs font-black uppercase tracking-wide">{cat.name}</span>
    </div>
  );
}

// ─── Página principal ───`;

newContent = newContent.replace(componentsRegex, newComponents);

// 3. Remove Popular method
newContent = newContent.replace(/\/\/ ─── Popular ───[\s\S]*?\/\/ ─── Criar categoria manual ───/g, '// ─── Criar categoria manual ───');

// 4. Update DragEnd handler
const dragEndRegex = /const handleDragEnd = async \(\{ active, over \}\) => \{[\s\S]*?\/\/ ─── Produto ───/;
const newDragEnd = `const handleDragEnd = async ({ active, over }) => {
    setActiveId(null);
    if (!over) return;

    const draggedId = active.id;
    const overId    = over.id;

    const draggedCat = categories.find(c => c.id === draggedId);
    if (!draggedCat) return;

    // Se soltou na zona raiz (tirar de dentro)
    if (overId === 'drop:__root__') {
       if (draggedCat.parentId === null) return;
       await setDoc(doc(db, 'categories', draggedId), { ...draggedCat, parentId: null });
       await loadAll();
       return;
    }

    // Se soltou em uma zona de "Drop (Aninhar)": Muda o Parent
    if (String(overId).startsWith('drop:')) {
      const targetParentId = overId.replace('drop:', '');
      if (draggedCat.parentId === targetParentId) return;

      if (targetParentId === draggedId) return; // Anti-loop
      const subIds = categories.filter(c => c.parentId === draggedId).map(c => c.id);
      if (subIds.includes(targetParentId)) return; // Anti-loop (pai não pode aninhar em filho)

      await setDoc(doc(db, 'categories', draggedId), { ...draggedCat, parentId: targetParentId });
      await loadAll();
      return;
    }

    // Se soltou em cima de outra categoria: Reordenar e adotar o mesmo parent
    const overCat = categories.find(c => c.id === overId);
    if (overCat && overCat.id !== draggedId) {
      const sameLevel = categories.filter(c => c.parentId === overCat.parentId);
      let oldIndex = sameLevel.findIndex(c => c.id === draggedId);
      
      // Se ele veio de outro parent, adiciona na nova lista do parent
      if (oldIndex === -1) {
         oldIndex = sameLevel.length; // coloca no final como fallback
         sameLevel.push(draggedCat);
      }
      
      const newIndex = sameLevel.findIndex(c => c.id === overId);

      if (newIndex !== -1) {
        sameLevel.splice(oldIndex, 1);
        sameLevel.splice(newIndex, 0, draggedCat);

        // Atualizar ordens sequenciais no Firestore (incluindo a possível mudança de parentId)
        for (let i = 0; i < sameLevel.length; i++) {
          await setDoc(doc(db, 'categories', sameLevel[i].id), { 
            ...sameLevel[i], 
            parentId: overCat.parentId,
            order: i 
          });
        }
        await loadAll();
      }
    }
  };

  // ─── Produto ───`;

newContent = newContent.replace(dragEndRegex, newDragEnd);

// 5. Categorias Tab JSX
const catsTabRegex = /\{\/\* ══ CATEGORIAS \(com DND real\) ══ \*\/\}[\s\S]*?\{\/\* ══ BANNERS ══ \*\/\}/g;
const newCatsTab = `{/* ══ CATEGORIAS (com DND real) ══ */}
        {activeTab==='categorias' && (
          <div className="flex flex-col gap-5">

            <div className="p-6 rounded-2xl bg-[#111] border border-[#222]">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-black uppercase tracking-tighter text-sm">Nova Categoria</h3>
              </div>
              <form onSubmit={addCat} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest block mb-1" style={{color:G}}>Nome</label>
                  <input required placeholder="Ex: Regatas" value={newCat.name} onChange={e=>setNewCat({...newCat,name:e.target.value})} className={inp}/>
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest block mb-1" style={{color:G}}>Categoria Pai</label>
                  <select value={newCat.parentId||''} onChange={e=>setNewCat({...newCat,parentId:e.target.value||null})} className={inp}>
                    <option value="">Nenhuma (Principal)</option>
                    {parentCats.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest block mb-1" style={{color:G}}>Ícone</label>
                  <div className="flex flex-wrap gap-1 p-2 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a]" style={{maxHeight:80,overflowY:'auto'}}>
                    {ICONS.map(ic=>(
                      <button key={ic.id} type="button" title={ic.label}
                        onClick={()=>setNewCat({...newCat,icon:ic.id})}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-lg transition-all"
                        style={newCat.icon===ic.id?{background:G,transform:'scale(1.15)'}:{background:'#252525'}}>
                        {ic.id}
                      </button>
                    ))}
                  </div>
                </div>
                <button type="submit" disabled={loading} className="rounded-xl text-black font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-opacity" style={{background:G,height:46}}>
                  Criar
                </button>
              </form>
            </div>

            {categories.length > 0 && (
              <div className="flex items-center gap-3 px-5 py-3 rounded-xl" style={{background:'#111',border:'1px solid #222'}}>
                <span className="material-symbols-outlined text-base text-[#555]">info</span>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#888]">
                  Arraste uma categoria <strong className="text-white">sobre outra</strong> para reordenar. Arraste para o tracejado dela para <strong className="text-green-500">aninhar</strong>. Arraste para o topo para <strong className="text-red-400">tirar de dentro</strong>. 
                </p>
                <span className="ml-auto text-[10px] font-bold text-[#444]">
                  {categories.length} total · {parentCats.length} pais · {categories.length-parentCats.length} subs
                </span>
              </div>
            )}

            {categories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 rounded-2xl border-2 border-dashed border-[#222]">
                <span className="material-symbols-outlined text-5xl text-[#2a2a2a]">category</span>
                <p className="text-xs font-bold uppercase tracking-widest mt-4 text-[#333]">Nenhuma categoria</p>
                <p className="text-[10px] mt-2 text-[#2a2a2a]">Crie uma acima para começar</p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                {activeId && (
                  <div className="mb-2">
                    <div ref={useDroppable({ id: 'drop:__root__' }).setNodeRef}
                      className="p-4 rounded-xl border-2 border-dashed transition-all flex items-center justify-center gap-2"
                      style={{
                         background: 'rgba(34,197,94,0.05)',
                         borderColor: G,
                         color: G
                      }}>
                      <span className="material-symbols-outlined text-lg">vertical_align_top</span>
                      <span className="text-[10px] font-black uppercase tracking-widest">Solte aqui para tornar Root (tirar de dentro)</span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1 w-full bg-[#111] border border-[#222] p-4 rounded-2xl">
                  {parentCats.map(parent => (
                    <CategoryRow
                      key={parent.id}
                      cat={parent}
                      children={childrenOf(parent.id)}
                      onToggle={toggleActive}
                      onRemove={id => remove('categories', id)}
                      isChild={false}
                      isDraggingParent={activeId === parent.id}
                    />
                  ))}
                </div>

                <DragOverlay dropAnimation={null}>
                  <DragGhost cat={activeCat} />
                </DragOverlay>
              </DndContext>
            )}
          </div>
        )}

        {/* ══ BANNERS ══ */}`;

newContent = newContent.replace(catsTabRegex, newCatsTab);
fs.writeFileSync('src/pages/AdminPage.jsx', newContent);
console.log('Done!');

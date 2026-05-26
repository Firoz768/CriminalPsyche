"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: string;
}

interface EvidenceItem {
  id: string;
  title: string;
  description?: string;
  type: string;
  imageUrl?: string;
  x: number;
  y: number;
  connections: number[];
}

interface CaseData {
  _id?: string;
  title?: string;
  slug?: string;
  summary?: string;
  body?: string;
  psychologyProfile?: string;
  motiveSummary?: string;
  behavioralPatterns?: string;
  status?: "draft" | "published";
  killerName?: string;
  motiveCategory?: string;
  yearOfCrime?: number | string;
  region?: string;
  coverImage?: string;
  tags?: string[];
  timelineEvents?: TimelineEvent[];
  evidenceItems?: EvidenceItem[];
}

interface CaseFormProps {
  initialData?: CaseData;
  isEdit?: boolean;
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 bg-[#0f0f0f] border-b border-[#2a2a2a] p-2">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded transition-colors ${editor.isActive('bold') ? 'bg-[#2a2a2a] text-[#e8e8e8]' : 'text-[#888888] hover:text-[#e8e8e8]'}`} title="Bold">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" /></svg>
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded transition-colors ${editor.isActive('italic') ? 'bg-[#2a2a2a] text-[#e8e8e8]' : 'text-[#888888] hover:text-[#e8e8e8]'}`} title="Italic">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
      </button>
      <div className="w-[1px] h-6 bg-[#2a2a2a] mx-1"></div>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`p-2 rounded transition-colors font-bold font-serif ${editor.isActive('heading', { level: 1 }) ? 'bg-[#2a2a2a] text-[#e8e8e8]' : 'text-[#888888] hover:text-[#e8e8e8]'}`} title="Heading 1">H1</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-2 rounded transition-colors font-bold font-serif ${editor.isActive('heading', { level: 2 }) ? 'bg-[#2a2a2a] text-[#e8e8e8]' : 'text-[#888888] hover:text-[#e8e8e8]'}`} title="Heading 2">H2</button>
      <div className="w-[1px] h-6 bg-[#2a2a2a] mx-1"></div>
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 rounded transition-colors ${editor.isActive('bulletList') ? 'bg-[#2a2a2a] text-[#e8e8e8]' : 'text-[#888888] hover:text-[#e8e8e8]'}`} title="Bullet List">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`p-2 rounded transition-colors ${editor.isActive('blockquote') ? 'bg-[#2a2a2a] text-[#e8e8e8]' : 'text-[#888888] hover:text-[#e8e8e8]'}`} title="Blockquote">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
      </button>
      <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} className={`p-2 rounded transition-colors text-[#888888] hover:text-[#e8e8e8]`} title="Divider">
        <span className="font-bold tracking-widest">---</span>
      </button>
    </div>
  );
};

function SortableEventItem({ event, onRemove, onChange }: { event: TimelineEvent, onRemove: (id: string) => void, onChange: (id: string, field: keyof TimelineEvent, value: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: event.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-[#111111] border border-[#2a2a2a] p-4 rounded-sm mb-4 relative">
      <div className="absolute top-4 right-4 flex gap-4 items-center">
        <div {...attributes} {...listeners} className="text-[#555555] cursor-grab hover:text-[#e8e8e8]" title="Drag to reorder">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" /></svg>
        </div>
        <button type="button" onClick={() => onRemove(event.id)} className="text-[#8b0000] text-xs font-bold uppercase tracking-widest hover:text-red-400">REMOVE</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 mt-8 md:mt-2">
        <div>
          <label className="block font-body text-[#888888] text-[10px] uppercase tracking-wide mb-1">Date</label>
          <input 
            type="text" 
            value={event.date}
            onChange={(e) => onChange(event.id, 'date', e.target.value)}
            placeholder="e.g. November 9 1888 or Early 1970s"
            className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-[#e8e8e8] placeholder:text-[#555555] focus:outline-none focus:border-[#8b0000] px-3 py-2 font-mono text-sm"
          />
        </div>
        <div>
          <label className="block font-body text-[#888888] text-[10px] uppercase tracking-wide mb-1">Event Type</label>
          <select 
            value={event.type}
            onChange={(e) => onChange(event.id, 'type', e.target.value)}
            className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-[#e8e8e8] focus:outline-none focus:border-[#8b0000] px-3 py-2 font-body text-sm"
          >
            <option value="murder" style={{color: '#8b0000'}}>Murder</option>
            <option value="investigation" style={{color: '#555555'}}>Investigation</option>
            <option value="suspect" style={{color: '#8b4500'}}>Suspect</option>
            <option value="arrest" style={{color: '#1a7a1a'}}>Arrest</option>
            <option value="evidence" style={{color: '#1a3a7a'}}>Evidence</option>
            <option value="communication" style={{color: '#6a1a7a'}}>Communication</option>
            <option value="outcome" style={{color: '#888888'}}>Outcome</option>
          </select>
        </div>
      </div>
      <div className="mb-4">
        <label className="block font-body text-[#888888] text-[10px] uppercase tracking-wide mb-1">Event Title</label>
        <input 
          type="text" 
          value={event.title}
          onChange={(e) => onChange(event.id, 'title', e.target.value)}
          placeholder="Short title max 6 words"
          className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-[#e8e8e8] placeholder:text-[#555555] focus:outline-none focus:border-[#8b0000] px-3 py-2 font-heading text-sm"
        />
      </div>
      <div>
        <label className="block font-body text-[#888888] text-[10px] uppercase tracking-wide mb-1">Description</label>
        <textarea 
          value={event.description}
          onChange={(e) => onChange(event.id, 'description', e.target.value)}
          placeholder="2-3 sentence description of this event"
          rows={3}
          className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-[#e8e8e8] placeholder:text-[#555555] focus:outline-none focus:border-[#8b0000] px-3 py-2 font-body text-sm resize-y"
        />
      </div>
    </div>
  );
}

export default function CaseForm({ initialData, isEdit }: CaseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [slugEdited, setSlugEdited] = useState(isEdit ? true : false);
  const [summary, setSummary] = useState(initialData?.summary || "");
  const [psychologyProfile, setPsychologyProfile] = useState(initialData?.psychologyProfile || "");
  const [motiveSummary, setMotiveSummary] = useState(initialData?.motiveSummary || "");
  const [behavioralPatterns, setBehavioralPatterns] = useState(initialData?.behavioralPatterns || "");
  
  // Sidebar State
  const [status, setStatus] = useState(initialData?.status || "draft");
  const [killerName, setKillerName] = useState(initialData?.killerName || "");
  const [motiveCategory, setMotiveCategory] = useState(initialData?.motiveCategory || "unknown");
  const [yearOfCrime, setYearOfCrime] = useState(initialData?.yearOfCrime || "");
  const [region, setRegion] = useState(initialData?.region || "");
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || "");
  
  // Tags
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState("");

  // Timeline Events
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(
    initialData?.timelineEvents || []
  );

  // Evidence Items
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>(
    initialData?.evidenceItems || []
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialData?.body || "",
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none p-6 min-h-[400px]',
      },
    },
  });

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugEdited && title) {
      const generated = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setSlug(generated);
    }
  }, [title, slugEdited]);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(e.target.value);
    setSlugEdited(true);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddTimelineEvent = () => {
    setTimelineEvents([
      ...timelineEvents,
      {
        id: crypto.randomUUID(),
        date: "",
        title: "",
        description: "",
        type: "murder"
      }
    ]);
  };

  const handleRemoveTimelineEvent = (id: string) => {
    setTimelineEvents(timelineEvents.filter(ev => ev.id !== id));
  };

  const handleUpdateTimelineEvent = (id: string, field: keyof TimelineEvent, value: string) => {
    setTimelineEvents(timelineEvents.map(ev => ev.id === id ? { ...ev, [field]: value } : ev));
  };

  const handleAddEvidenceItem = () => {
    setEvidenceItems([
      ...evidenceItems,
      {
        id: crypto.randomUUID(),
        title: "",
        description: "",
        type: "note",
        imageUrl: "",
        x: 50,
        y: 50,
        connections: []
      }
    ]);
  };

  const handleRemoveEvidenceItem = (id: string) => {
    setEvidenceItems(evidenceItems.filter(ev => ev.id !== id));
  };

  const handleUpdateEvidenceItem = (id: string, field: keyof EvidenceItem, value: any) => {
    setEvidenceItems(evidenceItems.map(ev => ev.id === id ? { ...ev, [field]: value } : ev));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setTimelineEvents((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSubmit = async (submitStatus: "draft" | "published") => {
    setLoading(true);
    setError("");
    
    const bodyContent = editor?.getHTML() || "";
    
    const payload = {
      title,
      slug,
      summary,
      body: bodyContent,
      psychologyProfile,
      motiveSummary,
      behavioralPatterns,
      status: submitStatus,
      killerName,
      motiveCategory,
      yearOfCrime: yearOfCrime ? parseInt(yearOfCrime.toString(), 10) : undefined,
      region,
      coverImage,
      tags,
      timelineEvents,
      evidenceItems
    };

    try {
      const endpoint = isEdit ? `/api/admin/cases/${initialData?._id}` : "/api/admin/cases";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Something went wrong");

      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      
      {/* LEFT COLUMN */}
      <div className="w-full lg:w-2/3 space-y-10">
        <header>
          <h1 className="font-heading text-[#e8e8e8] text-[36px] font-bold tracking-tight uppercase">
            {isEdit ? "EDIT CASE FILE" : "NEW CASE FILE"}
          </h1>
          {error && <div className="mt-4 p-4 bg-[#8b0000]/20 border border-[#8b0000] text-[#e8e8e8] text-sm">{error}</div>}
        </header>

        {/* BASIC INFO */}
        <section className="space-y-6">
          <div>
            <label className="block font-body text-[#888888] text-[12px] uppercase tracking-wide mb-2">Case Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., The Zodiac Murders"
              className="w-full bg-[#111111] border border-[#2a2a2a] text-[#e8e8e8] placeholder:text-[#555555] focus:outline-none focus:border-[#8b0000] px-4 py-3 font-heading text-xl transition-colors"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full">
              <div className="flex items-center justify-between mb-2">
                <label className="font-body text-[#888888] text-[12px] uppercase tracking-wide">Slug</label>
                {!slugEdited && <span className="bg-[#2a2a2a] text-[#888888] text-[10px] px-2 py-0.5 rounded-sm uppercase tracking-widest">Auto</span>}
              </div>
              <input 
                type="text" 
                value={slug}
                onChange={handleSlugChange}
                placeholder="e.g., the-zodiac-murders"
                className="w-full bg-[#111111] border border-[#2a2a2a] text-[#e8e8e8] placeholder:text-[#555555] focus:outline-none focus:border-[#8b0000] px-4 py-2.5 font-mono text-sm transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block font-body text-[#888888] text-[12px] uppercase tracking-wide mb-2">Summary</label>
            <textarea 
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="A brief 2-line summary for the archive cards..."
              rows={3}
              className="w-full bg-[#111111] border border-[#2a2a2a] text-[#e8e8e8] placeholder:text-[#555555] focus:outline-none focus:border-[#8b0000] px-4 py-3 font-body text-sm transition-colors resize-y"
            />
          </div>
        </section>

        {/* CONTENT EDITOR */}
        <section>
          <label className="block font-body text-[#8b0000] text-[12px] uppercase tracking-[0.2em] font-bold mb-3">CASE BODY</label>
          <div className="border border-[#2a2a2a] bg-[#111111] focus-within:border-[#8b0000] transition-colors overflow-hidden flex flex-col">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
          </div>
        </section>

        {/* PROFILE SECTIONS */}
        <section className="space-y-8">
          <div>
            <label className="block font-body text-[#8b0000] text-[12px] uppercase tracking-[0.2em] font-bold mb-3 flex items-center gap-2">
              <span className="w-4 h-[1px] bg-[#8b0000]"></span> PSYCHOLOGICAL PROFILE
            </label>
            <textarea 
              value={psychologyProfile}
              onChange={(e) => setPsychologyProfile(e.target.value)}
              placeholder="Enter psychological analysis..."
              rows={5}
              className="w-full bg-[#111111] border border-[#2a2a2a] text-[#e8e8e8] placeholder:text-[#555555] focus:outline-none focus:border-[#8b0000] px-4 py-3 font-body text-sm transition-colors resize-y"
            />
          </div>

          <div>
            <label className="block font-body text-[#8b0000] text-[12px] uppercase tracking-[0.2em] font-bold mb-3 flex items-center gap-2">
              <span className="w-4 h-[1px] bg-[#8b0000]"></span> MOTIVE ANALYSIS
            </label>
            <textarea 
              value={motiveSummary}
              onChange={(e) => setMotiveSummary(e.target.value)}
              placeholder="Detailed breakdown of the subject's motives..."
              rows={5}
              className="w-full bg-[#111111] border border-[#2a2a2a] text-[#e8e8e8] placeholder:text-[#555555] focus:outline-none focus:border-[#8b0000] px-4 py-3 font-body text-sm transition-colors resize-y"
            />
          </div>

          <div>
            <label className="block font-body text-[#8b0000] text-[12px] uppercase tracking-[0.2em] font-bold mb-3 flex items-center gap-2">
              <span className="w-4 h-[1px] bg-[#8b0000]"></span> BEHAVIORAL PATTERNS
            </label>
            <textarea 
              value={behavioralPatterns}
              onChange={(e) => setBehavioralPatterns(e.target.value)}
              placeholder="Modus Operandi, rituals, or observed behaviors..."
              rows={5}
              className="w-full bg-[#111111] border border-[#2a2a2a] text-[#e8e8e8] placeholder:text-[#555555] focus:outline-none focus:border-[#8b0000] px-4 py-3 font-body text-sm transition-colors resize-y"
            />
          </div>
        </section>

        {/* TIMELINE EVENTS SECTION */}
        <section className="pt-8 border-t border-[#2a2a2a]">
          <div className="flex items-end justify-between mb-6">
            <div>
              <label className="block font-body text-[#8b0000] text-[12px] uppercase tracking-[0.2em] font-bold mb-1">
                TIMELINE EVENTS
              </label>
              <div className="text-[#888888] text-[12px]">Add chronological events for this case</div>
            </div>
            {timelineEvents.length > 0 && (
              <div className="text-[#888888] text-[11px] uppercase">
                {timelineEvents.length} {timelineEvents.length === 1 ? 'EVENT' : 'EVENTS'} ADDED
              </div>
            )}
          </div>
          
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={timelineEvents.map(t => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-0">
                {timelineEvents.map(event => (
                  <SortableEventItem 
                    key={event.id} 
                    event={event} 
                    onRemove={handleRemoveTimelineEvent}
                    onChange={handleUpdateTimelineEvent}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <button 
            type="button" 
            onClick={handleAddTimelineEvent}
            className="w-full mt-2 py-4 bg-transparent border border-[#8b0000] text-[#8b0000] font-body text-[12px] uppercase tracking-[0.2em] font-bold hover:bg-[#8b0000]/10 transition-colors"
          >
            + ADD TIMELINE EVENT
          </button>
        </section>

        {/* EVIDENCE BOARD SECTION */}
        <section className="pt-8 border-t border-[#2a2a2a]">
          <div className="flex items-end justify-between mb-6">
            <div>
              <label className="block font-body text-[#8b0000] text-[12px] uppercase tracking-[0.2em] font-bold mb-1">
                EVIDENCE BOARD
              </label>
              <div className="text-[#888888] text-[12px]">Add evidence items that appear on the case evidence board</div>
            </div>
            {evidenceItems.length > 0 && (
              <div className="text-[#888888] text-[11px] uppercase">
                {evidenceItems.length} {evidenceItems.length === 1 ? 'ITEM' : 'ITEMS'} ADDED
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            {evidenceItems.map((item, index) => (
              <div key={item.id} className="bg-[#111111] border border-[#2a2a2a] p-4 rounded-sm relative">
                <div className="absolute top-4 right-4 flex gap-4 items-center">
                  <span className="text-[#555555] text-xs font-mono">#{index}</span>
                  <button type="button" onClick={() => handleRemoveEvidenceItem(item.id)} className="text-[#8b0000] text-xs font-bold uppercase tracking-widest hover:text-red-400">REMOVE</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 mt-8 md:mt-2">
                  <div>
                    <label className="block font-body text-[#888888] text-[10px] uppercase tracking-wide mb-1">Title</label>
                    <input 
                      type="text" 
                      value={item.title}
                      onChange={(e) => handleUpdateEvidenceItem(item.id, 'title', e.target.value)}
                      placeholder="e.g. Victim photograph"
                      className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-[#e8e8e8] placeholder:text-[#555555] focus:outline-none focus:border-[#8b0000] px-3 py-2 font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-body text-[#888888] text-[10px] uppercase tracking-wide mb-1">Type</label>
                    <select 
                      value={item.type}
                      onChange={(e) => handleUpdateEvidenceItem(item.id, 'type', e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-[#e8e8e8] focus:outline-none focus:border-[#8b0000] px-3 py-2 font-body text-sm"
                    >
                      <option value="photo" style={{color: '#8b0000'}}>Photo</option>
                      <option value="document" style={{color: '#1a3a7a'}}>Document</option>
                      <option value="weapon" style={{color: '#8b4500'}}>Weapon</option>
                      <option value="note" style={{color: '#6a5a00'}}>Note</option>
                      <option value="map" style={{color: '#1a5a1a'}}>Map</option>
                      <option value="profile" style={{color: '#6a1a7a'}}>Profile</option>
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block font-body text-[#888888] text-[10px] uppercase tracking-wide mb-1">Image URL</label>
                  <input 
                    type="text" 
                    value={item.imageUrl || ""}
                    onChange={(e) => handleUpdateEvidenceItem(item.id, 'imageUrl', e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-[#e8e8e8] placeholder:text-[#555555] focus:outline-none focus:border-[#8b0000] px-3 py-2 font-mono text-sm"
                  />
                </div>
                <div className="mb-4">
                  <label className="block font-body text-[#888888] text-[10px] uppercase tracking-wide mb-1">Description</label>
                  <textarea 
                    value={item.description || ""}
                    onChange={(e) => handleUpdateEvidenceItem(item.id, 'description', e.target.value)}
                    rows={2}
                    className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-[#e8e8e8] placeholder:text-[#555555] focus:outline-none focus:border-[#8b0000] px-3 py-2 font-body text-sm resize-y"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block font-body text-[#888888] text-[10px] uppercase tracking-wide mb-1">Position X</label>
                    <input 
                      type="number" 
                      min="0" max="100"
                      value={item.x}
                      onChange={(e) => handleUpdateEvidenceItem(item.id, 'x', Number(e.target.value))}
                      placeholder="50"
                      className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-[#e8e8e8] placeholder:text-[#555555] focus:outline-none focus:border-[#8b0000] px-3 py-2 font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-body text-[#888888] text-[10px] uppercase tracking-wide mb-1">Position Y</label>
                    <input 
                      type="number" 
                      min="0" max="100"
                      value={item.y}
                      onChange={(e) => handleUpdateEvidenceItem(item.id, 'y', Number(e.target.value))}
                      placeholder="50"
                      className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-[#e8e8e8] placeholder:text-[#555555] focus:outline-none focus:border-[#8b0000] px-3 py-2 font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-body text-[#888888] text-[10px] uppercase tracking-wide mb-1">Connections</label>
                    <input 
                      type="text" 
                      value={item.connections?.join(', ') || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        const arr = val.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
                        handleUpdateEvidenceItem(item.id, 'connections', arr);
                      }}
                      placeholder="e.g. 0, 2"
                      className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-[#e8e8e8] placeholder:text-[#555555] focus:outline-none focus:border-[#8b0000] px-3 py-2 font-mono text-sm"
                    />
                  </div>
                </div>
                <div className="mt-2 text-[#555555] text-[11px] font-body">X and Y are percentage positions on the board (0-100). Connections are index numbers of other items.</div>
              </div>
            ))}
          </div>

          <button 
            type="button" 
            onClick={handleAddEvidenceItem}
            className="w-full mt-4 py-4 bg-transparent border border-[#8b0000] text-[#8b0000] font-body text-[12px] uppercase tracking-[0.2em] font-bold hover:bg-[#8b0000]/10 transition-colors"
          >
            + ADD EVIDENCE ITEM
          </button>
        </section>

      </div>

      {/* RIGHT COLUMN */}
      <div className="w-full lg:w-1/3 space-y-8">
        
        {/* PUBLISH CARD */}
        <div className="bg-[#111111] border border-[#2a2a2a] p-6 shadow-xl sticky top-6 z-20">
          <div className="flex items-center justify-between mb-8">
            <span className="font-body text-[#888888] text-[12px] uppercase tracking-wide">Status</span>
            <div className="flex items-center gap-3">
              <span className={`text-[11px] font-bold uppercase tracking-widest ${status === 'draft' ? 'text-[#888888]' : 'text-[#555555]'}`}>Draft</span>
              <button 
                type="button"
                onClick={() => setStatus(status === 'published' ? 'draft' : 'published')}
                className={`w-12 h-6 rounded-full relative transition-colors ${status === 'published' ? 'bg-[#8b0000]' : 'bg-[#2a2a2a]'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${status === 'published' ? 'translate-x-7' : 'translate-x-1'}`}></div>
              </button>
              <span className={`text-[11px] font-bold uppercase tracking-widest ${status === 'published' ? 'text-[#8b0000]' : 'text-[#555555]'}`}>Published</span>
            </div>
          </div>

          <div className="space-y-3">
            <button 
              onClick={() => handleSubmit("draft")}
              disabled={loading}
              className="w-full border border-[#2a2a2a] text-[#888888] hover:text-[#e8e8e8] hover:border-[#888888] font-body text-[12px] uppercase tracking-[0.2em] font-bold py-3 transition-colors disabled:opacity-50 flex justify-center items-center h-12"
            >
              SAVE DRAFT
            </button>
            <button 
              onClick={() => handleSubmit("published")}
              disabled={loading}
              className="w-full bg-[#8b0000] hover:bg-[#a00000] text-white font-body text-[12px] uppercase tracking-[0.2em] font-bold py-3 transition-colors shadow-[0_0_15px_rgba(139,0,0,0.3)] disabled:opacity-50 flex justify-center items-center h-12"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : "PUBLISH CASE"}
            </button>
          </div>
        </div>

        {/* CASE DETAILS CARD */}
        <div className="bg-[#111111] border border-[#2a2a2a] p-6 shadow-xl relative z-10">
          <h3 className="font-body text-[#8b0000] text-sm uppercase tracking-[0.2em] font-bold mb-6">Details</h3>
          
          <div className="space-y-5">
            <div>
              <label className="block font-body text-[#888888] text-[12px] uppercase tracking-wide mb-2">Killer Name</label>
              <input 
                type="text" 
                value={killerName}
                onChange={(e) => setKillerName(e.target.value)}
                placeholder="e.g., John Doe"
                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-[#e8e8e8] placeholder:text-[#555555] focus:outline-none focus:border-[#8b0000] px-3 py-2 font-mono text-sm transition-colors"
              />
            </div>
            
            <div>
              <label className="block font-body text-[#888888] text-[12px] uppercase tracking-wide mb-2">Motive Category</label>
              <select 
                value={motiveCategory}
                onChange={(e) => setMotiveCategory(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-[#e8e8e8] focus:outline-none focus:border-[#8b0000] px-3 py-2 font-body text-sm transition-colors cursor-pointer"
              >
                <option value="unknown">Unknown</option>
                <option value="power">Power</option>
                <option value="greed">Greed</option>
                <option value="rage">Rage</option>
                <option value="ideology">Ideology</option>
                <option value="psychosis">Psychosis</option>
              </select>
            </div>

            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block font-body text-[#888888] text-[12px] uppercase tracking-wide mb-2">Year</label>
                <input 
                  type="number" 
                  value={yearOfCrime}
                  onChange={(e) => setYearOfCrime(e.target.value)}
                  placeholder="YYYY"
                  className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-[#e8e8e8] placeholder:text-[#555555] focus:outline-none focus:border-[#8b0000] px-3 py-2 font-mono text-sm transition-colors"
                />
              </div>
              <div className="w-1/2">
                <label className="block font-body text-[#888888] text-[12px] uppercase tracking-wide mb-2">Region</label>
                <input 
                  type="text" 
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="Location"
                  className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-[#e8e8e8] placeholder:text-[#555555] focus:outline-none focus:border-[#8b0000] px-3 py-2 font-mono text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block font-body text-[#888888] text-[12px] uppercase tracking-wide mb-2">Tags</label>
              <div className="bg-[#0a0a0a] border border-[#2a2a2a] focus-within:border-[#8b0000] p-2 flex flex-wrap gap-2 transition-colors min-h-[42px]">
                {tags.map(tag => (
                  <span key={tag} className="bg-[#1a1a1a] border border-[#2a2a2a] text-[#888888] text-[11px] uppercase tracking-wider px-2 py-1 flex items-center gap-2">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-[#8b0000] transition-colors">×</button>
                  </span>
                ))}
                <input 
                  type="text" 
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Type and press enter..."
                  className="flex-1 bg-transparent text-[#e8e8e8] placeholder:text-[#555555] focus:outline-none font-body text-xs min-w-[120px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* COVER IMAGE CARD */}
        <div className="bg-[#111111] border border-[#2a2a2a] p-6 shadow-xl relative z-10">
          <h3 className="font-body text-[#8b0000] text-sm uppercase tracking-[0.2em] font-bold mb-6">Cover Image</h3>
          
          <div className="space-y-4">
            <input 
              type="text" 
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-[#e8e8e8] placeholder:text-[#555555] focus:outline-none focus:border-[#8b0000] px-3 py-2 font-mono text-sm transition-colors"
            />
            
            <div className="w-full h-40 border border-[#2a2a2a] bg-[#0a0a0a] overflow-hidden flex items-center justify-center relative">
              {coverImage ? (
                <Image src={coverImage} alt="Cover Preview" fill unoptimized className="object-cover opacity-80" onError={(e) => (e.currentTarget.style.display = 'none')} />
              ) : (
                <div className="text-[#2a2a2a] flex flex-col items-center">
                  <svg className="w-10 h-10 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <span className="font-body text-[10px] uppercase tracking-widest text-[#555555]">No Image</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

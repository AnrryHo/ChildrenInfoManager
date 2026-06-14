"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "xiaoya-children-v1";

const defaultChildren = [
  {
    id: "1",
    name: "林一诺",
    gender: "女",
    birthday: "2018-06-21",
    blood: "A型",
    school: "春田实验小学",
    guardian: "林女士",
    phone: "138 0000 1286",
    note: "喜欢画画和自然观察",
    image: "/assets/note-nature.jpg",
  },
  {
    id: "2",
    name: "陈嘉树",
    gender: "男",
    birthday: "2016-11-08",
    blood: "O型",
    school: "育才外国语学校",
    guardian: "陈先生",
    phone: "139 0000 5632",
    note: "热爱足球和科学实验",
    image: "/assets/note-football-science.jpg",
  },
  {
    id: "3",
    name: "周可心",
    gender: "女",
    birthday: "2020-03-17",
    blood: "B型",
    school: "彩虹幼儿园",
    guardian: "周女士",
    phone: "136 0000 9018",
    note: "对芒果轻微过敏",
    image: "/assets/note-mango-allergy.jpg",
  },
];

const emptyForm = {
  id: "",
  name: "",
  gender: "男",
  birthday: "",
  blood: "未知",
  school: "",
  guardian: "",
  phone: "",
  note: "",
};

const noteImages = {
  nature: "/assets/note-nature.jpg",
  science: "/assets/note-football-science.jpg",
  health: "/assets/note-mango-allergy-marked.jpg",
  growth: "/assets/note-healthy-growth.jpg",
};

const avatarColors = [
  "var(--green-soft)",
  "var(--orange-soft)",
  "var(--blue-soft)",
  "var(--pink-soft)",
];

function normalizeImagePath(path) {
  if (!path) return "";
  return path.startsWith("/") ? path : `/${path}`;
}

function getNoteImage(item) {
  if (item.name === "稳稳") return noteImages.growth;
  if (item.name === "周可心") return noteImages.health;
  if (item.image) return normalizeImagePath(item.image);

  const note = item.note || "";
  if (/过敏|健康|饮食|食物|药|医院|芒果/.test(note)) return noteImages.health;
  if (/足球|篮球|运动|科学|实验|天文|机器人/.test(note)) return noteImages.science;
  if (/画|自然|植物|动物|阅读|音乐|手工/.test(note)) return noteImages.nature;

  const choices = Object.values(noteImages);
  const seed = [...String(item.id || item.name)].reduce(
    (sum, character) => sum + character.charCodeAt(0),
    0,
  );
  return choices[seed % choices.length];
}

function calculateAge(dateString) {
  const birthday = new Date(`${dateString}T00:00:00`);
  const today = new Date();
  let age = today.getFullYear() - birthday.getFullYear();
  const monthDifference = today.getMonth() - birthday.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthday.getDate())
  ) {
    age -= 1;
  }

  return Math.max(0, age);
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(`${dateString}T00:00:00`));
}

export default function Home() {
  const [children, setChildren] = useState(defaultChildren);
  const [keyword, setKeyword] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [todayText, setTodayText] = useState("轻松整理每个孩子的成长档案");
  const [toast, setToast] = useState("");
  const nameInputRef = useRef(null);

  useEffect(() => {
    try {
      const savedChildren = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (Array.isArray(savedChildren)) setChildren(savedChildren);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }

    const now = new Date();
    setTodayText(
      `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 · 轻松整理每个孩子的成长档案`,
    );
  }, []);

  useEffect(() => {
    if (!isModalOpen) return undefined;

    nameInputRef.current?.focus();
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsModalOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isModalOpen]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(""), 1800);
    return () => clearTimeout(timer);
  }, [toast]);

  const filteredChildren = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    return children.filter((item) => {
      const matchesKeyword =
        item.name.toLowerCase().includes(normalizedKeyword) ||
        (item.school || "").toLowerCase().includes(normalizedKeyword);
      return matchesKeyword && (genderFilter === "all" || item.gender === genderFilter);
    });
  }, [children, genderFilter, keyword]);

  const currentMonth = new Date().getMonth() + 1;
  const stats = {
    total: children.length,
    boys: children.filter((item) => item.gender === "男").length,
    girls: children.filter((item) => item.gender === "女").length,
    birthdays: children.filter(
      (item) => Number(item.birthday.slice(5, 7)) === currentMonth,
    ).length,
  };

  function persist(nextChildren) {
    setChildren(nextChildren);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextChildren));
  }

  function openModal(item = null) {
    setFormData(item ? { ...emptyForm, ...item } : emptyForm);
    setIsModalOpen(true);
  }

  function updateField(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function submitForm(event) {
    event.preventDefault();
    const id = formData.id || Date.now().toString();
    const previous = children.find((item) => item.id === formData.id);
    const nextItem = {
      ...formData,
      id,
      name: formData.name.trim(),
      school: formData.school.trim(),
      guardian: formData.guardian.trim(),
      phone: formData.phone.trim(),
      note: formData.note.trim(),
    };

    if (previous?.note === nextItem.note && previous.image) {
      nextItem.image = previous.image;
    } else {
      delete nextItem.image;
    }

    const nextChildren = formData.id
      ? children.map((item) => (item.id === formData.id ? nextItem : item))
      : [nextItem, ...children];

    persist(nextChildren);
    setIsModalOpen(false);
    setToast(formData.id ? "档案已更新" : "档案已添加");
  }

  function deleteChild(item) {
    if (!window.confirm(`确定删除“${item.name}”的档案吗？`)) return;
    persist(children.filter((child) => child.id !== item.id));
    setToast("档案已删除");
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">芽</div>
          <span>小芽成长册</span>
        </div>
        <nav className="nav">
          <a className="nav-item active" href="#">
            <span className="nav-icon">⌂</span>信息总览
          </a>
          <a className="nav-item" href="#children">
            <span className="nav-icon">◉</span>孩子档案
          </a>
          <a className="nav-item" href="#children">
            <span className="nav-icon">◇</span>健康记录
          </a>
          <a className="nav-item" href="#children">
            <span className="nav-icon">✓</span>成长事件
          </a>
        </nav>
        <div className="side-note">
          <strong>认真记录每一步</strong>
          <p>孩子的成长很快，把重要的信息和珍贵的小事都留在这里。</p>
        </div>
      </aside>

      <main>
        <header className="topbar">
          <div>
            <p className="eyebrow">CHILDREN PROFILE</p>
            <h1>孩子信息管理</h1>
            <p className="subtitle">{todayText}</p>
          </div>
          <button className="primary-btn" type="button" onClick={() => openModal()}>
            <span>＋</span><span>新增宝贝信息</span>
          </button>
        </header>

        <section className="stats">
          <StatCard label="档案总数" value={stats.total} hint="已录入的孩子信息" bubble="var(--green-soft)" />
          <StatCard label="男孩" value={stats.boys} hint="阳光成长中" bubble="var(--orange-soft)" />
          <StatCard label="女孩" value={stats.girls} hint="快乐成长中" bubble="var(--pink-soft)" />
          <StatCard label="本月生日" value={stats.birthdays} hint="记得准备惊喜" bubble="var(--blue-soft)" />
        </section>

        <section className="panel" id="children">
          <div className="toolbar">
            <div className="toolbar-title">
              <h2>孩子档案</h2>
              <span>查看并维护基础信息</span>
            </div>
            <div className="filters">
              <label className="search">
                <span>⌕</span>
                <input
                  type="search"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="搜索姓名或学校"
                />
              </label>
              <select
                className="filter-select"
                value={genderFilter}
                onChange={(event) => setGenderFilter(event.target.value)}
                aria-label="按性别筛选"
              >
                <option value="all">全部</option>
                <option value="男">男孩</option>
                <option value="女">女孩</option>
              </select>
            </div>
          </div>

          <div className="children-grid">
            {filteredChildren.length ? (
              filteredChildren.map((item, index) => (
                <ChildCard
                  key={item.id}
                  item={item}
                  color={avatarColors[index % avatarColors.length]}
                  onEdit={() => openModal(item)}
                  onDelete={() => deleteChild(item)}
                />
              ))
            ) : (
              <div className="empty">
                <div className="empty-icon">◇</div>
                <strong>没有找到匹配的档案</strong>
                <p>换个关键词试试，或新增一位孩子。</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {isModalOpen && (
        <div
          className="modal show"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modalTitle"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsModalOpen(false);
          }}
        >
          <div className="modal-card">
            <div className="modal-head">
              <h2 id="modalTitle">{formData.id ? "编辑孩子信息" : "新增宝贝信息"}</h2>
              <button
                className="close-btn"
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="关闭"
              >
                ×
              </button>
            </div>
            <form onSubmit={submitForm}>
              <div className="form-grid">
                <Field label="姓名 *">
                  <input ref={nameInputRef} name="name" required maxLength={20} value={formData.name} onChange={updateField} placeholder="请输入姓名" />
                </Field>
                <Field label="性别 *">
                  <select name="gender" required value={formData.gender} onChange={updateField}>
                    <option value="男">男孩</option>
                    <option value="女">女孩</option>
                  </select>
                </Field>
                <Field label="出生日期 *">
                  <input name="birthday" type="date" required value={formData.birthday} onChange={updateField} />
                </Field>
                <Field label="血型">
                  <select name="blood" value={formData.blood} onChange={updateField}>
                    <option value="未知">未知</option>
                    <option>A型</option><option>B型</option><option>AB型</option><option>O型</option>
                  </select>
                </Field>
                <Field label="学校 / 幼儿园" full>
                  <input name="school" maxLength={40} value={formData.school} onChange={updateField} placeholder="例如：阳光实验小学" />
                </Field>
                <Field label="监护人">
                  <input name="guardian" maxLength={20} value={formData.guardian} onChange={updateField} placeholder="监护人姓名" />
                </Field>
                <Field label="联系电话">
                  <input name="phone" type="tel" maxLength={20} value={formData.phone} onChange={updateField} placeholder="手机号码" />
                </Field>
                <Field label="备注" full>
                  <textarea name="note" maxLength={100} value={formData.note} onChange={updateField} placeholder="过敏史、兴趣爱好或其他重要信息" />
                </Field>
              </div>
              <div className="modal-foot">
                <button className="ghost-btn" type="button" onClick={() => setIsModalOpen(false)}>取消</button>
                <button className="primary-btn" type="submit">保存档案</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={`toast${toast ? " show" : ""}`} aria-live="polite">{toast}</div>
    </div>
  );
}

function StatCard({ label, value, hint, bubble }) {
  return (
    <article className="stat-card" style={{ "--bubble": bubble }}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-hint">{hint}</div>
    </article>
  );
}

function ChildCard({ item, color, onEdit, onDelete }) {
  return (
    <article className="child-card">
      <div className="note-visual">
        <Image src={getNoteImage(item)} alt={`${item.name}的备注配图`} fill sizes="(max-width: 760px) 100vw, (max-width: 1050px) 50vw, 33vw" />
        <span className="visual-label">备注灵感图</span>
      </div>
      <div className="card-head">
        <div className="avatar" style={{ "--avatar-bg": color }}>{item.name.slice(-1)}</div>
        <div>
          <h3 className="child-name">{item.name}</h3>
          <div className="child-meta">{item.gender === "男" ? "男孩" : "女孩"} · {calculateAge(item.birthday)} 岁</div>
        </div>
        <div className="card-actions">
          <button className="icon-btn" type="button" onClick={onEdit} title="编辑">✎</button>
          <button className="icon-btn danger" type="button" onClick={onDelete} title="删除">×</button>
        </div>
      </div>
      <div className="details">
        <Detail label="出生日期" value={formatDate(item.birthday)} />
        <Detail label="血型" value={item.blood || "未知"} />
        <Detail label="学校" value={item.school || "暂未填写"} />
        <Detail label="监护人" value={item.guardian || "暂未填写"} />
      </div>
      <div className="tag">{item.note || "健康快乐成长"}</div>
    </article>
  );
}

function Detail({ label, value }) {
  return <div className="detail"><span>{label}</span><strong>{value}</strong></div>;
}

function Field({ label, full = false, children }) {
  return <label className={`field${full ? " full" : ""}`}><span>{label}</span>{children}</label>;
}

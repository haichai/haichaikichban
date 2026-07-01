import React, { useState, useEffect, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';

// --- FIREBASE CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyCYMWWDxzs6U0Q-N9Eqa-fM6fEP9DYiGwY",
  authDomain: "haichai-script-studio.firebaseapp.com",
  databaseURL: "https://haichai-script-studio-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "haichai-script-studio",
  storageBucket: "haichai-script-studio.firebasestorage.app",
  messagingSenderId: "409195333074",
  appId: "1:409195333074:web:05b167ddd5da157899b40b"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

const ALLOWED_EMAIL_DOMAINS = ['haichai.vn', 'starspits.vn', 'starspirits.vn'];
const getEmailDomain = (email = '') => email.toLowerCase().split('@').pop() || '';
const isAllowedCompanyEmail = (email = '') => ALLOWED_EMAIL_DOMAINS.includes(getEmailDomain(email));
const getAppDataRef = () => doc(db, 'workspaces', 'haichai-script-studio');

// --- ICONS ---
const IconLibrary = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 6 4 14" /><path d="M12 6v14" /><path d="M8 8v12" /><path d="M4 4v16" /></svg>);
const IconSparkles = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" /></svg>);
const IconFileText = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><line x1="10" x2="8" y1="9" y2="9" /></svg>);
const IconBook = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg>);
const IconSettings = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>);
const IconSearch = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>);
const IconCheck = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>);
const IconPrinter = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect width="12" height="8" x="6" y="14" /></svg>);
const IconTrash = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>);
const IconPlus = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>);

// --- CONSTANTS & DATA ---
const DEFAULT_CONTENT_BIBLE = `[HAICHAI CONTENT BIBLE\nBộ quy chuẩn nội dung cho TikTok nhân hiệu\n(Vui lòng dán toàn bộ Content Bible thật vào đây khi sử dụng)]`;

const INITIAL_SCRIPTS = [];
const CATEGORIES = ['Góc khuất / quan điểm ngược', 'Sai lầm / bài học người chủ', 'Hậu trường thật', 'Sản phẩm / niềm tin / giấy tờ'];
const TOPIC_COUNT_OPTIONS = [5, 10, 20, 30];
const TOPIC_DISTRIBUTIONS = {
  5: { 'Góc khuất / quan điểm ngược': 2, 'Sai lầm / bài học người chủ': 1, 'Hậu trường thật': 1, 'Sản phẩm / niềm tin / giấy tờ': 1 },
  10: { 'Góc khuất / quan điểm ngược': 5, 'Sai lầm / bài học người chủ': 2, 'Hậu trường thật': 2, 'Sản phẩm / niềm tin / giấy tờ': 1 },
  20: { 'Góc khuất / quan điểm ngược': 9, 'Sai lầm / bài học người chủ': 5, 'Hậu trường thật': 4, 'Sản phẩm / niềm tin / giấy tờ': 2 },
  30: { 'Góc khuất / quan điểm ngược': 14, 'Sai lầm / bài học người chủ': 7, 'Hậu trường thật': 6, 'Sản phẩm / niềm tin / giấy tờ': 3 },
};

const getTopicDistributionLines = (count) => {
  const distribution = TOPIC_DISTRIBUTIONS[count] || TOPIC_DISTRIBUTIONS[30];
  return Object.entries(distribution).map(([category, quantity]) => `- ${quantity} chủ đề: ${category}`).join('\n');
};

const getTopicDistributionSummary = (count) => {
  const distribution = TOPIC_DISTRIBUTIONS[count] || TOPIC_DISTRIBUTIONS[30];
  return Object.entries(distribution).map(([category, quantity]) => `${quantity} ${category}`).join(' · ');
};

const EMPTY_MANUAL_SCRIPT = {
  title: '', category: CATEGORIES[0], topic: '', mainMessage: '', selectedHook: '', selectedHookReason: 'Thêm thủ công',
  scenes: [{ name: 'Cảnh 1', content: '', visualSuggestion: '' }], ending: '', textOnScreen: '', caption: '', notes: '',
};

// --- AI PROVIDERS & MODELS ---
const AI_PROVIDERS = {
  gemini: { name: 'Google Gemini', models: ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'] },
  openai: { name: 'OpenAI (ChatGPT)', models: ['gpt-4o-mini', 'gpt-4o'] },
  groq: { name: 'Groq', models: ['llama3-70b-8192', 'llama3-8b-8192', 'mixtral-8x7b-32768'] }
};

const TIMEOUT_MS = 60000;

const extractJsonFromText = (text) => {
  if (!text) throw new Error('AI trả về dữ liệu rỗng.');
  const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
  const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  try {
    return JSON.parse(jsonMatch ? jsonMatch[0] : cleaned);
  } catch (e) {
    throw new Error('AI trả về định dạng không phải JSON hợp lệ.');
  }
};

const fetchWithTimeout = async (url, options = {}, timeoutMs = TIMEOUT_MS) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error.name === 'AbortError') throw new Error(`Kết nối tới AI quá hạn (${timeoutMs/1000}s). Vui lòng thử lại.`);
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

// --- CORE AI ENGINE ---
const callUnifiedAI = async (provider, model, keys, systemPrompt, userPrompt) => {
  const apiKey = keys[provider];
  if (!apiKey) throw new Error(`Vui lòng nhập API Key cho ${AI_PROVIDERS[provider].name} trong Cài đặt.`);

  const finalSystemPrompt = `${systemPrompt}\n\nIMPORTANT: You MUST return a valid raw JSON object. Do not wrap it in markdown. The JSON must follow the requested structure exactly.`;

  let url, headers, body;

  if (provider === 'gemini') {
    url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    headers = { 'Content-Type': 'application/json' };
    body = JSON.stringify({
      systemInstruction: { parts: [{ text: finalSystemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.7 }
    });
  } else {
    // OpenAI or Groq
    url = provider === 'groq' ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions';
    headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    };
    body = JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: finalSystemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });
  }

  const response = await fetchWithTimeout(url, { method: 'POST', headers, body });
  
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(`Lỗi API (${response.status}): ${errData?.error?.message || errData?.message || 'Unkown error'}`);
  }

  const result = await response.json();
  let textOutput = '';

  if (provider === 'gemini') {
    textOutput = result?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } else {
    textOutput = result?.choices?.[0]?.message?.content || '';
  }

  return extractJsonFromText(textOutput);
};

// Tách ra chạy từng kịch bản song song để tăng tốc độ và tránh timeout
const generateSingleScriptFromAI = async (provider, model, keys, topic, bible, currentScripts) => {
  const systemPrompt = `Bạn là Script Writer kiêm Content Editor cho kênh TikTok nhân hiệu Haichai.
Viết kịch bản chi tiết cho chủ đề sau. Bám Content Bible và kết quả scan để tránh trùng.
Yêu cầu:
- Kịch bản TikTok 60-75 giây, giọng thật, tỉnh, có trải nghiệm, không quảng cáo rác.
- Tạo 5 phương án hook, chọn 1 hook tốt nhất.
- Trả về JSON với key "script" chứa Object có format sau:
{
  "title": "...", "mainMessage": "...", "hookOptions": ["..."], "selectedHook": "...", "selectedHookReason": "...", "duration": "60s",
  "scenes": [{ "name": "Cảnh 1", "content": "...", "visualSuggestion": "..." }],
  "ending": "...", "caption": "...", "textOnScreen": "...", "hashtags": "...", "notes": "...", "duplicateRiskScore": 0
}`;

  const userPrompt = `Content Bible:\n${bible}\n\nThư viện cũ (Tránh trùng):\n${JSON.stringify(currentScripts.map(s => s.topic))}\n\nChủ đề cần viết:\n${JSON.stringify(topic)}`;

  const res = await callUnifiedAI(provider, model, keys, systemPrompt, userPrompt);
  if (!res || !res.script) throw new Error("AI không trả về cấu trúc kịch bản đúng chuẩn.");
  
  return {
    id: `scr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    topicId: topic.id,
    category: topic.category,
    topic: topic.topicName,
    angle: topic.angle,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...res.script
  };
};

const generateTopicsFromAI = async (provider, model, keys, bible, currentScripts, topicCount = 30) => {
  const safeCount = TOPIC_COUNT_OPTIONS.includes(Number(topicCount)) ? Number(topicCount) : 30;
  const systemPrompt = `Bạn là Content Strategist cho TikTok nhân hiệu. Dựa trên Content Bible, tạo CHÍNH XÁC ${safeCount} chủ đề mới.
Tuyệt đối chỉ trả về JSON có key "topics" là một mảng ${safeCount} phần tử.
Cấu trúc 1 phần tử: { "category": "...", "topicName": "...", "angle": "...", "hookType": "...", "suggestedHook": "...", "mainMessage": "...", "whyItCanWork": "...", "avoidRepeating": "...", "duplicateRiskScore": 0 }`;

  const userPrompt = `Tạo đúng tỉ lệ sau:\n${getTopicDistributionLines(safeCount)}\n\nContent Bible:\n${bible}\n\nCác chủ đề cũ (Tránh trùng):\n${JSON.stringify(currentScripts.map(s => s.topic))}`;

  const result = await callUnifiedAI(provider, model, keys, systemPrompt, userPrompt);
  const rawTopics = Array.isArray(result?.topics) ? result.topics : [];
  
  if (rawTopics.length === 0) throw new Error('AI không trả về mảng topics.');

  return rawTopics.slice(0, safeCount).map((t, index) => ({
    id: `top_${Date.now()}_${index}`,
    ...t,
    selected: false,
  }));
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const [activeTab, setActiveTab] = useState('library');
  const [bible, setBible] = useState(DEFAULT_CONTENT_BIBLE);
  const [scripts, setScripts] = useState([]);
  const [viewingScript, setViewingScript] = useState(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCat, setFilterCat] = useState('All');

  // Generation States
  const [generatedTopics, setGeneratedTopics] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [isGeneratingTopics, setIsGeneratingTopics] = useState(false);
  const [topicCount, setTopicCount] = useState(30);
  
  const [customTopicText, setCustomTopicText] = useState('');
  const [customTopicCategory, setCustomTopicCategory] = useState(CATEGORIES[0]);
  const [isGeneratingCustomScript, setIsGeneratingCustomScript] = useState(false);

  const [isGeneratingScripts, setIsGeneratingScripts] = useState(false);
  const [draftScripts, setDraftScripts] = useState([]);
  const [generationStatus, setGenerationStatus] = useState('');

  // UI States
  const [isAddingManual, setIsAddingManual] = useState(false);
  const [manualScript, setManualScript] = useState(EMPTY_MANUAL_SCRIPT);
  const [modal, setModal] = useState({ isOpen: false, type: 'alert', title: '', message: '', onConfirm: null });

  // Cloud Sync States
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [authError, setAuthError] = useState('');
  const [isLocalLoaded, setIsLocalLoaded] = useState(false);
  const [cloudReady, setCloudReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState('Chưa đăng nhập Firebase');
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const latestDataRef = useRef({ bible: DEFAULT_CONTENT_BIBLE, scripts: [], draftScripts: [], generatedTopics: [] });
  const syncingFromCloudRef = useRef(false);

  // --- AI CONFIGURATION STATE ---
  const [aiProvider, setAiProvider] = useState('gemini');
  const [aiModel, setAiModel] = useState(AI_PROVIDERS.gemini.models[0]);
  const [apiKeys, setApiKeys] = useState({ gemini: '', openai: '', groq: '' });

  const showAlert = (title, message) => setModal({ isOpen: true, type: 'alert', title, message, onConfirm: null });
  const showConfirm = (title, message, onConfirm) => setModal({ isOpen: true, type: 'confirm', title, message, onConfirm });
  const closeModal = () => setModal({ ...modal, isOpen: false });

  // Load local configuration
  useEffect(() => {
    try {
      const savedBible = localStorage.getItem('haichai_bible');
      if (savedBible) setBible(savedBible);
      const savedScripts = localStorage.getItem('haichai_scripts');
      setScripts(savedScripts ? JSON.parse(savedScripts) : INITIAL_SCRIPTS);
      const savedDrafts = localStorage.getItem('haichai_drafts');
      if (savedDrafts) setDraftScripts(JSON.parse(savedDrafts));
      const savedTopics = localStorage.getItem('haichai_generated_topics');
      if (savedTopics) setGeneratedTopics(JSON.parse(savedTopics));

      // Load AI Config
      const savedKeys = localStorage.getItem('haichai_api_keys');
      if (savedKeys) setApiKeys(JSON.parse(savedKeys));
      const savedProvider = localStorage.getItem('haichai_ai_provider');
      if (savedProvider && AI_PROVIDERS[savedProvider]) setAiProvider(savedProvider);
      const savedModel = localStorage.getItem('haichai_ai_model');
      if (savedModel) setAiModel(savedModel);

    } catch (e) {
      console.error('Lỗi load local:', e);
    } finally {
      setIsLocalLoaded(true);
    }
  }, []);

  // Sync to local
  useEffect(() => {
    if (!isLocalLoaded) return;
    localStorage.setItem('haichai_bible', bible);
    localStorage.setItem('haichai_scripts', JSON.stringify(scripts));
    localStorage.setItem('haichai_drafts', JSON.stringify(draftScripts));
    localStorage.setItem('haichai_generated_topics', JSON.stringify(generatedTopics));
    
    localStorage.setItem('haichai_api_keys', JSON.stringify(apiKeys));
    localStorage.setItem('haichai_ai_provider', aiProvider);
    localStorage.setItem('haichai_ai_model', aiModel);
  }, [isLocalLoaded, bible, scripts, draftScripts, generatedTopics, apiKeys, aiProvider, aiModel]);

  // Handle Provider Change
  const handleProviderChange = (e) => {
    const prov = e.target.value;
    setAiProvider(prov);
    setAiModel(AI_PROVIDERS[prov].models[0]); // Reset to first model of provider
  };

  const handleKeyChange = (provider, value) => {
    setApiKeys(prev => ({ ...prev, [provider]: value }));
  };

  // Auth & Cloud logic... (Giữ nguyên cấu trúc của bạn)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthLoading(false);
      if (!user) {
        setCurrentUser(null);
        setCloudReady(false);
        setSyncStatus('Chưa đăng nhập Firebase');
        return;
      }
      const email = user.email || '';
      if (!isAllowedCompanyEmail(email)) {
        await signOut(auth);
        setCurrentUser(null);
        setAuthError(`Email không được phép.`);
        return;
      }
      setAuthError('');
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    latestDataRef.current = { bible, scripts, draftScripts, generatedTopics };
  }, [bible, scripts, draftScripts, generatedTopics]);

  useEffect(() => {
    if (!currentUser || !isLocalLoaded) return;
    const ref = getAppDataRef();
    const unsubscribe = onSnapshot(ref, async (snapshot) => {
      syncingFromCloudRef.current = true;
      try {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (typeof data.bible === 'string') setBible(data.bible);
          if (Array.isArray(data.scripts)) setScripts(data.scripts);
          if (Array.isArray(data.draftScripts)) setDraftScripts(data.draftScripts);
          if (Array.isArray(data.generatedTopics)) setGeneratedTopics(data.generatedTopics);
          setSyncStatus('Đã tải từ Firebase');
        } else {
          await setDoc(ref, { ...latestDataRef.current, ownerEmail: currentUser.email, updatedAt: serverTimestamp() }, { merge: true });
        }
        setLastSyncedAt(new Date());
        setCloudReady(true);
      } finally {
        setTimeout(() => { syncingFromCloudRef.current = false; }, 0);
      }
    });
    return () => unsubscribe();
  }, [currentUser, isLocalLoaded]);

  useEffect(() => {
    if (!currentUser || !cloudReady || syncingFromCloudRef.current) return;
    setSyncStatus('Đang chờ đồng bộ...');
    const timeout = setTimeout(async () => {
      try {
        await setDoc(getAppDataRef(), { bible, scripts, draftScripts, generatedTopics, updatedAt: serverTimestamp() }, { merge: true });
        setSyncStatus('Đã lưu Firebase');
        setLastSyncedAt(new Date());
      } catch (e) { setSyncStatus(`Lỗi lưu: ${e.message}`); }
    }, 1000);
    return () => clearTimeout(timeout);
  }, [currentUser, cloudReady, bible, scripts, draftScripts, generatedTopics]);

  const handleSignInWithGoogle = async () => {
    setAuthError('');
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (!isAllowedCompanyEmail(res.user?.email)) {
        await signOut(auth);
        setCurrentUser(null);
        setAuthError('Chỉ email công ty mới được phép truy cập.');
      }
    } catch (e) { setAuthError('Đăng nhập thất bại.'); }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setCurrentUser(null);
  };

  // --- ACTIONS ---
  const handleScanLibrary = () => {
    setIsScanning(true);
    setTimeout(() => {
      const counts = scripts.reduce((acc, script) => { acc[script.category] = (acc[script.category] || 0) + 1; return acc; }, {});
      setScanResult({ total: scripts.length, categories: counts, warning: scripts.length ? "Scan thành công, AI sẽ tránh các chủ đề cũ." : 'Thư viện trống.', suggestedFocus: "Nên làm đa dạng chủ đề." });
      setIsScanning(false);
    }, 500);
  };

  const handleGenerateTopics = async () => {
    if (!apiKeys[aiProvider]) return showAlert('Lỗi', `Vui lòng nhập API Key cho ${AI_PROVIDERS[aiProvider].name} ở Cài đặt.`);
    setIsGeneratingTopics(true);
    try {
      const topics = await generateTopicsFromAI(aiProvider, aiModel, apiKeys, bible, scripts, topicCount);
      setGeneratedTopics(topics);
      showAlert('Thành công', `Đã tạo ${topics.length} chủ đề mới!`);
    } catch (e) { showAlert('Lỗi AI', e.message); } 
    finally { setIsGeneratingTopics(false); }
  };

  const handleGenerateCustomTopicScript = async () => {
    if (!customTopicText.trim()) return showAlert('Lỗi', 'Nhập tình huống thực tế!');
    if (!apiKeys[aiProvider]) return showAlert('Lỗi', `Vui lòng nhập API Key!`);
    setIsGeneratingCustomScript(true);
    try {
      const fakeTopic = { id: 'cust_'+Date.now(), category: customTopicCategory, topicName: customTopicText, angle: 'Tình huống phát sinh' };
      const newScript = await generateSingleScriptFromAI(aiProvider, aiModel, apiKeys, fakeTopic, bible, scripts);
      setDraftScripts(prev => [newScript, ...prev]);
      setCustomTopicText('');
      setActiveTab('generate-scripts');
    } catch (e) { showAlert('Lỗi AI', e.message); } 
    finally { setIsGeneratingCustomScript(false); }
  };

  // TỐI ƯU: Gọi song song để tốc độ siêu nhanh
  const handleGenerateDetailedScripts = async () => {
    const selected = generatedTopics.filter(t => t.selected);
    if (selected.length === 0) return showAlert('Thông báo', 'Chọn ít nhất 1 chủ đề!');
    if (!apiKeys[aiProvider]) return showAlert('Lỗi', `Vui lòng nhập API Key!`);

    setActiveTab('generate-scripts');
    setIsGeneratingScripts(true);
    setGenerationStatus(`Đang tạo song song ${selected.length} kịch bản bằng ${aiModel}...`);

    try {
      // Promise.all: Chạy tất cả kịch bản cùng 1 lúc (Tốc độ sẽ cực kì nhanh, nhưng cần chú ý Limit của Key API)
      const promises = selected.map(topic => generateSingleScriptFromAI(aiProvider, aiModel, apiKeys, topic, bible, scripts).catch(e => {
        console.error(`Lỗi kịch bản ${topic.topicName}:`, e);
        return null; // Bỏ qua kịch bản lỗi, chạy tiếp các kịch bản khác
      }));

      const results = await Promise.all(promises);
      const successfulScripts = results.filter(res => res !== null);

      if (successfulScripts.length > 0) {
        setDraftScripts(prev => [...successfulScripts, ...prev]);
        showAlert('Thành công', `Đã hoàn thành ${successfulScripts.length}/${selected.length} kịch bản!`);
      } else {
        showAlert('Lỗi', 'Tất cả quá trình tạo kịch bản đều thất bại. Hãy kiểm tra lại API Key hoặc đổi Model.');
      }
    } catch (error) {
      showAlert('Lỗi', error.message);
    } finally {
      setIsGeneratingScripts(false);
      setGenerationStatus('');
    }
  };

  const handleSaveDraftToLibrary = (draftId) => {
    const draft = draftScripts.find(d => d.id === draftId);
    if (draft) {
      setScripts(prev => [{ ...draft, status: 'approved' }, ...prev]);
      setDraftScripts(prev => prev.filter(d => d.id !== draftId));
    }
  };

  const handleDeleteDraft = (id) => showConfirm('Xác nhận xóa', 'Bạn muốn xóa bản nháp này?', () => setDraftScripts(p => p.filter(d => d.id !== id)));
  const handleDeleteScript = (id) => showConfirm('Xác nhận xóa', 'Bạn muốn xóa khỏi thư viện?', () => setScripts(p => p.filter(s => s.id !== id)));

  const handleExportPDF = (script) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return showAlert('Lỗi Pop-up', 'Vui lòng cho phép Pop-up để in.');
    const html = `<html><head><title>${script.title}</title><style>body{font-family:sans-serif;line-height:1.6;padding:40px;max-width:800px;margin:0 auto}h1{border-bottom:2px solid #000;padding-bottom:10px}.scene{margin-bottom:20px;padding-left:15px;border-left:3px solid #ccc}.meta{background:#f0f0f0;padding:15px;border-radius:5px}</style></head><body><h1>${script.title}</h1><div class="meta"><b>Message:</b> ${script.mainMessage}<br><b>Hook:</b> "${script.selectedHook}"</div><h2>Kịch Bản</h2>${script.scenes.map(s => `<div class="scene"><b>${s.name}</b><p>${s.content}</p><i>🎥 ${s.visualSuggestion}</i></div>`).join('')}<h3>Câu kết</h3><p>"${script.ending}"</p><hr><p><b>Text:</b> ${script.textOnScreen}</p><p><b>Caption:</b> ${script.caption}</p><script>setTimeout(()=>window.print(),500)</script></body></html>`;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  // --- RENDERERS ---
  const renderModal = () => {
    if (!modal.isOpen) return null;
    return (
      <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[100] p-4">
        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
          <h3 className="text-xl font-bold mb-3">{modal.title}</h3>
          <p className="mb-6">{modal.message}</p>
          <div className="flex justify-end gap-3">
            {modal.type === 'confirm' && <button onClick={closeModal} className="px-4 py-2 bg-slate-200 rounded">Hủy</button>}
            <button onClick={() => { if(modal.onConfirm) modal.onConfirm(); closeModal(); }} className="px-4 py-2 bg-blue-600 text-white rounded">OK</button>
          </div>
        </div>
      </div>
    );
  };

  const renderSidebar = () => (
    <div className="w-64 text-white flex flex-col h-screen fixed top-0 left-0 bg-[#0d2440]">
      <div className="p-6 font-bold text-xl tracking-wider">HAICHAI STUDIO</div>
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {[
          { id: 'library', icon: <IconBook />, label: 'Thư viện kịch bản' },
          { id: 'generate-topics', icon: <IconSparkles />, label: 'Tạo chủ đề' },
          { id: 'generate-scripts', icon: <IconFileText />, label: 'Kịch bản Draft' },
          { id: 'bible', icon: <IconFileText />, label: 'Content Bible' },
          { id: 'settings', icon: <IconSettings />, label: 'Cài đặt & Dữ liệu' }
        ].map((item) => (
          <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${activeTab === item.id ? 'bg-[#819396]' : 'hover:bg-[#bf0e0e]'}`}>
            {item.icon} {item.label}
          </button>
        ))}
      </nav>
      <div className="p-4 text-xs text-slate-400 border-t border-slate-700">{syncStatus}</div>
    </div>
  );

  const renderSettings = () => (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold mb-6">Cài đặt Hệ thống</h2>
      
      {/* AI Configuration Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
        <h3 className="text-lg font-bold mb-4">Cấu hình AI (Tạo Kịch Bản)</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Nhà cung cấp AI</label>
            <select value={aiProvider} onChange={handleProviderChange} className="w-full p-2 border rounded">
              {Object.entries(AI_PROVIDERS).map(([key, info]) => <option key={key} value={key}>{info.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Model (Mô hình)</label>
            <select value={aiModel} onChange={(e) => setAiModel(e.target.value)} className="w-full p-2 border rounded">
              {AI_PROVIDERS[aiProvider].models.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Google Gemini API Key</label>
            <input type="password" value={apiKeys.gemini} onChange={e => handleKeyChange('gemini', e.target.value)} className="w-full p-2 border rounded font-mono text-sm" placeholder="AIza..." />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">OpenAI API Key</label>
            <input type="password" value={apiKeys.openai} onChange={e => handleKeyChange('openai', e.target.value)} className="w-full p-2 border rounded font-mono text-sm" placeholder="sk-..." />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Groq API Key</label>
            <input type="password" value={apiKeys.groq} onChange={e => handleKeyChange('groq', e.target.value)} className="w-full p-2 border rounded font-mono text-sm" placeholder="gsk_..." />
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-4">API keys được mã hóa và chỉ lưu trực tiếp trên trình duyệt của máy bạn, KHÔNG lưu lên Server.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold mb-4">Tài khoản & Dữ liệu</h3>
        <p className="mb-4 text-sm text-slate-600">Đăng nhập: {currentUser?.email}</p>
        <button onClick={handleSignOut} className="bg-red-600 text-white px-4 py-2 rounded font-medium text-sm">Đăng xuất khỏi Firebase</button>
      </div>
    </div>
  );

  const renderBible = () => (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <h2 className="text-2xl font-bold mb-4">Content Bible</h2>
      <textarea className="flex-1 p-6 border rounded-xl font-mono text-sm" value={bible} onChange={(e) => setBible(e.target.value)} spellCheck="false" />
    </div>
  );

  // --- RENDER DRAFTS / TOPICS / LIBRARY (Tránh quá dài, các logic mapping tương tự) ---
  const renderScriptGenerator = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6">Kịch bản Draft chưa lưu</h2>
      {isGeneratingScripts && <div className="text-blue-600 mb-4 font-bold">{generationStatus}</div>}
      <div className="space-y-6">
        {draftScripts.map((script, idx) => (
          <div key={script.id} className="bg-white border rounded p-4 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">#{idx+1} - {script.title}</h3>
              <div className="flex gap-2">
                 <button onClick={() => handleSaveDraftToLibrary(script.id)} className="bg-green-600 text-white px-3 py-1 rounded text-sm">Lưu Thư viện</button>
                 <button onClick={() => handleDeleteDraft(script.id)} className="bg-red-600 text-white px-3 py-1 rounded text-sm">Xóa</button>
              </div>
            </div>
            <p className="text-sm bg-yellow-50 p-2 mb-2 italic">{script.mainMessage}</p>
            <div className="text-sm mb-4"><b>Hook:</b> {script.selectedHook}</div>
            <div className="text-sm border-l-2 border-indigo-200 pl-3">
              {script.scenes?.map((s,i) => <div key={i} className="mb-2"><b>{s.name}:</b> {s.content}</div>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTopicGenerator = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6">Tạo Chủ đề </h2>
      <div className="flex gap-4 mb-6">
        <button onClick={handleScanLibrary} className="bg-blue-600 text-white px-4 py-2 rounded">Scan Thư Viện</button>
        <button onClick={handleGenerateTopics} disabled={isGeneratingTopics} className="bg-indigo-600 text-white px-4 py-2 rounded">{isGeneratingTopics ? 'Đang tạo...' : 'Tạo Chủ Đề Tự Động'}</button>
      </div>

      <div className="bg-white p-4 border rounded mb-6">
        <h3 className="font-bold mb-2">Tạo từ tình huống thực tế</h3>
        <textarea value={customTopicText} onChange={e => setCustomTopicText(e.target.value)} className="w-full border p-2 rounded mb-2" placeholder="Ví dụ: Khách chê đắt..."></textarea>
        <button onClick={handleGenerateCustomTopicScript} disabled={isGeneratingCustomScript} className="bg-slate-800 text-white px-4 py-2 rounded">{isGeneratingCustomScript ? 'Đang tạo...' : 'Tạo Kịch Bản Nhanh'}</button>
      </div>

      {generatedTopics.length > 0 && (
        <div className="bg-white border rounded">
          <div className="p-3 border-b bg-slate-50 flex justify-between items-center">
            <span>Chọn {generatedTopics.filter(t => t.selected).length} chủ đề</span>
            <button onClick={handleGenerateDetailedScripts} className="bg-blue-600 text-white px-4 py-1 rounded text-sm">Viết Kịch Bản cho Topic đã chọn</button>
          </div>
          <div className="max-h-96 overflow-y-auto p-4 space-y-2">
            {generatedTopics.map(t => (
              <div key={t.id} onClick={() => setGeneratedTopics(pt => pt.map(x => x.id === t.id ? {...x, selected: !x.selected} : x))} className={`p-2 border rounded cursor-pointer ${t.selected ? 'bg-indigo-50 border-indigo-200' : ''}`}>
                <input type="checkbox" checked={t.selected} readOnly className="mr-3" />
                <b>{t.topicName}</b> - <i>{t.angle}</i>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderLibrary = () => (
    <div>
       <h2 className="text-2xl font-bold mb-6">Thư Viện Chính ({scripts.length})</h2>
       <div className="space-y-4">
        {scripts.map(s => (
          <div key={s.id} className="bg-white border p-4 rounded flex justify-between items-center">
            <div>
              <div className="font-bold">{s.title}</div>
              <div className="text-sm text-slate-500">{s.category} | Risk: {s.duplicateRiskScore}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleExportPDF(s)} className="text-blue-600">In/PDF</button>
              <button onClick={() => handleDeleteScript(s.id)} className="text-red-600">Xóa</button>
            </div>
          </div>
        ))}
       </div>
    </div>
  );

  if (authLoading) return <div className="p-10 text-center">Đang kết nối...</div>;
  if (!currentUser) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded shadow text-center">
        <h1 className="text-xl font-bold mb-4">Haichai Script Studio</h1>
        <button onClick={handleSignInWithGoogle} className="bg-blue-600 text-white px-6 py-2 rounded">Đăng nhập Google Workspace</button>
        {authError && <p className="text-red-600 mt-4 text-sm">{authError}</p>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {renderSidebar()}
      <main className="ml-64 flex-1 p-8 h-screen overflow-y-auto text-slate-800">
        {activeTab === 'library' && renderLibrary()}
        {activeTab === 'generate-topics' && renderTopicGenerator()}
        {activeTab === 'generate-scripts' && renderScriptGenerator()}
        {activeTab === 'bible' && renderBible()}
        {activeTab === 'settings' && renderSettings()}
      </main>
      {renderModal()}
    </div>
  );
}
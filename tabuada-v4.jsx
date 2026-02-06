import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// ============================================================
//  TABUADA QUEST — A Aventura Definitiva da Multiplicação
// ============================================================

const DEFAULT_META_ACERTOS = 200;
const MIN_META_ACERTOS = 20;
const MAX_META_ACERTOS = 500;

// ---- XP & Ranks ----
const RANKS = [
  { nome: 'Recruta', emoji: '🥉', xpMin: 0, cor: '#94a3b8' },
  { nome: 'Soldado', emoji: '🎖️', xpMin: 500, cor: '#60a5fa' },
  { nome: 'Capitão', emoji: '⚔️', xpMin: 2000, cor: '#34d399' },
  { nome: 'General', emoji: '🛡️', xpMin: 5000, cor: '#a78bfa' },
  { nome: 'Herói', emoji: '👑', xpMin: 10000, cor: '#fbbf24' },
  { nome: 'Lenda', emoji: '🌟', xpMin: 25000, cor: '#f472b6' },
  { nome: 'Mito', emoji: '🔱', xpMin: 50000, cor: '#ef4444' },
];

function getRank(xp) {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].xpMin) return { ...RANKS[i], index: i };
  }
  return { ...RANKS[0], index: 0 };
}

function getNextRank(xp) {
  const current = getRank(xp);
  if (current.index < RANKS.length - 1) return RANKS[current.index + 1];
  return null;
}

// ---- Conquistas ----
const CONQUISTAS = {
  primeiraLicao: { id: 'primeiraLicao', nome: 'Primeira Vitória', emoji: '🎓', desc: 'Complete sua primeira lição' },
  seq5: { id: 'seq5', nome: 'Esquentando', emoji: '🔥', desc: '5 acertos seguidos' },
  seq10: { id: 'seq10', nome: 'Em Chamas', emoji: '💥', desc: '10 acertos seguidos' },
  seq20: { id: 'seq20', nome: 'Imparável', emoji: '🚀', desc: '20 acertos seguidos' },
  seq50: { id: 'seq50', nome: 'Lendário', emoji: '🌈', desc: '50 acertos seguidos' },
  semErros: { id: 'semErros', nome: 'Perfeição', emoji: '💎', desc: 'Complete uma lição sem erros' },
  velocista: { id: 'velocista', nome: 'Velocista', emoji: '⚡', desc: 'Responda em menos de 2s' },
  relampago: { id: 'relampago', nome: 'Relâmpago', emoji: '⚡', desc: 'Responda em menos de 1s' },
  mestre6: { id: 'mestre6', nome: 'Mestre do 6', emoji: '6️⃣', desc: '50 acertos na tabuada do 6' },
  mestre7: { id: 'mestre7', nome: 'Mestre do 7', emoji: '7️⃣', desc: '50 acertos na tabuada do 7' },
  mestre8: { id: 'mestre8', nome: 'Mestre do 8', emoji: '8️⃣', desc: '50 acertos na tabuada do 8' },
  mestre9: { id: 'mestre9', nome: 'Mestre do 9', emoji: '9️⃣', desc: '50 acertos na tabuada do 9' },
  detective: { id: 'detective', nome: 'Detetive', emoji: '🔍', desc: 'Acerte 20 perguntas invertidas' },
  crazyMaster: { id: 'crazyMaster', nome: 'Mestre do Caos', emoji: '🌀', desc: 'Acerte 15+ no Crazy Time' },
  contador: { id: 'contador', nome: 'Contador de Histórias', emoji: '📚', desc: 'Complete 10 histórias' },
  bossSlayer: { id: 'bossSlayer', nome: 'Caça-Boss', emoji: '🐉', desc: 'Derrote um Boss' },
  meteorPro: { id: 'meteorPro', nome: 'Defensor Espacial', emoji: '☄️', desc: 'Destrua 20 meteoros' },
  memoryKing: { id: 'memoryKing', nome: 'Memória de Elefante', emoji: '🧠', desc: 'Vença o jogo da memória' },
  duelo10: { id: 'duelo10', nome: 'Duelista', emoji: '🤺', desc: 'Vença 10 duelos contra o tempo' },
  streaker3: { id: 'streaker3', nome: 'Dedicação', emoji: '📅', desc: '3 dias seguidos jogando' },
  collector: { id: 'collector', nome: 'Colecionador', emoji: '🏅', desc: 'Desbloqueie 10 conquistas' },
};

// ---- Níveis de dificuldade ----
const niveis = [
  { nome: 'Aquecimento', descricao: 'Ordem crescente', minAcertos: 0, tipo: 'normal' },
  { nome: 'Fácil', descricao: 'Multiplicadores 1-5', minAcertos: 40, tipo: 'normal' },
  { nome: 'Médio', descricao: 'Multiplicadores 3-7', minAcertos: 80, tipo: 'normal' },
  { nome: 'Difícil', descricao: 'Multiplicadores 6-10', minAcertos: 120, tipo: 'misto' },
  { nome: 'Expert', descricao: 'Descubra o fator!', minAcertos: 160, tipo: 'invertido' },
];

// ---- Histórias ----
const HISTORIAS = [
  { texto: "🦖 Um dinossauro tem {a} patas. Se {b} dinossauros estão brincando, quantas patas tem no total?", a: 4, bRange: [2, 9] },
  { texto: "🍕 Uma pizza tem {a} fatias. Se compramos {b} pizzas para a festa, quantas fatias teremos?", a: 8, bRange: [2, 6] },
  { texto: "🚗 Um carro tem {a} rodas. No estacionamento há {b} carros. Quantas rodas no total?", a: 4, bRange: [3, 9] },
  { texto: "🕷️ Uma aranha tem {a} patas. Se {b} aranhas estão na teia, quantas patas são?", a: 8, bRange: [2, 5] },
  { texto: "✋ Uma mão tem {a} dedos. Quantos dedos têm {b} mãos?", a: 5, bRange: [2, 10] },
  { texto: "🎁 Cada caixa tem {a} bombons. Ganhei {b} caixas. Quantos bombons tenho?", a: 6, bRange: [3, 8] },
  { texto: "⚽ Um time tem {a} jogadores. No campeonato há {b} times. Quantos jogadores no total?", a: 7, bRange: [2, 6] },
  { texto: "🌺 Cada vaso tem {a} flores. Na loja há {b} vasos. Quantas flores são?", a: 3, bRange: [4, 10] },
  { texto: "📚 Cada prateleira tem {a} livros. A estante tem {b} prateleiras. Quantos livros?", a: 9, bRange: [2, 7] },
  { texto: "🥚 Uma caixa tem {a} ovos. Compramos {b} caixas. Quantos ovos são?", a: 6, bRange: [2, 8] },
  { texto: "🎵 Cada grupo tem {a} músicos. No festival há {b} grupos. Quantos músicos tocam?", a: 5, bRange: [3, 9] },
  { texto: "🏠 Cada casa tem {a} janelas. Na rua há {b} casas. Quantas janelas no total?", a: 4, bRange: [5, 10] },
  { texto: "🦋 Cada borboleta tem {a} asas. No jardim há {b} borboletas. Quantas asas no total?", a: 4, bRange: [3, 9] },
  { texto: "🎂 Cada bolo tem {a} velas. Na festa há {b} bolos. Quantas velas são?", a: 7, bRange: [2, 8] },
  { texto: "🚌 Cada ônibus leva {a} alunos. A escola tem {b} ônibus. Quantos alunos viajam?", a: 9, bRange: [2, 6] },
];

// ---- Boss Battles ----
const BOSSES = [
  { nome: 'Dragão do Fogo', emoji: '🐉', vida: 10, cor: '#ef4444', frase: 'Resolva para me derrotar!' },
  { nome: 'Kraken das Profundezas', emoji: '🐙', vida: 12, cor: '#8b5cf6', frase: 'Meus tentáculos são rápidos!' },
  { nome: 'Fênix Dourada', emoji: '🦅', vida: 15, cor: '#f59e0b', frase: 'Eu renasço das cinzas!' },
  { nome: 'Golem de Pedra', emoji: '🗿', vida: 18, cor: '#6b7280', frase: 'Sou duro na queda!' },
  { nome: 'Serpente Cósmica', emoji: '🐍', vida: 20, cor: '#06b6d4', frase: 'O universo me obedece!' },
];

// ============================================================
//  SOUND ENGINE
// ============================================================
const useSound = () => {
  const audioContext = useRef(null);
  const getCtx = useCallback(() => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = audioContext.current;
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }, []);

  const playSound = useCallback((type) => {
    try {
      const ctx = getCtx();
      if (type === 'acerto') {
        const notes = [523.25, 659.25, 783.99];
        notes.forEach((freq, i) => {
          const o = ctx.createOscillator(); const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.07);
          g.gain.setValueAtTime(0.18, ctx.currentTime + i * 0.07);
          g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.07 + 0.2);
          o.start(ctx.currentTime + i * 0.07); o.stop(ctx.currentTime + i * 0.07 + 0.2);
        });
      } else if (type === 'erro') {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.setValueAtTime(200, ctx.currentTime);
        o.frequency.setValueAtTime(150, ctx.currentTime + 0.1);
        g.gain.setValueAtTime(0.18, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.15);
      } else if (type === 'conquista' || type === 'minigame' || type === 'levelup') {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, i) => {
          const o = ctx.createOscillator(); const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
          g.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.1);
          g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.3);
          o.start(ctx.currentTime + i * 0.1); o.stop(ctx.currentTime + i * 0.1 + 0.3);
        });
      } else if (type === 'boss') {
        [150, 200, 150, 120].forEach((freq, i) => {
          const o = ctx.createOscillator(); const g = ctx.createGain();
          o.type = 'sawtooth';
          o.connect(g); g.connect(ctx.destination);
          o.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
          g.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.15);
          g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.2);
          o.start(ctx.currentTime + i * 0.15); o.stop(ctx.currentTime + i * 0.15 + 0.2);
        });
      } else if (type === 'hit') {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.type = 'square';
        o.connect(g); g.connect(ctx.destination);
        o.frequency.setValueAtTime(400, ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);
        g.gain.setValueAtTime(0.12, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.15);
      } else if (type === 'powerup') {
        [400, 500, 600, 800].forEach((freq, i) => {
          const o = ctx.createOscillator(); const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.06);
          g.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.06);
          g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.06 + 0.15);
          o.start(ctx.currentTime + i * 0.06); o.stop(ctx.currentTime + i * 0.06 + 0.15);
        });
      } else if (type === 'tick') {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.setValueAtTime(800, ctx.currentTime);
        g.gain.setValueAtTime(0.08, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);
        o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.04);
      } else if (type === 'explosion') {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.type = 'sawtooth';
        o.connect(g); g.connect(ctx.destination);
        o.frequency.setValueAtTime(200, ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.3);
        g.gain.setValueAtTime(0.15, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.3);
      } else if (type === 'combo') {
        [600, 750, 900].forEach((freq, i) => {
          const o = ctx.createOscillator(); const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.05);
          g.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.05);
          g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.05 + 0.12);
          o.start(ctx.currentTime + i * 0.05); o.stop(ctx.currentTime + i * 0.05 + 0.12);
        });
      }
    } catch (e) { /* silent */ }
  }, [getCtx]);
  return playSound;
};

// ============================================================
//  QUESTION GENERATOR
// ============================================================
function gerarPergunta(tabuadasSelecionadas, acertos, metaAcertos = DEFAULT_META_ACERTOS) {
  const tabuada = tabuadasSelecionadas[Math.floor(Math.random() * tabuadasSelecionadas.length)];
  let multiplicador, tipo = 'normal';
  const progresso = metaAcertos > 0 ? (acertos / metaAcertos) * 100 : 0;
  if (progresso < 20) { multiplicador = (acertos % 10) + 1; }
  else if (progresso < 40) { multiplicador = Math.floor(Math.random() * 5) + 1; }
  else if (progresso < 60) { multiplicador = Math.floor(Math.random() * 5) + 3; }
  else if (progresso < 80) {
    multiplicador = Math.floor(Math.random() * 5) + 6;
    if (Math.random() > 0.5) tipo = Math.random() > 0.5 ? 'fatorA' : 'fatorB';
  } else {
    multiplicador = Math.floor(Math.random() * 10) + 1;
    if (Math.random() > 0.2) tipo = Math.random() > 0.5 ? 'fatorA' : 'fatorB';
  }
  const resultado = tabuada * multiplicador;
  return {
    tabuada, multiplicador, resultado, tipo,
    resposta: tipo === 'normal' ? resultado : tipo === 'fatorA' ? tabuada : multiplicador,
    textoA: tipo === 'fatorA' ? '?' : tabuada,
    textoB: tipo === 'fatorB' ? '?' : multiplicador,
    textoResultado: tipo === 'normal' ? '?' : resultado,
  };
}

function getNivelAtual(acertos, metaAcertos = DEFAULT_META_ACERTOS) {
  const progresso = metaAcertos > 0 ? (acertos / metaAcertos) * 100 : 0;
  for (let i = niveis.length - 1; i >= 0; i--) {
    const marcoPercentual = (niveis[i].minAcertos / DEFAULT_META_ACERTOS) * 100;
    if (progresso >= marcoPercentual) return i;
  }
  return 0;
}

function formatarDuracao(segundos) {
  const total = Math.max(0, Math.floor(segundos || 0));
  const min = Math.floor(total / 60);
  const sec = total % 60;
  return `${min}:${String(sec).padStart(2, '0')}`;
}

function normalizeMiniResult(result) {
  if (typeof result === 'number') {
    return { xp: result, acertosMini: 0, errosMini: 0, tempoSeg: 0, comboMax: 0, eventos: {} };
  }
  const safe = result || {};
  return {
    xp: Math.max(0, Number(safe.xp || 0)),
    acertosMini: Math.max(0, Number(safe.acertosMini || 0)),
    errosMini: Math.max(0, Number(safe.errosMini || 0)),
    tempoSeg: Math.max(0, Number(safe.tempoSeg || 0)),
    comboMax: Math.max(0, Number(safe.comboMax || 0)),
    eventos: safe.eventos || {},
  };
}

// ============================================================
//  PARTICLES & EFFECTS
// ============================================================
function Confetti() {
  const cores = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3', '#60a5fa', '#34d399'];
  const confetes = Array.from({ length: 60 }, (_, i) => ({
    id: i, left: Math.random() * 100, delay: Math.random() * 2,
    cor: cores[Math.floor(Math.random() * cores.length)],
    size: Math.random() * 10 + 5, rotation: Math.random() * 360,
  }));
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1000, overflow: 'hidden' }}>
      {confetes.map(c => (
        <div key={c.id} style={{
          position: 'absolute', top: '-20px', left: `${c.left}%`,
          backgroundColor: c.cor, width: `${c.size}px`, height: `${c.size}px`,
          animationDelay: `${c.delay}s`, borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          animation: 'confettiFall 3s ease-out forwards',
          transform: `rotate(${c.rotation}deg)`,
        }} />
      ))}
    </div>
  );
}

function FloatingPoints({ points, x, y }) {
  return (
    <div style={{
      position: 'fixed', left: x || '50%', top: y || '40%',
      transform: 'translateX(-50%)', color: '#FFE66D',
      fontSize: '1.5rem', fontWeight: 800, pointerEvents: 'none',
      animation: 'floatUp 1s ease-out forwards', zIndex: 999,
      textShadow: '0 2px 8px rgba(0,0,0,0.5)',
    }}>
      +{points}
    </div>
  );
}

// Particle burst on correct answer
function ParticleBurst({ color = '#4ECDC4' }) {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    angle: (i / 12) * 360,
    dist: 30 + Math.random() * 40,
    size: 4 + Math.random() * 4,
  }));
  return (
    <div style={{ position: 'absolute', top: '50%', left: '50%', pointerEvents: 'none', zIndex: 10 }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute', width: p.size, height: p.size,
          backgroundColor: color, borderRadius: '50%',
          animation: `particleBurst 0.6s ease-out forwards`,
          transform: `translate(-50%, -50%)`,
          '--angle': `${p.angle}deg`, '--dist': `${p.dist}px`,
        }} />
      ))}
    </div>
  );
}

// ============================================================
//  SHARED UI COMPONENTS
// ============================================================
function ConquistaToast({ conquista, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 1600); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="tq-toast">
      <div className="tq-toast-glow" />
      <span style={{ fontSize: '2rem', position: 'relative', zIndex: 1 }}>{conquista.emoji}</span>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontWeight: 800, color: '#1a1a2e', fontSize: '0.9rem' }}>🏆 Nova Conquista!</div>
        <div style={{ fontSize: '0.8rem', color: '#555', fontWeight: 600 }}>{conquista.nome}</div>
      </div>
    </div>
  );
}

function TrophyRail({ conquistas }) {
  if (!conquistas || conquistas.length === 0) return null;
  return (
    <aside className="tq-trophy-rail">
      <div className="tq-trophy-rail-title">Troféus</div>
      <div className="tq-trophy-rail-list">
        {conquistas.map((c) => (
          <div key={c.id} className="tq-trophy-chip" title={c.nome}>
            <span>{c.emoji}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}

const Mascote = ({ estado, compact }) => {
  const expressoes = {
    normal: '😊', pensando: '🤔', feliz: '😄', muitoFeliz: '🤩',
    triste: '😢', surpreso: '😮', foguete: '🚀', crazy: '🤪',
    boss: '😤', dano: '💪', venceu: '🥳',
  };
  return (
    <div className={`tq-mascote ${estado}`}>
      <div className="tq-mascote-emoji">{expressoes[estado] || expressoes.normal}</div>
    </div>
  );
};

const TecladoNumerico = ({ onInput, onDelete, onClear, onSubmit, disabled }) => {
  const teclas = [[1,2,3],[4,5,6],[7,8,9],['C',0,'⌫']];
  return (
    <div className="tq-teclado">
      {teclas.map((row, i) => (
        <div key={i} className="tq-teclado-row">
          {row.map(t => (
            <button key={t}
              className={`tq-tecla ${t === 'C' || t === '⌫' ? 'acao' : ''}`}
              onClick={() => { if (disabled) return; t === 'C' ? onClear() : t === '⌫' ? onDelete() : onInput(t); }}
              disabled={disabled}>{t}</button>
          ))}
        </div>
      ))}
      <button className="tq-tecla-confirmar" onClick={onSubmit} disabled={disabled}>✓ Confirmar</button>
    </div>
  );
};

function MiniHowTo({ text }) {
  return <div className="tq-mini-howto">Como jogar: {text}</div>;
}

// ---- XP Bar component ----
function XPBar({ xp, compact }) {
  const rank = getRank(xp);
  const next = getNextRank(xp);
  const progress = next ? ((xp - rank.xpMin) / (next.xpMin - rank.xpMin)) * 100 : 100;
  if (compact) {
    return (
      <div className="tq-xp-bar-compact">
        <span style={{ fontSize: '1rem' }}>{rank.emoji}</span>
        <div className="tq-xp-track-small">
          <div className="tq-xp-fill-small" style={{ width: `${progress}%`, background: rank.cor }} />
        </div>
        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>{xp}</span>
      </div>
    );
  }
  return (
    <div className="tq-xp-section">
      <div className="tq-rank-display">
        <span style={{ fontSize: '2rem' }}>{rank.emoji}</span>
        <div>
          <div style={{ fontWeight: 800, color: rank.cor, fontSize: '1.1rem' }}>{rank.nome}</div>
          {next && <div style={{ fontSize: '0.75rem', color: '#888' }}>{xp}/{next.xpMin} XP → {next.emoji} {next.nome}</div>}
        </div>
      </div>
      <div className="tq-xp-track">
        <div className="tq-xp-fill" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${rank.cor}, ${rank.cor}dd)` }} />
      </div>
    </div>
  );
}

// ---- Daily Streak ----
function DailyStreak({ streak }) {
  const dots = Array.from({ length: 7 }, (_, i) => i < streak);
  return (
    <div className="tq-streak">
      <div className="tq-streak-label">🔥 {streak} dia{streak !== 1 ? 's' : ''}</div>
      <div className="tq-streak-dots">
        {dots.map((active, i) => (
          <div key={i} className={`tq-streak-dot ${active ? 'active' : ''}`}>
            {active ? '🔥' : '○'}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
//  MINIGAME: CRAZY TIME (enhanced)
// ============================================================
function MiniJogoCrazyTime({ tabuadas, onComplete, playSound }) {
  const [fase, setFase] = useState('intro');
  const [tempoTotal, setTempoTotal] = useState(60);
  const [tempoResposta, setTempoResposta] = useState(5);
  const [pergunta, setPergunta] = useState(null);
  const [resposta, setResposta] = useState('');
  const [acertos, setAcertos] = useState(0);
  const [tempoRestante, setTempoRestante] = useState(5);
  const [multiplier, setMultiplier] = useState(1);
  const [shake, setShake] = useState(false);

  const gerarP = useCallback(() => {
    const t = tabuadas[Math.floor(Math.random() * tabuadas.length)];
    const m = Math.floor(Math.random() * 10) + 1;
    return { tabuada: t, multiplicador: m, resposta: t * m };
  }, [tabuadas]);

  useEffect(() => {
    if (fase === 'intro') {
      playSound('minigame');
      const timer = setTimeout(() => { setFase('jogando'); setPergunta(gerarP()); }, 2500);
      return () => clearTimeout(timer);
    }
  }, [fase, gerarP, playSound]);

  useEffect(() => {
    if (fase !== 'jogando') return;
    const interval = setInterval(() => {
      setTempoTotal(t => { if (t <= 1) { setFase('resultado'); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(interval);
  }, [fase]);

  useEffect(() => {
    if (fase !== 'jogando' || !pergunta) return;
    setTempoRestante(tempoResposta);
    const interval = setInterval(() => {
      setTempoRestante(t => {
        if (t <= 0.1) { playSound('erro'); setShake(true); setTimeout(() => setShake(false), 300); setPergunta(gerarP()); setResposta(''); setMultiplier(1); return tempoResposta; }
        return t - 0.1;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [fase, pergunta, tempoResposta, gerarP, playSound]);

  const verificar = () => {
    if (!resposta) return;
    if (parseInt(resposta) === pergunta.resposta) {
      playSound(multiplier >= 3 ? 'combo' : 'acerto');
      setAcertos(a => a + 1);
      setMultiplier(m => Math.min(5, m + 1));
      if ((acertos + 1) % 3 === 0 && tempoResposta > 2) setTempoResposta(t => Math.max(2, t - 0.5));
    } else {
      playSound('erro'); setShake(true); setTimeout(() => setShake(false), 300); setMultiplier(1);
    }
    setPergunta(gerarP()); setResposta('');
  };

  if (fase === 'intro') {
    return (
      <div className="tq-mini-center">
        <div style={{ fontSize: '4rem', animation: 'pulse 0.6s ease infinite' }}>⚡</div>
        <div className="tq-mini-title" style={{ color: '#FFE66D' }}>CRAZY TIME!</div>
        <div className="tq-mini-sub">Máximo de acertos em 1 minuto!</div>
        <MiniHowTo text="responda contas rápidas sem deixar o tempo da barra zerar." />
        <div style={{ fontSize: '1.5rem', color: 'white', fontWeight: 700, marginTop: 12 }}>Preparar...</div>
      </div>
    );
  }

  if (fase === 'resultado') {
    return (
      <div className="tq-mini-center">
        <Confetti />
        <div style={{ fontSize: '4rem' }}>{acertos >= 20 ? '🏆' : acertos >= 15 ? '⭐' : acertos >= 10 ? '🎉' : '👍'}</div>
        <div className="tq-mini-title">Tempo Esgotado!</div>
        <div style={{ fontSize: '3rem', fontWeight: 800, color: '#FFE66D', margin: '12px 0' }}>{acertos}</div>
        <div className="tq-mini-sub">acertos em 1 minuto!</div>
        <button className="tq-btn-primary" onClick={() => onComplete({
          xp: acertos * 20, acertosMini: acertos, errosMini: 0, tempoSeg: 60, comboMax: multiplier, eventos: { acertos },
        })} style={{ marginTop: 20 }}>
          Continuar (+{acertos * 20} XP)
        </button>
      </div>
    );
  }

  return (
    <div className={`tq-mini-top ${shake ? 'tq-shake' : ''}`}>
      <div className="tq-crazy-header">
        <div className="tq-pill">⏱️ {tempoTotal}s</div>
        <div className="tq-pill" style={{ background: multiplier > 1 ? 'rgba(255,230,109,0.3)' : undefined }}>
          {multiplier > 1 && <span style={{ color: '#FFE66D', fontWeight: 800 }}>×{multiplier} </span>}
          🎯 {acertos}
        </div>
      </div>
      <div className="tq-timer-bar">
        <div className="tq-timer-fill" style={{ width: `${(tempoRestante / tempoResposta) * 100}%`, background: tempoRestante < 1.5 ? '#FF6B6B' : 'linear-gradient(90deg, #4ECDC4, #44A08D)' }} />
      </div>
      {pergunta && (
        <div style={{ fontSize: '2.8rem', fontWeight: 800, color: 'white', margin: '20px 0' }}>
          {pergunta.tabuada} <span style={{ color: 'rgba(255,255,255,0.4)' }}>×</span> {pergunta.multiplicador} <span style={{ color: 'rgba(255,255,255,0.4)' }}>=</span> <span style={{ color: '#FFE66D' }}>?</span>
        </div>
      )}
      <input type="number" inputMode="numeric" pattern="[0-9]*" className="tq-input"
        value={resposta} onChange={e => setResposta(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && verificar()} autoFocus placeholder="?" />
      <TecladoNumerico onInput={n => setResposta(r => r + n)} onDelete={() => setResposta(r => r.slice(0, -1))}
        onClear={() => setResposta('')} onSubmit={verificar} />
    </div>
  );
}

// ============================================================
//  MINIGAME: BOSS BATTLE
// ============================================================
function MiniJogoBoss({ tabuadas, onComplete, playSound }) {
  const [fase, setFase] = useState('intro');
  const boss = useRef(BOSSES[Math.floor(Math.random() * BOSSES.length)]);
  const [vidaBoss, setVidaBoss] = useState(boss.current.vida);
  const [pergunta, setPergunta] = useState(null);
  const [resposta, setResposta] = useState('');
  const [bossShake, setBossShake] = useState(false);
  const [playerDano, setPlayerDano] = useState(false);
  const [playerHP, setPlayerHP] = useState(3);
  const [showDmg, setShowDmg] = useState(null);

  const gerarP = useCallback(() => {
    const t = tabuadas[Math.floor(Math.random() * tabuadas.length)];
    const m = Math.floor(Math.random() * 10) + 1;
    return { tabuada: t, multiplicador: m, resposta: t * m };
  }, [tabuadas]);

  useEffect(() => {
    if (fase === 'intro') {
      playSound('boss');
      const timer = setTimeout(() => { setFase('jogando'); setPergunta(gerarP()); }, 3000);
      return () => clearTimeout(timer);
    }
  }, [fase, gerarP, playSound]);

  const verificar = () => {
    if (!resposta) return;
    if (parseInt(resposta) === pergunta.resposta) {
      playSound('hit');
      const dmg = Math.floor(Math.random() * 2) + 1;
      setVidaBoss(v => {
        const newV = Math.max(0, v - dmg);
        if (newV <= 0) setTimeout(() => setFase('vitoria'), 600);
        return newV;
      });
      setBossShake(true); setTimeout(() => setBossShake(false), 400);
      setShowDmg(dmg); setTimeout(() => setShowDmg(null), 800);
    } else {
      playSound('erro');
      setPlayerDano(true); setTimeout(() => setPlayerDano(false), 400);
      setPlayerHP(hp => {
        if (hp - 1 <= 0) { setTimeout(() => setFase('derrota'), 600); return 0; }
        return hp - 1;
      });
    }
    setPergunta(gerarP()); setResposta('');
  };

  if (fase === 'intro') {
    return (
      <div className="tq-mini-center">
        <div style={{ fontSize: '5rem', animation: 'bossPulse 1s ease infinite' }}>{boss.current.emoji}</div>
        <div className="tq-mini-title" style={{ color: boss.current.cor }}>⚔️ BOSS BATTLE! ⚔️</div>
        <div className="tq-mini-sub" style={{ fontSize: '1.1rem', maxWidth: 300 }}>
          <strong>{boss.current.nome}</strong> apareceu!
        </div>
        <MiniHowTo text="acerte para causar dano no boss; erro tira seu HP." />
        <div style={{ color: 'rgba(255,255,255,0.6)', marginTop: 8, fontStyle: 'italic' }}>
          "{boss.current.frase}"
        </div>
      </div>
    );
  }

  if (fase === 'vitoria') {
    return (
      <div className="tq-mini-center">
        <Confetti />
        <div style={{ fontSize: '4rem' }}>⚔️</div>
        <div className="tq-mini-title" style={{ color: '#4ECDC4' }}>VITÓRIA!</div>
        <div className="tq-mini-sub">{boss.current.nome} foi derrotado!</div>
        <div style={{ fontSize: '2rem', margin: '16px 0' }}>
          {'❤️'.repeat(playerHP)}{'🖤'.repeat(3 - playerHP)}
        </div>
        <button className="tq-btn-primary" onClick={() => onComplete({
          xp: boss.current.vida * 15, acertosMini: boss.current.vida, errosMini: 3 - playerHP, tempoSeg: 0, comboMax: 0, eventos: { venceu: true },
        })} style={{ marginTop: 16 }}>
          Continuar (+{boss.current.vida * 15} XP)
        </button>
      </div>
    );
  }

  if (fase === 'derrota') {
    return (
      <div className="tq-mini-center">
        <div style={{ fontSize: '4rem' }}>{boss.current.emoji}</div>
        <div className="tq-mini-title" style={{ color: '#FF6B6B' }}>Derrotado...</div>
        <div className="tq-mini-sub">{boss.current.nome} venceu desta vez!</div>
        <button className="tq-btn-primary" onClick={() => onComplete({
          xp: 20, acertosMini: 0, errosMini: 3, tempoSeg: 0, comboMax: 0, eventos: { venceu: false },
        })} style={{ marginTop: 16 }}>
          Continuar (+20 XP)
        </button>
      </div>
    );
  }

  return (
    <div className={`tq-mini-top ${playerDano ? 'tq-shake-red' : ''}`}>
      {/* Boss display */}
      <div className="tq-boss-area">
        <div className={`tq-boss-sprite ${bossShake ? 'tq-shake' : ''}`} style={{ position: 'relative' }}>
          <div style={{ fontSize: '4rem' }}>{boss.current.emoji}</div>
          {showDmg && <div className="tq-dmg-number">-{showDmg}</div>}
        </div>
        <div className="tq-boss-name">{boss.current.nome}</div>
        <div className="tq-hp-bar">
          <div className="tq-hp-fill" style={{ width: `${(vidaBoss / boss.current.vida) * 100}%`, background: boss.current.cor }} />
        </div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginTop: 4 }}>
          HP: {vidaBoss}/{boss.current.vida}
        </div>
      </div>

      {/* Player HP */}
      <div style={{ fontSize: '1.5rem', margin: '8px 0' }}>
        {'❤️'.repeat(playerHP)}{'🖤'.repeat(3 - playerHP)}
      </div>

      {/* Question */}
      {pergunta && (
        <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'white', margin: '12px 0' }}>
          {pergunta.tabuada} × {pergunta.multiplicador} = ?
        </div>
      )}
      <input type="number" inputMode="numeric" pattern="[0-9]*" className="tq-input"
        value={resposta} onChange={e => setResposta(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && verificar()} autoFocus placeholder="?" />
      <TecladoNumerico onInput={n => setResposta(r => r + n)} onDelete={() => setResposta(r => r.slice(0, -1))}
        onClear={() => setResposta('')} onSubmit={verificar} />
    </div>
  );
}

// ============================================================
//  MINIGAME: METEOR SHOWER
// ============================================================
function MiniJogoMeteoro({ tabuadas, onComplete, playSound }) {
  const [fase, setFase] = useState('intro');
  const [meteoros, setMeteoros] = useState([]);
  const [resposta, setResposta] = useState('');
  const [pontos, setPontos] = useState(0);
  const [vidas, setVidas] = useState(3);
  const [tempoTotal, setTempoTotal] = useState(45);
  const meteorId = useRef(0);

  const gerarMeteoro = useCallback(() => {
    const t = tabuadas[Math.floor(Math.random() * tabuadas.length)];
    const m = Math.floor(Math.random() * 10) + 1;
    return { id: meteorId.current++, tabuada: t, multiplicador: m, resposta: t * m, posX: Math.random() * 80 + 10, ttl: 8 };
  }, [tabuadas]);

  useEffect(() => {
    if (fase === 'intro') {
      playSound('minigame');
      const timer = setTimeout(() => setFase('jogando'), 2500);
      return () => clearTimeout(timer);
    }
  }, [fase, playSound]);

  // Spawn meteors
  useEffect(() => {
    if (fase !== 'jogando') return;
    const interval = setInterval(() => {
      setMeteoros(prev => [...prev, gerarMeteoro()]);
    }, 3000);
    return () => clearInterval(interval);
  }, [fase, gerarMeteoro]);

  // Timer & meteor lifecycle
  useEffect(() => {
    if (fase !== 'jogando') return;
    const interval = setInterval(() => {
      setTempoTotal(t => { if (t <= 1) { setFase('resultado'); return 0; } return t - 1; });
      setMeteoros(prev => {
        const updated = prev.map(m => ({ ...m, ttl: m.ttl - 1 }));
        const expired = updated.filter(m => m.ttl <= 0);
        if (expired.length > 0) {
          setVidas(v => {
            const newV = Math.max(0, v - expired.length);
            if (newV <= 0) setTimeout(() => setFase('resultado'), 100);
            return newV;
          });
          playSound('explosion');
        }
        return updated.filter(m => m.ttl > 0);
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [fase, playSound]);

  const verificar = () => {
    if (!resposta) return;
    const val = parseInt(resposta);
    const idx = meteoros.findIndex(m => m.resposta === val);
    if (idx >= 0) {
      playSound('hit');
      setPontos(p => p + 15);
      setMeteoros(prev => prev.filter((_, i) => i !== idx));
    } else {
      playSound('erro');
    }
    setResposta('');
  };

  if (fase === 'intro') {
    return (
      <div className="tq-mini-center">
        <div style={{ fontSize: '4rem' }}>☄️</div>
        <div className="tq-mini-title" style={{ color: '#f97316' }}>CHUVA DE METEOROS!</div>
        <div className="tq-mini-sub">Resolva as multiplicações para destruir os meteoros!</div>
        <MiniHowTo text="digite o resultado de qualquer meteoro antes que ele atinja a Terra." />
      </div>
    );
  }

  if (fase === 'resultado') {
    return (
      <div className="tq-mini-center">
        {pontos > 150 && <Confetti />}
        <div style={{ fontSize: '4rem' }}>{pontos >= 150 ? '🏆' : pontos >= 80 ? '⭐' : '💫'}</div>
        <div className="tq-mini-title">{vidas > 0 ? 'Tempo Esgotado!' : 'Base Destruída!'}</div>
        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#FFE66D', margin: '12px 0' }}>{pontos} pts</div>
        <button className="tq-btn-primary" onClick={() => onComplete({
          xp: pontos, acertosMini: Math.floor(pontos / 15), errosMini: Math.max(0, 3 - vidas), tempoSeg: 45 - tempoTotal, comboMax: 0, eventos: { pontos },
        })} style={{ marginTop: 16 }}>
          Continuar (+{pontos} XP)
        </button>
      </div>
    );
  }

  return (
    <div className="tq-mini-top">
      <div className="tq-crazy-header">
        <div className="tq-pill">⏱️ {tempoTotal}s</div>
        <div className="tq-pill">{'❤️'.repeat(vidas)}{'🖤'.repeat(3 - vidas)}</div>
        <div className="tq-pill">⭐ {pontos}</div>
      </div>

      {/* Meteor field */}
      <div className="tq-meteor-field">
        {meteoros.map(m => (
          <div key={m.id} className="tq-meteor" style={{ left: `${m.posX}%`, animationDuration: `${m.ttl}s` }}>
            <div className="tq-meteor-emoji">☄️</div>
            <div className="tq-meteor-label">{m.tabuada}×{m.multiplicador}</div>
          </div>
        ))}
        <div className="tq-earth">🌍</div>
      </div>

      <input type="number" inputMode="numeric" pattern="[0-9]*" className="tq-input"
        value={resposta} onChange={e => setResposta(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && verificar()} autoFocus placeholder="Resultado = ?" />
      <TecladoNumerico onInput={n => setResposta(r => r + n)} onDelete={() => setResposta(r => r.slice(0, -1))}
        onClear={() => setResposta('')} onSubmit={verificar} />
    </div>
  );
}

// ============================================================
//  MINIGAME: MEMORY MATCH
// ============================================================
function MiniJogoMemoria({ tabuadas, onComplete, playSound }) {
  const [fase, setFase] = useState('intro');
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    if (fase === 'intro') {
      playSound('minigame');
      // Generate 6 pairs
      const pairs = [];
      const used = new Set();
      const usedResults = new Set();
      let guard = 0;
      while (pairs.length < 6) {
        guard++;
        if (guard > 300) break;
        const t = tabuadas[Math.floor(Math.random() * tabuadas.length)];
        const m = Math.floor(Math.random() * 10) + 1;
        const key = `${t}x${m}`;
        const resultado = t * m;
        if (!used.has(key)) {
          if (usedResults.has(resultado)) continue;
          used.add(key);
          usedResults.add(resultado);
          pairs.push({ tabuada: t, multiplicador: m, resultado });
        }
      }
      if (pairs.length < 6) {
        const fallback = [];
        tabuadas.forEach((t) => {
          for (let m = 1; m <= 10; m++) fallback.push({ tabuada: t, multiplicador: m, resultado: t * m });
        });
        fallback.sort(() => Math.random() - 0.5);
        for (const c of fallback) {
          if (pairs.length >= 6) break;
          const key = `${c.tabuada}x${c.multiplicador}`;
          if (used.has(key) || usedResults.has(c.resultado)) continue;
          used.add(key);
          usedResults.add(c.resultado);
          pairs.push(c);
        }
      }
      const allCards = [];
      pairs.forEach((p, i) => {
        allCards.push({ id: i * 2, pairId: i, display: `${p.tabuada}×${p.multiplicador}`, type: 'question' });
        allCards.push({ id: i * 2 + 1, pairId: i, display: `${p.resultado}`, type: 'answer' });
      });
      allCards.sort(() => Math.random() - 0.5);
      setCards(allCards);
      const timer = setTimeout(() => setFase('jogando'), 2000);
      return () => clearTimeout(timer);
    }
  }, [fase, tabuadas, playSound]);

  useEffect(() => {
    if (matched.length === 12 && fase === 'jogando') {
      playSound('conquista');
      setTimeout(() => setFase('resultado'), 800);
    }
  }, [matched, fase, playSound]);

  const flipCard = (id) => {
    if (flipped.length >= 2 || flipped.includes(id) || matched.includes(id)) return;
    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);
    playSound('tick');

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = newFlipped.map(fid => cards.find(c => c.id === fid));
      if (a.pairId === b.pairId) {
        playSound('acerto');
        setTimeout(() => { setMatched(prev => [...prev, a.id, b.id]); setFlipped([]); }, 400);
      } else {
        playSound('erro');
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  if (fase === 'intro') {
    return (
      <div className="tq-mini-center">
        <div style={{ fontSize: '4rem' }}>🧠</div>
        <div className="tq-mini-title" style={{ color: '#a78bfa' }}>JOGO DA MEMÓRIA!</div>
        <div className="tq-mini-sub">Combine a multiplicação com o resultado!</div>
        <MiniHowTo text="vire duas cartas; só vale par exato da conta com seu resultado." />
      </div>
    );
  }

  if (fase === 'resultado') {
    const pts = Math.max(30, 120 - moves * 5);
    return (
      <div className="tq-mini-center">
        <Confetti />
        <div style={{ fontSize: '4rem' }}>🧠</div>
        <div className="tq-mini-title" style={{ color: '#4ECDC4' }}>Parabéns!</div>
        <div className="tq-mini-sub">Completou em {moves} jogadas!</div>
        <button className="tq-btn-primary" onClick={() => onComplete({
          xp: pts, acertosMini: 12, errosMini: Math.max(0, moves - 12), tempoSeg: 0, comboMax: 0, eventos: { moves },
        })} style={{ marginTop: 16 }}>
          Continuar (+{pts} XP)
        </button>
      </div>
    );
  }

  return (
    <div className="tq-mini-top" style={{ paddingTop: 16 }}>
      <div className="tq-pill" style={{ alignSelf: 'center', marginBottom: 12 }}>🃏 Jogadas: {moves}</div>
      <div className="tq-memory-grid">
        {cards.map(card => {
          const isFlipped = flipped.includes(card.id) || matched.includes(card.id);
          const isMatched = matched.includes(card.id);
          return (
            <button key={card.id}
              className={`tq-memory-card ${isFlipped ? 'flipped' : ''} ${isMatched ? 'matched' : ''}`}
              onClick={() => flipCard(card.id)} disabled={isMatched}>
              <div className="tq-memory-card-inner">
                <div className="tq-memory-front">?</div>
                <div className="tq-memory-back">{card.display}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
//  MINIGAME: SPEED DUEL (Beat the clock per question)
// ============================================================
function MiniJogoDuelo({ tabuadas, onComplete, playSound }) {
  const [fase, setFase] = useState('intro');
  const [rodada, setRodada] = useState(0);
  const [tempo, setTempo] = useState(3);
  const [pergunta, setPergunta] = useState(null);
  const [resposta, setResposta] = useState('');
  const [vitorias, setVitorias] = useState(0);
  const totalRodadas = 8;

  const gerarP = useCallback(() => {
    const t = tabuadas[Math.floor(Math.random() * tabuadas.length)];
    const m = Math.floor(Math.random() * 10) + 1;
    return { tabuada: t, multiplicador: m, resposta: t * m };
  }, [tabuadas]);

  useEffect(() => {
    if (fase === 'intro') {
      playSound('minigame');
      const timer = setTimeout(() => { setFase('jogando'); setPergunta(gerarP()); }, 2000);
      return () => clearTimeout(timer);
    }
  }, [fase, gerarP, playSound]);

  useEffect(() => {
    if (fase !== 'jogando' || !pergunta) return;
    setTempo(3);
    const interval = setInterval(() => {
      setTempo(t => {
        if (t <= 0.1) {
          playSound('erro');
          if (rodada + 1 >= totalRodadas) { setFase('resultado'); return 0; }
          setRodada(r => r + 1); setPergunta(gerarP()); setResposta('');
          return 3;
        }
        return t - 0.1;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [fase, pergunta, rodada, gerarP, playSound, totalRodadas]);

  const verificar = () => {
    if (!resposta) return;
    if (parseInt(resposta) === pergunta.resposta) {
      playSound('acerto'); setVitorias(v => v + 1);
    } else {
      playSound('erro');
    }
    if (rodada + 1 >= totalRodadas) { setFase('resultado'); return; }
    setRodada(r => r + 1); setPergunta(gerarP()); setResposta('');
  };

  if (fase === 'intro') {
    return (
      <div className="tq-mini-center">
        <div style={{ fontSize: '4rem' }}>🤺</div>
        <div className="tq-mini-title" style={{ color: '#f43f5e' }}>DUELO RÁPIDO!</div>
        <div className="tq-mini-sub">3 segundos por pergunta. Sem piedade!</div>
        <MiniHowTo text="cada rodada dura 3 segundos; responda antes do cronômetro." />
      </div>
    );
  }

  if (fase === 'resultado') {
    const pts = vitorias * 20;
    return (
      <div className="tq-mini-center">
        {vitorias >= 6 && <Confetti />}
        <div style={{ fontSize: '4rem' }}>{vitorias >= 6 ? '🏆' : vitorias >= 4 ? '⭐' : '💪'}</div>
        <div className="tq-mini-title">{vitorias}/{totalRodadas} Duelos Vencidos!</div>
        <button className="tq-btn-primary" onClick={() => onComplete({
          xp: pts, acertosMini: vitorias, errosMini: totalRodadas - vitorias, tempoSeg: 0, comboMax: 0, eventos: { vitorias },
        })} style={{ marginTop: 16 }}>
          Continuar (+{pts} XP)
        </button>
      </div>
    );
  }

  return (
    <div className="tq-mini-top">
      <div className="tq-crazy-header">
        <div className="tq-pill">Rodada {rodada + 1}/{totalRodadas}</div>
        <div className="tq-pill">🏅 {vitorias}</div>
      </div>
      <div className="tq-timer-bar" style={{ marginBottom: 16 }}>
        <div className="tq-timer-fill" style={{
          width: `${(tempo / 3) * 100}%`,
          background: tempo < 1 ? '#FF6B6B' : tempo < 2 ? '#fbbf24' : '#4ECDC4',
          transition: 'width 0.1s linear',
        }} />
      </div>
      {pergunta && (
        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', margin: '16px 0' }}>
          {pergunta.tabuada} × {pergunta.multiplicador} = ?
        </div>
      )}
      <input type="number" inputMode="numeric" pattern="[0-9]*" className="tq-input"
        value={resposta} onChange={e => setResposta(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && verificar()} autoFocus placeholder="?" />
      <TecladoNumerico onInput={n => setResposta(r => r + n)} onDelete={() => setResposta(r => r.slice(0, -1))}
        onClear={() => setResposta('')} onSubmit={verificar} />
    </div>
  );
}

// ============================================================
//  MINIGAME: HISTÓRIA MATEMÁTICA (enhanced)
// ============================================================
function MiniJogoHistoria({ tabuadas, onComplete, playSound }) {
  const [fase, setFase] = useState('intro');
  const [historia, setHistoria] = useState(null);
  const [resposta, setResposta] = useState('');
  const [feedback, setFeedback] = useState(null);

  const gerarH = useCallback(() => {
    const h = HISTORIAS[Math.floor(Math.random() * HISTORIAS.length)];
    const b = h.bRange[0] + Math.floor(Math.random() * (h.bRange[1] - h.bRange[0] + 1));
    return { texto: h.texto.replace('{a}', h.a).replace('{b}', b), a: h.a, b, resposta: h.a * b };
  }, []);

  useEffect(() => {
    if (fase === 'intro') {
      playSound('minigame');
      const t = setTimeout(() => { setFase('jogando'); setHistoria(gerarH()); }, 2000);
      return () => clearTimeout(t);
    }
  }, [fase, gerarH, playSound]);

  const verificar = () => {
    if (!resposta) return;
    if (parseInt(resposta) === historia.resposta) {
      playSound('conquista'); setFeedback('correto');
      setTimeout(() => onComplete({
        xp: 50, acertosMini: 1, errosMini: 0, tempoSeg: 0, comboMax: 0, eventos: { correto: true },
      }), 1500);
    } else {
      playSound('erro'); setFeedback('errado');
      setTimeout(() => { setFeedback(null); setResposta(''); }, 2000);
    }
  };

  if (fase === 'intro') {
    return (
      <div className="tq-mini-center">
        <div style={{ fontSize: '4rem' }}>📖</div>
        <div className="tq-mini-title" style={{ color: '#34d399' }}>História Matemática</div>
        <div className="tq-mini-sub">Resolva o problema!</div>
        <MiniHowTo text="leia a história, monte a multiplicação e responda o total." />
      </div>
    );
  }

  return (
    <div className="tq-mini-center" style={{ justifyContent: 'flex-start', paddingTop: 40 }}>
      <div className="tq-story-card">{historia?.texto}</div>
      {feedback ? (
        <div className={`tq-feedback-box ${feedback}`}>
          {feedback === 'correto' ? <>🎉 Isso mesmo! {historia.a} × {historia.b} = {historia.resposta}</> :
            <>🤔 A resposta era {historia?.resposta}. Tente de novo!</>}
        </div>
      ) : (
        <>
          <input type="number" inputMode="numeric" pattern="[0-9]*" className="tq-input"
            value={resposta} onChange={e => setResposta(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && verificar()} autoFocus placeholder="Sua resposta" />
          <TecladoNumerico onInput={n => setResposta(r => r + n)} onDelete={() => setResposta(r => r.slice(0, -1))}
            onClear={() => setResposta('')} onSubmit={verificar} />
        </>
      )}
    </div>
  );
}

// ============================================================
//  MINIGAME: ALVO CERTEIRO (enhanced)
// ============================================================
function MiniJogoAlvo({ tabuadas, onComplete, playSound }) {
  const [fase, setFase] = useState('intro');
  const [pergunta, setPergunta] = useState(null);
  const [opcoes, setOpcoes] = useState([]);
  const [selecionada, setSelecionada] = useState(null);
  const [pontos, setPontos] = useState(0);
  const [rodada, setRodada] = useState(0);
  const [streak, setStreak] = useState(0);
  const totalRodadas = 8;

  const gerarR = useCallback(() => {
    const t = tabuadas[Math.floor(Math.random() * tabuadas.length)];
    const m = Math.floor(Math.random() * 10) + 1;
    const correta = t * m;
    const erradas = new Set();
    while (erradas.size < 3) {
      const e = correta + (Math.floor(Math.random() * 21) - 10);
      if (e !== correta && e > 0) erradas.add(e);
    }
    const all = [correta, ...Array.from(erradas)].sort(() => Math.random() - 0.5);
    setPergunta({ tabuada: t, multiplicador: m, resposta: correta }); setOpcoes(all); setSelecionada(null);
  }, [tabuadas]);

  useEffect(() => {
    if (fase === 'intro') {
      playSound('minigame');
      const t = setTimeout(() => { setFase('jogando'); gerarR(); }, 2000);
      return () => clearTimeout(t);
    }
  }, [fase, gerarR, playSound]);

  const selecionar = (o) => {
    if (selecionada !== null) return;
    setSelecionada(o);
    if (o === pergunta.resposta) {
      playSound('acerto'); const bonus = streak >= 3 ? 20 : 15;
      setPontos(p => p + bonus); setStreak(s => s + 1);
    } else {
      playSound('erro'); setStreak(0);
    }
    setTimeout(() => {
      if (rodada + 1 >= totalRodadas) setFase('resultado');
      else { setRodada(r => r + 1); gerarR(); }
    }, 800);
  };

  if (fase === 'intro') {
    return (
      <div className="tq-mini-center">
        <div style={{ fontSize: '4rem' }}>🎯</div>
        <div className="tq-mini-title" style={{ color: '#60a5fa' }}>Alvo Certeiro</div>
        <div className="tq-mini-sub">Escolha a resposta certa — rápido!</div>
        <MiniHowTo text="toque na alternativa correta para acumular pontos e combo." />
      </div>
    );
  }

  if (fase === 'resultado') {
    return (
      <div className="tq-mini-center">
        {pontos >= 100 && <Confetti />}
        <div style={{ fontSize: '4rem' }}>{pontos >= 100 ? '🏆' : pontos >= 60 ? '⭐' : '👍'}</div>
        <div className="tq-mini-title">{pontos} pontos!</div>
        <button className="tq-btn-primary" onClick={() => onComplete({
          xp: pontos, acertosMini: Math.floor(pontos / 15), errosMini: Math.max(0, totalRodadas - Math.floor(pontos / 15)), tempoSeg: 0, comboMax: streak, eventos: { pontos },
        })} style={{ marginTop: 16 }}>
          Continuar (+{pontos} XP)
        </button>
      </div>
    );
  }

  return (
    <div className="tq-mini-top">
      <div className="tq-crazy-header">
        <div className="tq-pill">Rodada {rodada + 1}/{totalRodadas}</div>
        {streak >= 2 && <div className="tq-pill" style={{ background: 'rgba(255,230,109,0.3)' }}>🔥×{streak}</div>}
        <div className="tq-pill">⭐ {pontos}</div>
      </div>
      {pergunta && (
        <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'white', margin: '24px 0' }}>
          {pergunta.tabuada} × {pergunta.multiplicador} = ?
        </div>
      )}
      <div className="tq-alvo-grid">
        {opcoes.map((o, i) => (
          <button key={i}
            className={`tq-alvo-btn ${selecionada === o ? (o === pergunta.resposta ? 'correta' : 'errada') : selecionada !== null && o === pergunta.resposta ? 'correta' : ''}`}
            onClick={() => selecionar(o)} disabled={selecionada !== null}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================
//  MINIGAME: SEQUÊNCIA
// ============================================================
function MiniJogoSequencia({ tabuadas, onComplete, playSound }) {
  const [fase, setFase] = useState('intro');
  const [sequencia, setSequencia] = useState([]);
  const [faltando, setFaltando] = useState(null);
  const [resposta, setResposta] = useState('');
  const [feedback, setFeedback] = useState(null);

  const gerarSeq = useCallback(() => {
    const t = tabuadas[Math.floor(Math.random() * tabuadas.length)];
    const inicio = Math.floor(Math.random() * 5) + 1;
    const seq = Array.from({ length: 5 }, (_, i) => ({ multiplicador: inicio + i, resultado: t * (inicio + i) }));
    const idx = Math.floor(Math.random() * 5);
    setSequencia(seq); setFaltando({ idx, tabuada: t, ...seq[idx] });
  }, [tabuadas]);

  useEffect(() => {
    if (fase === 'intro') {
      playSound('minigame');
      const t = setTimeout(() => { setFase('jogando'); gerarSeq(); }, 2000);
      return () => clearTimeout(t);
    }
  }, [fase, gerarSeq, playSound]);

  const verificar = () => {
    if (!resposta) return;
    if (parseInt(resposta) === faltando.resultado) {
      playSound('conquista'); setFeedback('correto');
      setTimeout(() => onComplete({
        xp: 40, acertosMini: 1, errosMini: 0, tempoSeg: 0, comboMax: 0, eventos: { correto: true },
      }), 1500);
    } else {
      playSound('erro'); setFeedback('errado');
      setTimeout(() => { setFeedback(null); setResposta(''); }, 1500);
    }
  };

  if (fase === 'intro') {
    return (
      <div className="tq-mini-center">
        <div style={{ fontSize: '4rem' }}>🔢</div>
        <div className="tq-mini-title" style={{ color: '#f472b6' }}>Sequência Maluca</div>
        <div className="tq-mini-sub">Complete o número que falta!</div>
        <MiniHowTo text="descubra o termo faltante da sequência da tabuada mostrada." />
      </div>
    );
  }

  return (
    <div className="tq-mini-center">
      {faltando && <div className="tq-mini-sub" style={{ marginBottom: 16 }}>Tabuada do <strong style={{ color: '#FFE66D', fontSize: '1.3rem' }}>{faltando.tabuada}</strong></div>}
      <div className="tq-seq-row">
        {sequencia.map((item, i) => (
          <div key={i} className={`tq-seq-item ${i === faltando?.idx ? 'missing' : ''}`}>
            {i === faltando?.idx ? '?' : item.resultado}
          </div>
        ))}
      </div>
      {feedback ? (
        <div className={`tq-feedback-box ${feedback}`}>
          {feedback === 'correto' ? '🎉 Perfeito!' : `🤔 Era ${faltando.resultado}. Tente de novo!`}
        </div>
      ) : (
        <>
          <input type="number" inputMode="numeric" pattern="[0-9]*" className="tq-input"
            value={resposta} onChange={e => setResposta(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && verificar()} autoFocus placeholder="?" />
          <TecladoNumerico onInput={n => setResposta(r => r + n)} onDelete={() => setResposta(r => r.slice(0, -1))}
            onClear={() => setResposta('')} onSubmit={verificar} />
        </>
      )}
    </div>
  );
}

// ============================================================
//  MINIGAME: TRILHA DOS EXPLORADORES
// ============================================================
function MiniJogoTrilha({ tabuadas, onComplete, playSound }) {
  const [fase, setFase] = useState('intro');
  const [tempo, setTempo] = useState(45);
  const [posicao, setPosicao] = useState(0);
  const [vidas, setVidas] = useState(3);
  const [opcoes, setOpcoes] = useState([]);
  const [ativa, setAtiva] = useState(null);
  const [resposta, setResposta] = useState('');
  const [acertosMini, setAcertosMini] = useState(0);
  const [errosMini, setErrosMini] = useState(0);

  const gerarOpcoes = useCallback(() => {
    const passos = [1, 2, 3].sort(() => Math.random() - 0.5);
    return passos.map((p, i) => {
      const t = tabuadas[Math.floor(Math.random() * tabuadas.length)];
      const m = Math.floor(Math.random() * 10) + 1;
      return { id: i, passos: p, tabuada: t, multiplicador: m, resposta: t * m };
    });
  }, [tabuadas]);

  useEffect(() => {
    if (fase === 'intro') {
      playSound('minigame');
      const t = setTimeout(() => { setFase('jogando'); setOpcoes(gerarOpcoes()); }, 1800);
      return () => clearTimeout(t);
    }
  }, [fase, gerarOpcoes, playSound]);

  useEffect(() => {
    if (fase !== 'jogando') return;
    if (tempo <= 0 || vidas <= 0 || posicao >= 15) { setFase('resultado'); return; }
    const iv = setInterval(() => setTempo(t => t - 1), 1000);
    return () => clearInterval(iv);
  }, [fase, tempo, vidas, posicao]);

  const confirmar = () => {
    if (!ativa || !resposta) return;
    const val = parseInt(resposta, 10);
    if (val === ativa.resposta) {
      playSound('acerto');
      setAcertosMini(a => a + 1);
      setPosicao(p => Math.min(15, p + ativa.passos));
    } else {
      playSound('erro');
      setErrosMini(e => e + 1);
      setVidas(v => Math.max(0, v - 1));
    }
    setAtiva(null);
    setResposta('');
    setOpcoes(gerarOpcoes());
  };

  if (fase === 'intro') {
    return (
      <div className="tq-mini-center">
        <div style={{ fontSize: '4rem' }}>🧭</div>
        <div className="tq-mini-title" style={{ color: '#22d3ee' }}>TRILHA DOS EXPLORADORES</div>
        <div className="tq-mini-sub">Escolha um caminho e resolva para avançar!</div>
        <MiniHowTo text="selecione rota (+1/+2/+3), acerte a conta e avance na trilha." />
      </div>
    );
  }

  if (fase === 'resultado') {
    const xp = (acertosMini * 18) + (posicao * 6) + (vidas * 8);
    return (
      <div className="tq-mini-center">
        {posicao >= 15 && <Confetti />}
        <div style={{ fontSize: '4rem' }}>{posicao >= 15 ? '🏴‍☠️' : vidas <= 0 ? '💀' : '🧭'}</div>
        <div className="tq-mini-title">Expedição Encerrada!</div>
        <div className="tq-mini-sub">Posição: {posicao}/15 • Acertos: {acertosMini}</div>
        <button className="tq-btn-primary" onClick={() => onComplete({
          xp, acertosMini, errosMini, tempoSeg: 45 - Math.max(0, tempo), comboMax: 0, eventos: { posicaoFinal: posicao },
        })} style={{ marginTop: 16 }}>
          Continuar (+{xp} XP)
        </button>
      </div>
    );
  }

  return (
    <div className="tq-mini-top">
      <div className="tq-crazy-header">
        <div className="tq-pill">⏱️ {tempo}s</div>
        <div className="tq-pill">📍 {posicao}/15</div>
        <div className="tq-pill">{'❤️'.repeat(vidas)}{'🖤'.repeat(3 - vidas)}</div>
      </div>
      <div className="tq-progress-bar" style={{ maxWidth: 340, width: '100%', marginBottom: 16 }}>
        <div className="tq-progress-fill" style={{ width: `${(posicao / 15) * 100}%` }} />
      </div>
      <div className="tq-mini-sub" style={{ marginBottom: 10 }}>Escolha um caminho:</div>
      <div className="tq-alvo-grid" style={{ marginBottom: 14 }}>
        {opcoes.map((o) => (
          <button key={o.id} className={`tq-alvo-btn ${ativa?.id === o.id ? 'correta' : ''}`} onClick={() => setAtiva(o)}>
            +{o.passos}
          </button>
        ))}
      </div>
      {ativa ? (
        <>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'white', marginBottom: 10 }}>
            {ativa.tabuada} × {ativa.multiplicador} = ?
          </div>
          <input type="number" inputMode="numeric" pattern="[0-9]*" className="tq-input"
            value={resposta} onChange={e => setResposta(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && confirmar()} autoFocus placeholder="Resposta" />
          <TecladoNumerico onInput={n => setResposta(r => r + n)} onDelete={() => setResposta(r => r.slice(0, -1))}
            onClear={() => setResposta('')} onSubmit={confirmar} />
        </>
      ) : (
        <div className="tq-mini-sub">Selecione uma rota para revelar o desafio.</div>
      )}
    </div>
  );
}

// ============================================================
//  MINIGAME: FORJA DE RUNAS
// ============================================================
function MiniJogoForja({ tabuadas, onComplete, playSound }) {
  const [fase, setFase] = useState('intro');
  const [tempo, setTempo] = useState(50);
  const [rodada, setRodada] = useState(1);
  const [receita, setReceita] = useState(null);
  const [resposta, setResposta] = useState('');
  const [acertosMini, setAcertosMini] = useState(0);
  const [errosMini, setErrosMini] = useState(0);
  const [combo, setCombo] = useState(0);
  const [comboMax, setComboMax] = useState(0);
  const [pontos, setPontos] = useState(0);
  const totalRodadas = 10;

  const gerarReceita = useCallback(() => {
    const t1 = tabuadas[Math.floor(Math.random() * tabuadas.length)];
    const t2 = tabuadas[Math.floor(Math.random() * tabuadas.length)];
    const m1 = Math.floor(Math.random() * 10) + 1;
    const m2 = Math.floor(Math.random() * 10) + 1;
    const r1 = t1 * m1;
    const r2 = t2 * m2;
    return { t1, m1, r1, t2, m2, r2, total: r1 + r2 };
  }, [tabuadas]);

  useEffect(() => {
    if (fase === 'intro') {
      playSound('minigame');
      const t = setTimeout(() => { setFase('jogando'); setReceita(gerarReceita()); }, 1800);
      return () => clearTimeout(t);
    }
  }, [fase, gerarReceita, playSound]);

  useEffect(() => {
    if (fase !== 'jogando') return;
    if (tempo <= 0 || rodada > totalRodadas) { setFase('resultado'); return; }
    const iv = setInterval(() => setTempo(t => t - 1), 1000);
    return () => clearInterval(iv);
  }, [fase, tempo, rodada]);

  const confirmar = () => {
    if (!resposta || !receita) return;
    const val = parseInt(resposta, 10);
    if (val === receita.total) {
      playSound(combo >= 2 ? 'combo' : 'acerto');
      const novoCombo = combo + 1;
      const ganho = 12 + (novoCombo * 4);
      setAcertosMini(a => a + 1);
      setCombo(novoCombo);
      setComboMax(m => Math.max(m, novoCombo));
      setPontos(p => p + ganho);
    } else {
      playSound('erro');
      setErrosMini(e => e + 1);
      setCombo(0);
    }
    setRodada(r => r + 1);
    setReceita(gerarReceita());
    setResposta('');
  };

  if (fase === 'intro') {
    return (
      <div className="tq-mini-center">
        <div style={{ fontSize: '4rem' }}>⚒️</div>
        <div className="tq-mini-title" style={{ color: '#f97316' }}>FORJA DE RUNAS</div>
        <div className="tq-mini-sub">Combine duas runas e forje o total!</div>
        <MiniHowTo text="resolva as duas multiplicações e some os resultados." />
      </div>
    );
  }

  if (fase === 'resultado') {
    const xp = pontos + (comboMax * 8);
    return (
      <div className="tq-mini-center">
        {acertosMini >= 7 && <Confetti />}
        <div style={{ fontSize: '4rem' }}>{acertosMini >= 7 ? '🗡️' : '⚒️'}</div>
        <div className="tq-mini-title">Forja Finalizada!</div>
        <div className="tq-mini-sub">Rodadas certas: {acertosMini}/{Math.min(totalRodadas, rodada - 1)} • Combo máx: {comboMax}</div>
        <button className="tq-btn-primary" onClick={() => onComplete({
          xp, acertosMini, errosMini, tempoSeg: 50 - Math.max(0, tempo), comboMax, eventos: { pontosBase: pontos },
        })} style={{ marginTop: 16 }}>
          Continuar (+{xp} XP)
        </button>
      </div>
    );
  }

  return (
    <div className="tq-mini-top">
      <div className="tq-crazy-header">
        <div className="tq-pill">⏱️ {tempo}s</div>
        <div className="tq-pill">Rodada {Math.min(rodada, totalRodadas)}/{totalRodadas}</div>
        <div className="tq-pill">🔥 {combo}</div>
      </div>
      {receita && (
        <>
          <div className="tq-mini-sub" style={{ marginBottom: 8 }}>Some as duas runas:</div>
          <div style={{ fontSize: '2rem', color: 'white', fontWeight: 800, marginBottom: 6 }}>
            ({receita.t1} × {receita.m1}) + ({receita.t2} × {receita.m2})
          </div>
          <div style={{ color: 'rgba(255,255,255,0.55)', marginBottom: 12 }}>Resultado total da forja</div>
        </>
      )}
      <input type="number" inputMode="numeric" pattern="[0-9]*" className="tq-input"
        value={resposta} onChange={e => setResposta(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && confirmar()} autoFocus placeholder="Total" />
      <TecladoNumerico onInput={n => setResposta(r => r + n)} onDelete={() => setResposta(r => r.slice(0, -1))}
        onClear={() => setResposta('')} onSubmit={confirmar} />
    </div>
  );
}

// ============================================================
//  MINIGAME: ESCUDO DA VILA
// ============================================================
function MiniJogoEscudo({ tabuadas, onComplete, playSound }) {
  const [fase, setFase] = useState('intro');
  const [tempo, setTempo] = useState(45);
  const [vidas, setVidas] = useState(3);
  const [faixas, setFaixas] = useState([]);
  const [resposta, setResposta] = useState('');
  const [acertosMini, setAcertosMini] = useState(0);
  const [errosMini, setErrosMini] = useState(0);
  const [pontos, setPontos] = useState(0);

  const novaFaixa = useCallback((id) => {
    const t = tabuadas[Math.floor(Math.random() * tabuadas.length)];
    const m = Math.floor(Math.random() * 10) + 1;
    return { id, tabuada: t, multiplicador: m, resposta: t * m, perigo: 6 };
  }, [tabuadas]);

  useEffect(() => {
    if (fase === 'intro') {
      playSound('minigame');
      const t = setTimeout(() => {
        setFase('jogando');
        setFaixas([novaFaixa(0), novaFaixa(1), novaFaixa(2)]);
      }, 1800);
      return () => clearTimeout(t);
    }
  }, [fase, novaFaixa, playSound]);

  useEffect(() => {
    if (fase !== 'jogando') return;
    if (tempo <= 0 || vidas <= 0) { setFase('resultado'); return; }
    const iv = setInterval(() => {
      setTempo(t => t - 1);
      setFaixas(prev => prev.map(f => ({ ...f, perigo: f.perigo - 1 })));
    }, 1000);
    return () => clearInterval(iv);
  }, [fase, tempo, vidas]);

  useEffect(() => {
    if (fase !== 'jogando') return;
    const estourou = faixas.filter(f => f.perigo <= 0);
    if (estourou.length === 0) return;
    playSound('explosion');
    setErrosMini(e => e + estourou.length);
    setVidas(v => Math.max(0, v - estourou.length));
    setFaixas(prev => prev.map(f => (f.perigo <= 0 ? novaFaixa(f.id) : f)));
  }, [faixas, fase, novaFaixa, playSound]);

  const defender = () => {
    if (!resposta) return;
    const val = parseInt(resposta, 10);
    const alvo = faixas.find(f => f.resposta === val);
    if (alvo) {
      playSound('hit');
      setAcertosMini(a => a + 1);
      setPontos(p => p + 14 + Math.max(0, 6 - alvo.perigo));
      setFaixas(prev => prev.map(f => (f.id === alvo.id ? novaFaixa(f.id) : f)));
    } else {
      playSound('erro');
      setErrosMini(e => e + 1);
    }
    setResposta('');
  };

  if (fase === 'intro') {
    return (
      <div className="tq-mini-center">
        <div style={{ fontSize: '4rem' }}>🛡️</div>
        <div className="tq-mini-title" style={{ color: '#22c55e' }}>ESCUDO DA VILA</div>
        <div className="tq-mini-sub">Defenda as 3 faixas antes que o ataque chegue!</div>
        <MiniHowTo text="cada faixa tem uma conta e um contador; responda para bloquear." />
      </div>
    );
  }

  if (fase === 'resultado') {
    const xp = pontos + (vidas * 12);
    return (
      <div className="tq-mini-center">
        {vidas > 0 && <Confetti />}
        <div style={{ fontSize: '4rem' }}>{vidas > 0 ? '🏰' : '🔥'}</div>
        <div className="tq-mini-title">{vidas > 0 ? 'Vila Defendida!' : 'A Vila Caiu!'}</div>
        <div className="tq-mini-sub">Bloqueios: {acertosMini} • Erros: {errosMini}</div>
        <button className="tq-btn-primary" onClick={() => onComplete({
          xp, acertosMini, errosMini, tempoSeg: 45 - Math.max(0, tempo), comboMax: 0, eventos: { vidasRestantes: vidas },
        })} style={{ marginTop: 16 }}>
          Continuar (+{xp} XP)
        </button>
      </div>
    );
  }

  return (
    <div className="tq-mini-top">
      <div className="tq-crazy-header">
        <div className="tq-pill">⏱️ {tempo}s</div>
        <div className="tq-pill">🛡️ {acertosMini}</div>
        <div className="tq-pill">{'❤️'.repeat(Math.max(0, vidas))}{'🖤'.repeat(Math.max(0, 3 - vidas))}</div>
      </div>
      <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
        {faixas.map((f) => (
          <div key={f.id} style={{
            background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 12px',
            border: `1px solid ${f.perigo <= 2 ? 'rgba(244,63,94,0.7)' : 'rgba(255,255,255,0.1)'}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'white', fontWeight: 700 }}>
              <span>Faixa {f.id + 1}: {f.tabuada} × {f.multiplicador}</span>
              <span style={{ color: f.perigo <= 2 ? '#fb7185' : '#a7f3d0' }}>⚠️ {f.perigo}</span>
            </div>
          </div>
        ))}
      </div>
      <input type="number" inputMode="numeric" pattern="[0-9]*" className="tq-input"
        value={resposta} onChange={e => setResposta(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && defender()} autoFocus placeholder="Digite para bloquear" />
      <TecladoNumerico onInput={n => setResposta(r => r + n)} onDelete={() => setResposta(r => r.slice(0, -1))}
        onClear={() => setResposta('')} onSubmit={defender} />
    </div>
  );
}

const MINIGAME_REGISTRY = [
  { id: 'crazy', familia: 'digitacao', baseWeight: 1, randomEligible: true, componente: MiniJogoCrazyTime },
  { id: 'historia', familia: 'estrategia', baseWeight: 0.9, randomEligible: true, componente: MiniJogoHistoria },
  { id: 'alvo', familia: 'escolha', baseWeight: 1, randomEligible: true, componente: MiniJogoAlvo },
  { id: 'sequencia', familia: 'escolha', baseWeight: 0.9, randomEligible: true, componente: MiniJogoSequencia },
  { id: 'meteoro', familia: 'digitacao', baseWeight: 1, randomEligible: true, componente: MiniJogoMeteoro },
  { id: 'memoria', familia: 'estrategia', baseWeight: 0.85, randomEligible: true, componente: MiniJogoMemoria },
  { id: 'duelo', familia: 'digitacao', baseWeight: 1, randomEligible: true, componente: MiniJogoDuelo },
  { id: 'trilha', familia: 'estrategia', baseWeight: 1.1, randomEligible: true, componente: MiniJogoTrilha },
  { id: 'forja', familia: 'digitacao', baseWeight: 1.1, randomEligible: true, componente: MiniJogoForja },
  { id: 'escudo', familia: 'estrategia', baseWeight: 1.1, randomEligible: true, componente: MiniJogoEscudo },
  { id: 'boss', familia: 'boss', baseWeight: 0, randomEligible: false, componente: MiniJogoBoss },
];

const MINIGAME_BY_ID = Object.fromEntries(MINIGAME_REGISTRY.map((m) => [m.id, m]));

// ============================================================
//  TELA INICIAL
// ============================================================
function TelaInicial({ onIniciar, licoesCompletas, conquistasDesbloqueadas, pontuacaoTotal, streak, rankingCorridas }) {
  const [selecionadas, setSelecionadas] = useState([2, 3, 4, 5, 6, 7, 8, 9]);
  const [mostrarConquistas, setMostrarConquistas] = useState(false);
  const [modoTempo, setModoTempo] = useState(true);
  const [metaAcertos, setMetaAcertos] = useState(DEFAULT_META_ACERTOS);

  const metasRapidas = [50, 100, 150, 200, 300];
  const rankingTop = rankingCorridas.slice(0, 5);

  const toggleTabuada = (n) => {
    if (selecionadas.includes(n)) {
      if (selecionadas.length > 1) setSelecionadas(selecionadas.filter(t => t !== n));
    } else {
      setSelecionadas([...selecionadas, n].sort((a, b) => a - b));
    }
  };

  return (
    <div className="tq-home">
      <div className="tq-home-bg-orbs">
        <div className="tq-orb tq-orb-1" />
        <div className="tq-orb tq-orb-2" />
        <div className="tq-orb tq-orb-3" />
      </div>

      <div className="tq-home-card">
        {/* Header */}
        <div className="tq-home-header">
          <div style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 4px 12px rgba(99,102,241,0.4))' }}>🧮</div>
          <h1 className="tq-title">Tabuada Quest</h1>
          <div className="tq-subtitle">A Aventura da Multiplicação</div>
        </div>

        {/* XP & Rank */}
        <XPBar xp={pontuacaoTotal} />

        {/* Streak */}
        {streak > 0 && <DailyStreak streak={streak} />}

        {/* Quick Stats */}
        <div className="tq-stats-row">
          {licoesCompletas > 0 && <div className="tq-stat-pill green">🎓 {licoesCompletas} {licoesCompletas === 1 ? 'lição' : 'lições'}</div>}
          <button className="tq-stat-pill gold" onClick={() => setMostrarConquistas(true)}>
            🏆 {Object.keys(conquistasDesbloqueadas).length}/{Object.keys(CONQUISTAS).length}
          </button>
        </div>

        {/* Tabuada selection */}
        <div className="tq-section-label">Escolha as tabuadas:</div>
        <div className="tq-grid">
          {[1,2,3,4,5,6,7,8,9,10].map(n => (
            <button key={n} className={`tq-grid-btn ${selecionadas.includes(n) ? 'active' : ''}`}
              onClick={() => toggleTabuada(n)}>{n}</button>
          ))}
        </div>
        <div className="tq-quick-btns">
          <button className="tq-small-btn" onClick={() => setSelecionadas([1,2,3,4,5,6,7,8,9,10])}>Todas</button>
          <button className="tq-small-btn outline" onClick={() => setSelecionadas([6,7,8,9])}>Difíceis</button>
          <button className="tq-small-btn outline" onClick={() => setSelecionadas([1])}>Limpar</button>
        </div>

        <label className="tq-toggle-row">
          <input type="checkbox" checked={modoTempo} onChange={e => setModoTempo(e.target.checked)} />
          <span>⏱️ Modo Tempo (bônus por velocidade)</span>
        </label>

        <div className="tq-section-label">Meta de exercícios:</div>
        <div className="tq-quick-btns">
          {metasRapidas.map(v => (
            <button key={v}
              className={`tq-small-btn ${metaAcertos === v ? '' : 'outline'}`}
              onClick={() => setMetaAcertos(v)}>
              {v}
            </button>
          ))}
        </div>
        <input
          type="number"
          className="tq-meta-input"
          min={MIN_META_ACERTOS}
          max={MAX_META_ACERTOS}
          value={metaAcertos}
          onChange={e => {
            const n = parseInt(e.target.value || `${MIN_META_ACERTOS}`, 10);
            setMetaAcertos(Math.min(MAX_META_ACERTOS, Math.max(MIN_META_ACERTOS, Number.isNaN(n) ? MIN_META_ACERTOS : n)));
          }}
        />

        <button
          className="tq-btn-primary big"
          onClick={() => onIniciar(selecionadas, modoTempo, metaAcertos)}>
          🚀 Começar Aventura!
        </button>

        <p className="tq-meta">{metaAcertos} acertos • níveis por progresso • minijogos aleatórios • Boss por marco</p>

        <div className="tq-ranking-box">
          <div className="tq-ranking-title">🏁 Ranking das Corridas</div>
          {rankingTop.length === 0 ? (
            <div className="tq-ranking-empty">Nenhuma corrida finalizada ainda.</div>
          ) : (
            rankingTop.map((r, idx) => (
              <div key={r.id} className="tq-ranking-row">
                <span>#{idx + 1}</span>
                <span>{r.pontos} XP</span>
                <span>{r.precisao}%</span>
                <span>{r.acertos}/{r.metaAcertos}</span>
                <span>{formatarDuracao(r.duracaoSeg)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Conquistas */}
      {mostrarConquistas && (
        <div className="tq-modal-overlay" onClick={() => setMostrarConquistas(false)}>
          <div className="tq-modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ textAlign: 'center', marginBottom: 16 }}>🏆 Conquistas</h2>
            <div className="tq-conquistas-list">
              {Object.values(CONQUISTAS).map(c => {
                const unlocked = conquistasDesbloqueadas[c.id];
                return (
                  <div key={c.id} className={`tq-conquista-row ${unlocked ? 'unlocked' : ''}`}>
                    <span style={{ fontSize: '1.5rem' }}>{c.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{c.nome}</div>
                      <div style={{ fontSize: '0.75rem', color: '#888' }}>{c.desc}</div>
                    </div>
                    {unlocked && <span>✅</span>}
                  </div>
                );
              })}
            </div>
            <button className="tq-btn-primary" onClick={() => setMostrarConquistas(false)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
//  TELA DO JOGO
// ============================================================
function TelaJogo({ tabuadas, modoTempo, metaAcertos, onVoltar, onLicaoCompleta, conquistasDesbloqueadas, onNovaConquista, xpTotal }) {
  const [pergunta, setPergunta] = useState(null);
  const [resposta, setResposta] = useState('');
  const [acertos, setAcertos] = useState(0);
  const [erros, setErros] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [sequenciaAcertos, setSequenciaAcertos] = useState(0);
  const [licaoConcluida, setLicaoConcluida] = useState(false);
  const [pontuacao, setPontuacao] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [tempoInicio, setTempoInicio] = useState(Date.now());
  const [tempoRestante, setTempoRestante] = useState(10);
  const [mascoteEstado, setMascoteEstado] = useState('normal');
  const [conquistaToast, setConquistaToast] = useState(null);
  const [conquistasCorrida, setConquistasCorrida] = useState([]);
  const [minijogo, setMinijogo] = useState(null);
  const [floatingPts, setFloatingPts] = useState(null);
  const [showBurst, setShowBurst] = useState(false);
  const [estatisticas, setEstatisticas] = useState({ porTabuada: {}, perguntasInvertidas: 0, historiasCompletas: 0 });
  const [posicaoRanking, setPosicaoRanking] = useState(null);
  const [miniStats, setMiniStats] = useState({
    sessoes: 0,
    aparicoesPorId: {},
    acertosPorId: {},
    errosPorId: {},
    tempoTotalPorId: {},
    vitoriasPorId: {},
  });

  const playSound = useSound();
  const inicioCorrida = useRef(Date.now());
  const ultimaPerguntaRef = useRef('');
  const ultimoMinijogoAcertos = useRef(0);
  const ultimoTipoMinijogo = useRef(null);
  const ultimaFamiliaMinijogo = useRef(null);
  const bossMarcosAtingidos = useRef(new Set());
  const bossJogouRef = useRef(false);
  const minijogosPendentesObrigatorios = useRef([]);
  const indiceMarcoObrigatorioRef = useRef(0);
  const minijogosAleatoriosDisparados = useRef(0);

  const bossMarcos = useMemo(() => {
    const marcos = [0.5, 0.85].map((p) => Math.max(1, Math.round(metaAcertos * p)));
    return Array.from(new Set(marcos)).sort((a, b) => a - b);
  }, [metaAcertos]);

  const randomMinigameIds = useMemo(() => (
    MINIGAME_REGISTRY.filter(m => m.randomEligible).map(m => m.id)
  ), []);

  const marcosObrigatoriosMinijogos = useMemo(() => (
    randomMinigameIds.map((_, i) => Math.max(1, Math.round(((i + 1) / (randomMinigameIds.length + 1)) * metaAcertos)))
  ), [metaAcertos, randomMinigameIds]);

  const metaMinijogosAleatorios = useMemo(() => (
    Math.max(1, Math.min(4, Math.round(metaAcertos / 80)))
  ), [metaAcertos]);

  useEffect(() => {
    minijogosPendentesObrigatorios.current = [...randomMinigameIds];
    indiceMarcoObrigatorioRef.current = 0;
    bossJogouRef.current = false;
  }, [randomMinigameIds, metaAcertos]);

  const anunciarConquista = useCallback((conquista, delay = 0) => {
    setTimeout(() => {
      setConquistaToast(conquista);
      setConquistasCorrida(prev => prev.some(c => c.id === conquista.id) ? prev : [...prev, conquista]);
      playSound('conquista');
      onNovaConquista(conquista.id);
    }, delay);
  }, [onNovaConquista, playSound]);

  const gerarPerguntaSemRepetir = useCallback((acertosAlvo) => {
    let p = gerarPergunta(tabuadas, acertosAlvo, metaAcertos);
    let tentativas = 0;
    while (tentativas < 20) {
      const sig = `${p.tabuada}x${p.multiplicador}|${p.tipo}`;
      if (sig !== ultimaPerguntaRef.current) break;
      p = gerarPergunta(tabuadas, acertosAlvo, metaAcertos);
      tentativas++;
    }
    ultimaPerguntaRef.current = `${p.tabuada}x${p.multiplicador}|${p.tipo}`;
    return p;
  }, [tabuadas, metaAcertos]);

  const escolherMinijogoPonderado = useCallback((idsDisponiveis) => {
    const candidatos = idsDisponiveis.map((id) => MINIGAME_BY_ID[id]).filter(Boolean);
    if (candidatos.length === 0) return null;

    const pesos = candidatos.map((m) => {
      let peso = m.baseWeight || 1;
      if (m.id === ultimoTipoMinijogo.current) peso *= 0.08;
      if (m.familia === ultimaFamiliaMinijogo.current) peso *= 0.55;
      const aparicoes = miniStats.aparicoesPorId[m.id] || 0;
      peso *= 1 / (1 + aparicoes * 0.35);
      const ac = miniStats.acertosPorId[m.id] || 0;
      const er = miniStats.errosPorId[m.id] || 0;
      const tentativas = ac + er;
      if (tentativas >= 6) {
        const taxa = ac / tentativas;
        if (taxa < 0.45) peso *= 1.25;
        if (taxa > 0.85) peso *= 0.85;
      }
      return Math.max(0.01, peso);
    });

    const total = pesos.reduce((s, p) => s + p, 0);
    let cursor = Math.random() * total;
    let escolhido = candidatos[0];
    for (let i = 0; i < candidatos.length; i++) {
      cursor -= pesos[i];
      if (cursor <= 0) { escolhido = candidatos[i]; break; }
    }
    return escolhido;
  }, [miniStats]);

  const novaPergunta = useCallback(() => {
    setPergunta(gerarPerguntaSemRepetir(acertos));
    setResposta(''); setFeedback(null);
    setTempoInicio(Date.now()); setTempoRestante(10);
  }, [acertos, gerarPerguntaSemRepetir]);

  const verificarMinijogo = useCallback((novosAcertos) => {
    const progresso = metaAcertos > 0 ? novosAcertos / metaAcertos : 0;
    const cooldown = Math.max(5, Math.round(metaAcertos * 0.06));

    const bossPendente = bossMarcos.find((m) => novosAcertos >= m && !bossMarcosAtingidos.current.has(m));
    if (bossPendente !== undefined) {
      bossMarcosAtingidos.current.add(bossPendente);
      bossJogouRef.current = true;
      ultimoMinijogoAcertos.current = novosAcertos;
      ultimoTipoMinijogo.current = 'boss';
      ultimaFamiliaMinijogo.current = 'boss';
      return 'boss';
    }

    const idxMarco = indiceMarcoObrigatorioRef.current;
    const marcoObrigatorio = marcosObrigatoriosMinijogos[idxMarco];
    if (minijogosPendentesObrigatorios.current.length > 0 && marcoObrigatorio !== undefined && novosAcertos >= marcoObrigatorio) {
      const escolhidoObrigatorio = escolherMinijogoPonderado(minijogosPendentesObrigatorios.current);
      if (escolhidoObrigatorio) {
        minijogosPendentesObrigatorios.current = minijogosPendentesObrigatorios.current.filter(id => id !== escolhidoObrigatorio.id);
        indiceMarcoObrigatorioRef.current = idxMarco + 1;
        ultimoMinijogoAcertos.current = novosAcertos;
        ultimoTipoMinijogo.current = escolhidoObrigatorio.id;
        ultimaFamiliaMinijogo.current = escolhidoObrigatorio.familia;
        return escolhidoObrigatorio.id;
      }
    }

    if (novosAcertos - ultimoMinijogoAcertos.current < cooldown) return false;

    if (progresso < 0.08 || progresso > 0.96) return false;
    if (minijogosAleatoriosDisparados.current >= metaMinijogosAleatorios) return false;

    const restantes = Math.max(1, metaAcertos - novosAcertos);
    const faltantes = Math.max(0, metaMinijogosAleatorios - minijogosAleatoriosDisparados.current);
    const chanceBase = (faltantes / restantes) * Math.max(1, metaAcertos / 80);
    const chance = Math.min(0.24, chanceBase * 1.9);
    if (Math.random() >= chance) return false;

    const idsNaoObrigatorios = randomMinigameIds.filter(id => !minijogosPendentesObrigatorios.current.includes(id));
    const escolhido = escolherMinijogoPonderado(idsNaoObrigatorios.length > 0 ? idsNaoObrigatorios : randomMinigameIds);
    if (!escolhido) return false;

    minijogosAleatoriosDisparados.current += 1;
    ultimoMinijogoAcertos.current = novosAcertos;
    ultimoTipoMinijogo.current = escolhido.id;
    ultimaFamiliaMinijogo.current = escolhido.familia;
    return escolhido.id;
  }, [bossMarcos, escolherMinijogoPonderado, marcosObrigatoriosMinijogos, metaAcertos, metaMinijogosAleatorios, randomMinigameIds]);

  useEffect(() => { novaPergunta(); }, []);

  // Timer
  useEffect(() => {
    if (!modoTempo || !pergunta || feedback || minijogo) return;
    const interval = setInterval(() => {
      const elapsed = (Date.now() - tempoInicio) / 1000;
      setTempoRestante(Math.max(0, 10 - elapsed));
    }, 100);
    return () => clearInterval(interval);
  }, [modoTempo, pergunta, feedback, tempoInicio, minijogo]);

  // Conclusão
  useEffect(() => {
    const obrigatoriosOK = minijogosPendentesObrigatorios.current.length === 0 && bossJogouRef.current;
    if (acertos >= metaAcertos && obrigatoriosOK && !licaoConcluida) {
      setLicaoConcluida(true); playSound('conquista');
      if (!conquistasDesbloqueadas.primeiraLicao) {
        anunciarConquista(CONQUISTAS.primeiraLicao, 300);
      }
      if (erros === 0 && !conquistasDesbloqueadas.semErros) {
        anunciarConquista(CONQUISTAS.semErros, 1900);
      }
      const precisao = acertos + erros > 0 ? Math.round((acertos / (acertos + erros)) * 100) : 0;
      const duracaoSeg = (Date.now() - inicioCorrida.current) / 1000;
      const variedadeMini = Object.keys(miniStats.aparicoesPorId || {}).length;
      const posicao = onLicaoCompleta({ pontos: pontuacao, acertos, erros, metaAcertos, precisao, duracaoSeg, variedadeMini });
      setPosicaoRanking(posicao || null);
    }
  }, [acertos, licaoConcluida, metaAcertos, pontuacao, erros, conquistasDesbloqueadas, anunciarConquista, onLicaoCompleta, playSound, miniStats]);

  const verificarConquistas = useCallback((dados) => {
    const { seq, tempoResposta, tabuadaAcertada, tipoInvertido } = dados;
    const novas = [];
    if (seq >= 5 && !conquistasDesbloqueadas.seq5) novas.push(CONQUISTAS.seq5);
    if (seq >= 10 && !conquistasDesbloqueadas.seq10) novas.push(CONQUISTAS.seq10);
    if (seq >= 20 && !conquistasDesbloqueadas.seq20) novas.push(CONQUISTAS.seq20);
    if (seq >= 50 && !conquistasDesbloqueadas.seq50) novas.push(CONQUISTAS.seq50);
    if (tempoResposta < 2 && !conquistasDesbloqueadas.velocista) novas.push(CONQUISTAS.velocista);
    if (tempoResposta < 1 && !conquistasDesbloqueadas.relampago) novas.push(CONQUISTAS.relampago);

    const stats = { ...estatisticas };
    if (tabuadaAcertada) {
      stats.porTabuada[tabuadaAcertada] = (stats.porTabuada[tabuadaAcertada] || 0) + 1;
      [6,7,8,9].forEach(n => {
        if (stats.porTabuada[n] >= 50 && !conquistasDesbloqueadas[`mestre${n}`]) novas.push(CONQUISTAS[`mestre${n}`]);
      });
    }
    if (tipoInvertido) {
      stats.perguntasInvertidas = (stats.perguntasInvertidas || 0) + 1;
      if (stats.perguntasInvertidas >= 20 && !conquistasDesbloqueadas.detective) novas.push(CONQUISTAS.detective);
    }
    setEstatisticas(stats);

    const totalConquistas = Object.keys(conquistasDesbloqueadas).length + novas.length;
    if (totalConquistas >= 10 && !conquistasDesbloqueadas.collector) novas.push(CONQUISTAS.collector);

    novas.forEach((c, i) => anunciarConquista(c, i * 1700));
  }, [conquistasDesbloqueadas, estatisticas, anunciarConquista]);

  const verificarResposta = () => {
    if (resposta.trim() === '') return;
    const respostaNum = parseInt(resposta);
    const tempoResposta = (Date.now() - tempoInicio) / 1000;

    if (respostaNum === pergunta.resposta) {
      let pontosBase = 10;
      let bonusTempo = modoTempo && tempoResposta < 10 ? Math.floor((10 - tempoResposta) * 5) : 0;
      const novoCombo = Math.min(5, 1 + Math.floor(sequenciaAcertos / 3));
      const pontosGanhos = (pontosBase + bonusTempo) * novoCombo;

      setComboMultiplier(novoCombo);
      setPontuacao(p => p + pontosGanhos);
      setFeedback({ tipo: 'correto', pontos: pontosGanhos });
      setAcertos(a => a + 1);
      const novaSeq = sequenciaAcertos + 1;
      setSequenciaAcertos(novaSeq);
      setShowBurst(true); setTimeout(() => setShowBurst(false), 600);
      setFloatingPts(pontosGanhos); setTimeout(() => setFloatingPts(null), 1000);

      if (novaSeq >= 10) setMascoteEstado('foguete');
      else if (novaSeq >= 5) setMascoteEstado('muitoFeliz');
      else setMascoteEstado('feliz');

      if (novoCombo > comboMultiplier && novoCombo >= 2) playSound('combo');
      else playSound('acerto');

      verificarConquistas({ seq: novaSeq, tempoResposta, tabuadaAcertada: pergunta.tabuada, tipoInvertido: pergunta.tipo !== 'normal' });

      const jogoSorteado = verificarMinijogo(acertos + 1);
      setTimeout(() => {
        if (jogoSorteado) setMinijogo(jogoSorteado);
        else { setPergunta(gerarPerguntaSemRepetir(acertos + 1)); setResposta(''); setFeedback(null); setTempoInicio(Date.now()); setTempoRestante(10); }
      }, 700);
    } else {
      setFeedback({ tipo: 'errado', correta: pergunta.resultado });
      setErros(e => e + 1); setSequenciaAcertos(0); setComboMultiplier(1);
      setMascoteEstado('triste'); playSound('erro');
      setTimeout(() => { setResposta(''); setFeedback(null); setTempoInicio(Date.now()); setTempoRestante(10); }, 1500);
    }
  };

  const finalizarMinijogo = (result) => {
    const payload = normalizeMiniResult(result);
    const miniId = minijogo;
    const miniMeta = MINIGAME_BY_ID[miniId];
    setPontuacao(p => p + payload.xp);

    let nextMiniStats = null;
    setMiniStats(prev => {
      const ac = prev.acertosPorId[miniId] || 0;
      const er = prev.errosPorId[miniId] || 0;
      const ap = prev.aparicoesPorId[miniId] || 0;
      const tm = prev.tempoTotalPorId[miniId] || 0;
      const vc = prev.vitoriasPorId[miniId] || 0;
      nextMiniStats = {
        ...prev,
        sessoes: prev.sessoes + 1,
        aparicoesPorId: { ...prev.aparicoesPorId, [miniId]: ap + 1 },
        acertosPorId: { ...prev.acertosPorId, [miniId]: ac + payload.acertosMini },
        errosPorId: { ...prev.errosPorId, [miniId]: er + payload.errosMini },
        tempoTotalPorId: { ...prev.tempoTotalPorId, [miniId]: tm + payload.tempoSeg },
        vitoriasPorId: { ...prev.vitoriasPorId, [miniId]: vc + (payload.xp > 0 ? 1 : 0) },
      };
      return nextMiniStats;
    });

    if (miniId === 'boss' && !conquistasDesbloqueadas.bossSlayer && payload.xp >= 40) {
      anunciarConquista(CONQUISTAS.bossSlayer, 200);
    }
    if (miniId === 'memoria' && !conquistasDesbloqueadas.memoryKing && payload.xp >= 30) {
      anunciarConquista(CONQUISTAS.memoryKing, 200);
    }
    if (miniId === 'meteoro' && !conquistasDesbloqueadas.meteorPro) {
      const destruidos = (nextMiniStats?.acertosPorId?.meteoro || 0);
      if (destruidos >= 20) anunciarConquista(CONQUISTAS.meteorPro, 200);
    }
    if (miniId === 'duelo' && !conquistasDesbloqueadas.duelo10) {
      const vitoriasDuelo = (nextMiniStats?.vitoriasPorId?.duelo || 0);
      if (vitoriasDuelo >= 10) anunciarConquista(CONQUISTAS.duelo10, 200);
    }
    if (miniId === 'historia' && !conquistasDesbloqueadas.contador) {
      const historias = (nextMiniStats?.vitoriasPorId?.historia || 0);
      if (historias >= 10) anunciarConquista(CONQUISTAS.contador, 200);
    }
    if (miniId === 'crazy' && !conquistasDesbloqueadas.crazyMaster && payload.acertosMini >= 15) {
      anunciarConquista(CONQUISTAS.crazyMaster, 200);
    }

    if (miniMeta) {
      ultimoTipoMinijogo.current = miniMeta.id;
      ultimaFamiliaMinijogo.current = miniMeta.familia;
    }
    setMinijogo(null);
    novaPergunta();
  };

  const nivelAtual = getNivelAtual(acertos, metaAcertos);
  const progresso = (acertos / metaAcertos) * 100;

  // Render minigame
  if (minijogo) {
    const props = { tabuadas, onComplete: finalizarMinijogo, playSound };
    const MiniComp = MINIGAME_BY_ID[minijogo]?.componente;
    return (
      <div className="tq-game">
        {conquistaToast && <ConquistaToast conquista={conquistaToast} onClose={() => setConquistaToast(null)} />}
        <TrophyRail conquistas={conquistasCorrida} />
        {MiniComp ? <MiniComp {...props} /> : <MiniJogoAlvo {...props} />}
      </div>
    );
  }

  // Completion screen
  if (licaoConcluida) {
    const precisao = acertos + erros > 0 ? Math.round((acertos / (acertos + erros)) * 100) : 0;
    return (
      <div className="tq-game" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Confetti />
        {conquistaToast && <ConquistaToast conquista={conquistaToast} onClose={() => setConquistaToast(null)} />}
        <TrophyRail conquistas={conquistasCorrida} />
        <div className="tq-completion-card">
          <div style={{ fontSize: '4rem', marginBottom: 8 }}>🏆</div>
          <h1 className="tq-title">Parabéns!</h1>
          <div style={{ color: '#888', marginBottom: 16 }}>Lição Completa!</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fbbf24', marginBottom: 20 }}>+{pontuacao.toLocaleString()} XP</div>
          <div className="tq-completion-stats">
            <div className="tq-comp-stat"><div className="tq-comp-val green">{acertos}</div><div className="tq-comp-label">Acertos</div></div>
            <div className="tq-comp-stat"><div className="tq-comp-val red">{erros}</div><div className="tq-comp-label">Erros</div></div>
            <div className="tq-comp-stat"><div className="tq-comp-val blue">{precisao}%</div><div className="tq-comp-label">Precisão</div></div>
          </div>
          {posicaoRanking && <div style={{ marginBottom: 12, color: '#fbbf24', fontWeight: 700 }}>Posição no ranking: #{posicaoRanking}</div>}
          <button className="tq-btn-primary" onClick={onVoltar}>🏠 Voltar ao Início</button>
        </div>
      </div>
    );
  }

  // Main game screen
  return (
    <div className="tq-game">
      {conquistaToast && <ConquistaToast conquista={conquistaToast} onClose={() => setConquistaToast(null)} />}
      {floatingPts && <FloatingPoints points={floatingPts} />}
      <TrophyRail conquistas={conquistasCorrida} />

      {/* Header */}
      <div className="tq-game-header">
        <button className="tq-back-btn" onClick={onVoltar}>←</button>
        <XPBar xp={xpTotal + pontuacao} compact />
        <div className="tq-pill small">✅{acertos} ❌{erros}</div>
      </div>

      {/* Progress */}
      <div className="tq-progress-bar">
        <div className="tq-progress-fill" style={{ width: `${progresso}%` }} />
        <span className="tq-progress-text">{acertos}/{metaAcertos} • {niveis[nivelAtual].nome}</span>
      </div>

      {/* Timer */}
      {modoTempo && (
        <div className={`tq-timer-track ${tempoRestante < 3 ? 'urgent' : ''}`}>
          <div className="tq-timer-fill-game" style={{ width: `${(tempoRestante / 10) * 100}%` }} />
        </div>
      )}

      {/* Mascote */}
      <Mascote estado={mascoteEstado} compact />

      {/* Question card */}
      {pergunta && (
        <div className="tq-question-card" style={{ position: 'relative' }}>
          {showBurst && <ParticleBurst color={comboMultiplier >= 3 ? '#FFE66D' : '#4ECDC4'} />}
          
          {comboMultiplier > 1 && (
            <div className={`tq-combo combo-${Math.min(comboMultiplier, 5)}`}>🔥 x{comboMultiplier}</div>
          )}
          {sequenciaAcertos >= 3 && (
            <div className="tq-streak-inline">{sequenciaAcertos} seguidos! 🎯</div>
          )}

          <div className="tq-question-text">
            <span className={pergunta.tipo === 'fatorA' ? 'highlight-red' : ''}>{pergunta.textoA}</span>
            <span className="op">×</span>
            <span className={pergunta.tipo === 'fatorB' ? 'highlight-red' : ''}>{pergunta.textoB}</span>
            <span className="op">=</span>
            <span className={pergunta.tipo === 'normal' ? 'highlight-red' : 'highlight-green'}>{pergunta.textoResultado}</span>
          </div>

          {pergunta.tipo !== 'normal' && <div className="tq-hint">🔍 Descubra o número!</div>}

          <input type="number" inputMode="numeric" pattern="[0-9]*"
            className={`tq-input-card ${feedback ? feedback.tipo : ''}`}
            value={resposta} onChange={e => setResposta(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && verificarResposta()}
            autoFocus placeholder="?" disabled={!!feedback} />

          {feedback && (
            <div className={`tq-feedback ${feedback.tipo}`}>
              {feedback.tipo === 'correto' ? <>✅ +{feedback.pontos} XP</> :
                <>❌ Era {pergunta.tabuada} × {pergunta.multiplicador} = {feedback.correta}</>}
            </div>
          )}
        </div>
      )}

      <TecladoNumerico
        onInput={n => !feedback && setResposta(r => r + n)}
        onDelete={() => !feedback && setResposta(r => r.slice(0, -1))}
        onClear={() => !feedback && setResposta('')}
        onSubmit={verificarResposta} disabled={!!feedback} />
    </div>
  );
}

// ============================================================
//  APP PRINCIPAL
// ============================================================
export default function TabuadaApp() {
  const [tela, setTela] = useState('inicial');
  const [tabuadasSelecionadas, setTabuadasSelecionadas] = useState([]);
  const [modoTempo, setModoTempo] = useState(true);
  const [metaAcertos, setMetaAcertos] = useState(DEFAULT_META_ACERTOS);
  const [licoesCompletas, setLicoesCompletas] = useState(0);
  const [pontuacaoTotal, setPontuacaoTotal] = useState(0);
  const [conquistasDesbloqueadas, setConquistasDesbloqueadas] = useState({});
  const [streak] = useState(1);
  const [rankingCorridas, setRankingCorridas] = useState(() => {
    try {
      const raw = localStorage.getItem('tq_ranking_corridas_v1');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('tq_ranking_corridas_v1', JSON.stringify(rankingCorridas));
  }, [rankingCorridas]);

  const iniciarJogo = (tabuadas, tempo, meta) => {
    const metaValida = Math.min(MAX_META_ACERTOS, Math.max(MIN_META_ACERTOS, meta || DEFAULT_META_ACERTOS));
    setTabuadasSelecionadas(tabuadas); setModoTempo(tempo); setMetaAcertos(metaValida); setTela('jogo');
  };
  const voltarInicio = () => setTela('inicial');
  const completarLicao = ({ pontos, acertos, erros, metaAcertos: metaDaCorrida, precisao, duracaoSeg, variedadeMini = 0 }) => {
    const registro = {
      id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      pontos,
      acertos,
      erros,
      metaAcertos: metaDaCorrida,
      precisao,
      duracaoSeg,
      variedadeMini,
      score: (pontos * 1000) + (precisao * 10) + (variedadeMini * 120) - Math.floor(duracaoSeg),
      dataISO: new Date().toISOString(),
    };
    setLicoesCompletas(l => l + 1);
    setPontuacaoTotal(p => p + pontos);
    let posicao = 1;
    setRankingCorridas(prev => {
      const lista = [...prev, registro].sort((a, b) => b.score - a.score).slice(0, 20);
      posicao = lista.findIndex(r => r.id === registro.id) + 1;
      return lista;
    });
    return posicao;
  };
  const adicionarConquista = (id) => { setConquistasDesbloqueadas(c => ({ ...c, [id]: true })); };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Lilita+One&display=swap" rel="stylesheet" />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
        body { font-family: 'Fredoka', sans-serif; overflow-x: hidden; user-select: none; background: #0a0a1a; }

        /* ---- Animations ---- */
        @keyframes confettiFall { to { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
        @keyframes floatUp { 0% { opacity: 1; transform: translateX(-50%) translateY(0); } 100% { opacity: 0; transform: translateX(-50%) translateY(-80px) scale(1.3); } }
        @keyframes slideDown { from { transform: translateX(-50%) translateY(-100px) scale(0.8); opacity: 0; } to { transform: translateX(-50%) translateY(0) scale(1); opacity: 1; } }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
        @keyframes bossPulse { 0%, 100% { transform: scale(1) rotate(-2deg); } 50% { transform: scale(1.15) rotate(2deg); } }
        @keyframes meteorFall { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(200px); opacity: 0.3; } }
        @keyframes particleBurst {
          0% { transform: translate(-50%, -50%); opacity: 1; }
          100% { transform: translate(calc(-50% + cos(var(--angle)) * var(--dist)), calc(-50% + sin(var(--angle)) * var(--dist))); opacity: 0; }
        }
        @keyframes orbFloat1 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(30px, -40px) scale(1.1); } }
        @keyframes orbFloat2 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-40px, 30px) scale(0.9); } }
        @keyframes orbFloat3 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(20px, 20px); } }
        @keyframes glowPulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
        @keyframes cardFlip { from { transform: rotateY(0); } to { transform: rotateY(180deg); } }
        @keyframes dmgFloat { 0% { opacity: 1; transform: translateY(0) scale(1); } 100% { opacity: 0; transform: translateY(-40px) scale(1.5); } }

        .tq-shake { animation: shake 0.3s ease; }
        .tq-shake-red { animation: shake 0.3s ease; filter: brightness(1.5) hue-rotate(330deg); }

        /* ---- Toast ---- */
        .tq-toast {
          position: fixed; top: 16px; left: 50%; transform: translateX(-50%);
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          border-radius: 16px; padding: 14px 22px;
          box-shadow: 0 8px 32px rgba(251,191,36,0.5);
          z-index: 1001; animation: slideDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          display: flex; align-items: center; gap: 12px; max-width: 92vw;
          overflow: hidden;
        }
        .tq-toast-glow {
          position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
          animation: glowPulse 1.5s ease infinite;
        }

        /* ---- Mascote ---- */
        .tq-mascote { display: flex; align-items: center; justify-content: center; transition: transform 0.3s; }
        .tq-mascote.feliz, .tq-mascote.muitoFeliz, .tq-mascote.venceu { animation: bounce 0.4s ease; }
        .tq-mascote.triste { animation: shake 0.4s ease; }
        .tq-mascote-emoji { font-size: 2.2rem; }

        /* ---- Teclado ---- */
        .tq-teclado { display: flex; flex-direction: column; gap: 7px; width: 100%; max-width: 280px; margin: 0 auto; }
        .tq-teclado-row { display: flex; gap: 7px; }
        .tq-tecla {
          flex: 1; height: 50px; border: none; border-radius: 14px;
          font-size: 1.3rem; font-weight: 600; font-family: inherit;
          background: rgba(255,255,255,0.92); color: #1a1a2e;
          cursor: pointer; box-shadow: 0 3px 8px rgba(0,0,0,0.15);
          transition: transform 0.1s, box-shadow 0.1s;
        }
        .tq-tecla:active { transform: scale(0.93); box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .tq-tecla.acao { background: rgba(255,255,255,0.5); font-size: 1.1rem; }
        .tq-tecla-confirmar {
          width: 100%; height: 48px; border: none; border-radius: 14px;
          font-size: 1.05rem; font-weight: 700; font-family: inherit;
          background: linear-gradient(135deg, #34d399 0%, #059669 100%);
          color: white; cursor: pointer; margin-top: 3px;
          box-shadow: 0 4px 12px rgba(52,211,153,0.4);
        }
        .tq-tecla-confirmar:active { transform: scale(0.97); }

        /* ---- Inputs ---- */
        .tq-input, .tq-input-card {
          width: 100%; max-width: 280px; padding: 12px; font-size: 1.8rem;
          text-align: center; border-radius: 14px; border: 3px solid rgba(255,255,255,0.2);
          outline: none; font-weight: 700; color: #1a1a2e; font-family: inherit;
          background: rgba(255,255,255,0.95); margin-bottom: 12px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .tq-input:focus, .tq-input-card:focus { border-color: #6366f1; box-shadow: 0 0 0 4px rgba(99,102,241,0.2); }
        .tq-input-card.correto { border-color: #34d399; background: rgba(52,211,153,0.1); }
        .tq-input-card.errado { border-color: #f43f5e; background: rgba(244,63,94,0.1); }
        .tq-input::placeholder, .tq-input-card::placeholder { color: #bbb; }
        .tq-input::-webkit-outer-spin-button, .tq-input::-webkit-inner-spin-button,
        .tq-input-card::-webkit-outer-spin-button, .tq-input-card::-webkit-inner-spin-button { -webkit-appearance: none; }
        .tq-input[type=number], .tq-input-card[type=number] { -moz-appearance: textfield; }

        /* ---- Pill / Badge ---- */
        .tq-pill {
          background: rgba(255,255,255,0.12); padding: 6px 14px; border-radius: 12px;
          color: white; font-weight: 600; font-size: 0.8rem;
          backdrop-filter: blur(4px);
        }
        .tq-pill.small { font-size: 0.75rem; padding: 4px 10px; }

        /* ---- Timer bar ---- */
        .tq-timer-bar { width: 100%; max-width: 340px; height: 7px; background: rgba(255,255,255,0.12); border-radius: 4px; overflow: hidden; margin: 0 auto 16px; }
        .tq-timer-fill { height: 100%; border-radius: 4px; transition: width 0.1s linear; background: linear-gradient(90deg, #34d399, #059669); }

        /* ---- Buttons ---- */
        .tq-btn-primary {
          width: 100%; max-width: 340px; padding: 16px; border: none; border-radius: 18px;
          font-size: 1.15rem; font-weight: 700; font-family: inherit;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
          color: white; cursor: pointer;
          box-shadow: 0 8px 28px rgba(99,102,241,0.4);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .tq-btn-primary:active { transform: scale(0.97); }
        .tq-btn-primary.big { padding: 18px; font-size: 1.25rem; }

        /* ============ HOME SCREEN ============ */
        .tq-home {
          min-height: 100vh; min-height: 100dvh;
          background: linear-gradient(150deg, #0a0a1a 0%, #0f172a 40%, #1e1b4b 100%);
          display: flex; align-items: center; justify-content: center;
          padding: 16px; position: relative; overflow: hidden;
        }
        .tq-home-bg-orbs { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
        .tq-orb {
          position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.3;
        }
        .tq-orb-1 { width: 300px; height: 300px; background: #6366f1; top: -100px; left: -50px; animation: orbFloat1 8s ease-in-out infinite; }
        .tq-orb-2 { width: 250px; height: 250px; background: #ec4899; bottom: -80px; right: -60px; animation: orbFloat2 10s ease-in-out infinite; }
        .tq-orb-3 { width: 200px; height: 200px; background: #06b6d4; top: 50%; left: 60%; animation: orbFloat3 12s ease-in-out infinite; }

        .tq-home-card {
          background: rgba(255,255,255,0.06); backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 28px; padding: 28px 22px; width: 100%; max-width: 420px;
          text-align: center; position: relative; z-index: 1;
          box-shadow: 0 24px 80px rgba(0,0,0,0.4);
        }
        .tq-home-header { margin-bottom: 20px; }
        .tq-title {
          font-family: 'Lilita One', cursive; font-size: 2rem; letter-spacing: 1px;
          background: linear-gradient(135deg, #818cf8, #c084fc, #f472b6);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          margin-bottom: 2px;
        }
        .tq-subtitle { color: rgba(255,255,255,0.5); font-size: 0.85rem; font-weight: 500; }

        /* XP Section */
        .tq-xp-section { margin-bottom: 16px; }
        .tq-rank-display { display: flex; align-items: center; gap: 10px; justify-content: center; margin-bottom: 8px; }
        .tq-xp-track { height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden; }
        .tq-xp-fill { height: 100%; border-radius: 4px; transition: width 0.5s ease; }

        .tq-xp-bar-compact { display: flex; align-items: center; gap: 6px; }
        .tq-xp-track-small { flex: 1; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden; }
        .tq-xp-fill-small { height: 100%; border-radius: 2px; transition: width 0.3s; }

        /* Streak */
        .tq-streak { margin-bottom: 16px; }
        .tq-streak-label { color: #fbbf24; font-weight: 700; font-size: 0.85rem; margin-bottom: 6px; }
        .tq-streak-dots { display: flex; justify-content: center; gap: 6px; }
        .tq-streak-dot { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: rgba(255,255,255,0.06); font-size: 0.7rem; color: rgba(255,255,255,0.3); }
        .tq-streak-dot.active { background: rgba(251,191,36,0.2); font-size: 0.85rem; }

        /* Stats row */
        .tq-stats-row { display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
        .tq-stat-pill {
          padding: 6px 14px; border-radius: 20px; font-size: 0.8rem; font-weight: 600;
          border: none; cursor: pointer; font-family: inherit;
        }
        .tq-stat-pill.green { background: linear-gradient(135deg, #34d399, #059669); color: white; }
        .tq-stat-pill.gold { background: linear-gradient(135deg, #fbbf24, #d97706); color: #1a1a2e; }

        .tq-section-label { color: rgba(255,255,255,0.6); font-size: 0.85rem; margin-bottom: 10px; font-weight: 500; }

        /* Grid tabuadas */
        .tq-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 12px; }
        .tq-grid-btn {
          aspect-ratio: 1; border-radius: 14px; border: 2px solid rgba(255,255,255,0.08);
          font-size: 1.15rem; font-weight: 700; font-family: inherit; cursor: pointer;
          background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.3);
          transition: all 0.2s;
        }
        .tq-grid-btn.active {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white; border-color: transparent;
          transform: scale(1.05); box-shadow: 0 4px 16px rgba(99,102,241,0.4);
        }

        .tq-quick-btns { display: flex; gap: 8px; justify-content: center; margin-bottom: 16px; }
        .tq-small-btn {
          padding: 7px 16px; border-radius: 20px; border: none; font-size: 0.8rem;
          font-weight: 600; font-family: inherit; cursor: pointer;
          background: #6366f1; color: white;
        }
        .tq-small-btn.outline { background: transparent; border: 2px solid rgba(99,102,241,0.5); color: #818cf8; }

        .tq-toggle-row {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          background: rgba(255,255,255,0.05); padding: 12px; border-radius: 14px;
          margin-bottom: 16px; cursor: pointer; font-size: 0.85rem; color: rgba(255,255,255,0.6);
        }
        .tq-toggle-row input { width: 18px; height: 18px; cursor: pointer; accent-color: #6366f1; }

        .tq-meta { margin-top: 12px; color: rgba(255,255,255,0.3); font-size: 0.75rem; }
        .tq-meta-input {
          width: 100%; max-width: 220px; margin: 0 auto 14px;
          border: 2px solid rgba(99,102,241,0.35); border-radius: 12px;
          padding: 9px 12px; background: rgba(255,255,255,0.08); color: white;
          text-align: center; font-size: 1rem; font-weight: 700; font-family: inherit;
        }
        .tq-meta-input:focus { outline: none; border-color: #818cf8; }

        .tq-ranking-box {
          margin-top: 14px; border-radius: 14px; padding: 12px;
          border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.04);
        }
        .tq-ranking-title { color: #fde68a; font-weight: 700; font-size: 0.82rem; margin-bottom: 8px; }
        .tq-ranking-empty { color: rgba(255,255,255,0.5); font-size: 0.78rem; }
        .tq-ranking-row {
          display: grid; grid-template-columns: 34px 1fr 42px 58px 38px;
          gap: 6px; align-items: center; color: rgba(255,255,255,0.86);
          background: rgba(255,255,255,0.05); border-radius: 10px; padding: 6px 8px;
          font-size: 0.72rem; font-weight: 600; margin-bottom: 6px;
        }
        .tq-ranking-row:last-child { margin-bottom: 0; }

        /* ---- Modal ---- */
        .tq-modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px;
        }
        .tq-modal {
          background: #1e1b4b; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px; padding: 24px 20px; width: 100%; max-width: 420px;
          max-height: 80vh; overflow-y: auto; color: white;
        }
        .tq-conquistas-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
        .tq-conquista-row {
          display: flex; align-items: center; gap: 10px; padding: 10px 12px;
          border-radius: 12px; background: rgba(255,255,255,0.04); opacity: 0.4;
        }
        .tq-conquista-row.unlocked {
          background: rgba(251,191,36,0.1); border: 1px solid rgba(251,191,36,0.3); opacity: 1;
        }

        /* ============ GAME SCREEN ============ */
        .tq-game {
          min-height: 100vh; min-height: 100dvh;
          background: linear-gradient(150deg, #0a0a1a 0%, #0f172a 40%, #1e1b4b 100%);
          display: flex; flex-direction: column; padding: 10px 78px 10px 12px;
        }
        .tq-trophy-rail {
          position: fixed; right: 10px; top: 84px; z-index: 900;
          width: 56px; border-radius: 14px; padding: 8px 6px;
          border: 1px solid rgba(255,255,255,0.14); background: rgba(10,10,26,0.75);
          backdrop-filter: blur(8px);
        }
        .tq-trophy-rail-title {
          color: rgba(255,255,255,0.7); font-size: 0.62rem;
          font-weight: 700; text-align: center; margin-bottom: 6px;
        }
        .tq-trophy-rail-list {
          display: flex; flex-direction: column; gap: 6px;
          max-height: calc(100dvh - 150px); overflow-y: auto;
        }
        .tq-trophy-chip {
          width: 100%; aspect-ratio: 1; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(251,191,36,0.18); border: 1px solid rgba(251,191,36,0.4);
          font-size: 1.2rem;
        }
        .tq-game-header { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 6px; }
        .tq-back-btn {
          background: rgba(255,255,255,0.1); border: none; border-radius: 10px;
          padding: 7px 13px; color: white; font-size: 1.1rem; cursor: pointer; font-family: inherit;
        }

        /* Progress */
        .tq-progress-bar {
          background: rgba(255,255,255,0.08); border-radius: 10px; height: 20px;
          overflow: hidden; position: relative; margin-bottom: 5px;
        }
        .tq-progress-fill {
          background: linear-gradient(90deg, #6366f1, #a855f7); height: 100%;
          border-radius: 10px; transition: width 0.3s ease;
        }
        .tq-progress-text {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
          color: white; font-size: 0.7rem; font-weight: 600; text-shadow: 0 1px 4px rgba(0,0,0,0.5);
        }

        /* Timer in-game */
        .tq-timer-track {
          background: rgba(255,255,255,0.08); border-radius: 4px; height: 5px;
          overflow: hidden; margin-bottom: 6px;
        }
        .tq-timer-track.urgent { background: rgba(244,63,94,0.2); }
        .tq-timer-fill-game {
          background: linear-gradient(90deg, #34d399, #059669); height: 100%;
          transition: width 0.1s linear; border-radius: 4px;
        }
        .tq-timer-track.urgent .tq-timer-fill-game { background: linear-gradient(90deg, #f43f5e, #fb923c); }

        /* Question card */
        .tq-question-card {
          background: rgba(255,255,255,0.95); border-radius: 22px;
          padding: 18px 16px; text-align: center; margin-bottom: 10px; flex-shrink: 0;
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        }
        .tq-combo {
          display: inline-block; padding: 4px 14px; border-radius: 20px;
          font-weight: 700; font-size: 0.85rem; margin-bottom: 6px;
        }
        .combo-2 { background: linear-gradient(135deg, #34d399, #059669); color: white; }
        .combo-3 { background: linear-gradient(135deg, #fbbf24, #d97706); color: #1a1a2e; }
        .combo-4, .combo-5 { background: linear-gradient(135deg, #f43f5e, #fb923c); color: white; }
        .tq-streak-inline { color: #6366f1; font-weight: 600; font-size: 0.82rem; margin-bottom: 6px; }

        .tq-question-text { font-size: 2.4rem; font-weight: 700; color: #1a1a2e; margin-bottom: 10px; line-height: 1.3; }
        .tq-question-text .op { color: #c4b5fd; margin: 0 8px; }
        .tq-question-text .highlight-red { color: #f43f5e; }
        .tq-question-text .highlight-green { color: #34d399; }
        .tq-hint { color: #a1a1aa; font-size: 0.78rem; margin-bottom: 10px; }

        .tq-input-card { max-width: 100%; }

        .tq-feedback { margin-top: 10px; padding: 10px 16px; border-radius: 12px; font-weight: 600; font-size: 0.9rem; }
        .tq-feedback.correto { background: linear-gradient(135deg, #34d399, #059669); color: white; }
        .tq-feedback.errado { background: linear-gradient(135deg, #f43f5e, #fb923c); color: white; }

        /* Completion */
        .tq-completion-card {
          background: rgba(255,255,255,0.06); backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 28px; padding: 32px 24px; text-align: center;
          width: 100%; max-width: 400px; color: white;
        }
        .tq-completion-stats { display: flex; justify-content: space-around; background: rgba(255,255,255,0.06); border-radius: 16px; padding: 16px; margin-bottom: 20px; }
        .tq-comp-stat { text-align: center; }
        .tq-comp-val { font-size: 1.8rem; font-weight: 800; }
        .tq-comp-val.green { color: #34d399; }
        .tq-comp-val.red { color: #f43f5e; }
        .tq-comp-val.blue { color: #818cf8; }
        .tq-comp-label { font-size: 0.75rem; color: rgba(255,255,255,0.5); }

        /* ============ MINIGAMES ============ */
        .tq-mini-center {
          flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
          text-align: center; padding: 20px;
        }
        .tq-mini-top {
          flex: 1; display: flex; flex-direction: column; align-items: center;
          padding: 16px 12px; text-align: center;
        }
        .tq-mini-title { font-family: 'Lilita One', cursive; font-size: 2rem; color: white; margin-bottom: 8px; letter-spacing: 1px; }
        .tq-mini-sub { color: rgba(255,255,255,0.6); font-size: 0.95rem; margin-bottom: 16px; }
        .tq-mini-howto {
          max-width: 340px; margin: -4px auto 12px; padding: 8px 12px;
          border-radius: 12px; font-size: 0.8rem; font-weight: 600;
          color: rgba(255,255,255,0.88); background: rgba(255,255,255,0.09);
          border: 1px solid rgba(255,255,255,0.14);
        }

        .tq-crazy-header { display: flex; justify-content: space-between; width: 100%; max-width: 340px; margin-bottom: 10px; gap: 8px; }

        /* Story card */
        .tq-story-card {
          background: rgba(255,255,255,0.95); border-radius: 20px; padding: 22px 18px;
          margin-bottom: 20px; max-width: 360px; font-size: 1.05rem; line-height: 1.6;
          color: #1a1a2e; box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        }

        .tq-feedback-box {
          background: rgba(255,255,255,0.95); border-radius: 16px; padding: 18px;
          max-width: 320px; font-weight: 600; color: #1a1a2e;
        }
        .tq-feedback-box.correto { border: 3px solid #34d399; }
        .tq-feedback-box.errado { border: 3px solid #f43f5e; }

        /* Alvo */
        .tq-alvo-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; width: 100%; max-width: 300px; }
        .tq-alvo-btn {
          padding: 20px; font-size: 1.5rem; font-weight: 700; font-family: inherit;
          border: none; border-radius: 16px; background: rgba(255,255,255,0.9); color: #1a1a2e;
          cursor: pointer; transition: all 0.2s;
        }
        .tq-alvo-btn:active { transform: scale(0.95); }
        .tq-alvo-btn.correta { background: #34d399; color: white; }
        .tq-alvo-btn.errada { background: #f43f5e; color: white; }

        /* Sequence */
        .tq-seq-row { display: flex; gap: 10px; margin-bottom: 24px; flex-wrap: wrap; justify-content: center; }
        .tq-seq-item {
          width: 52px; height: 52px; display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.9); border-radius: 14px;
          font-size: 1.2rem; font-weight: 700; color: #1a1a2e;
        }
        .tq-seq-item.missing { background: linear-gradient(135deg, #f43f5e, #fb923c); color: white; font-size: 1.4rem; }

        /* Boss */
        .tq-boss-area { display: flex; flex-direction: column; align-items: center; margin-bottom: 12px; }
        .tq-boss-sprite { transition: transform 0.1s; }
        .tq-boss-name { color: white; font-weight: 700; font-size: 1rem; margin: 6px 0; }
        .tq-hp-bar { width: 200px; height: 10px; background: rgba(255,255,255,0.15); border-radius: 5px; overflow: hidden; }
        .tq-hp-fill { height: 100%; border-radius: 5px; transition: width 0.3s ease; }
        .tq-dmg-number {
          position: absolute; top: -10px; right: -10px;
          color: #f43f5e; font-size: 1.5rem; font-weight: 800;
          animation: dmgFloat 0.8s ease-out forwards; pointer-events: none;
        }

        /* Meteor */
        .tq-meteor-field {
          width: 100%; max-width: 340px; height: 200px; position: relative;
          background: rgba(255,255,255,0.03); border-radius: 16px; overflow: hidden;
          margin-bottom: 16px; border: 1px solid rgba(255,255,255,0.06);
        }
        .tq-meteor {
          position: absolute; top: 0; text-align: center;
          animation: meteorFall 8s linear forwards;
        }
        .tq-meteor-emoji { font-size: 1.8rem; }
        .tq-meteor-label { color: white; font-size: 0.75rem; font-weight: 700; background: rgba(0,0,0,0.5); padding: 2px 6px; border-radius: 6px; }
        .tq-earth { position: absolute; bottom: 4px; left: 50%; transform: translateX(-50%); font-size: 2rem; }

        /* Memory */
        .tq-memory-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; width: 100%; max-width: 340px; }
        .tq-memory-card {
          aspect-ratio: 1; perspective: 600px; border: none; background: none;
          cursor: pointer; font-family: inherit;
        }
        .tq-memory-card-inner {
          position: relative; width: 100%; height: 100%; transition: transform 0.4s;
          transform-style: preserve-3d;
        }
        .tq-memory-card.flipped .tq-memory-card-inner,
        .tq-memory-card.matched .tq-memory-card-inner { transform: rotateY(180deg); }
        .tq-memory-front, .tq-memory-back {
          position: absolute; inset: 0; border-radius: 12px; display: flex;
          align-items: center; justify-content: center; backface-visibility: hidden;
          font-weight: 700; font-size: 1rem;
        }
        .tq-memory-front {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white; font-size: 1.5rem;
        }
        .tq-memory-back {
          background: rgba(255,255,255,0.92); color: #1a1a2e; transform: rotateY(180deg);
          font-size: 0.85rem; padding: 4px;
        }
        .tq-memory-card.matched .tq-memory-back { background: #34d399; color: white; }

        /* ---- Responsivity ---- */
        @media (max-height: 700px) {
          .tq-mascote-emoji { font-size: 1.8rem; }
          .tq-question-text { font-size: 2rem; }
          .tq-input-card { padding: 10px; font-size: 1.6rem; }
          .tq-tecla { height: 44px; font-size: 1.1rem; }
          .tq-tecla-confirmar { height: 42px; font-size: 0.95rem; }
        }
        @media (max-width: 360px) {
          .tq-home-card { padding: 20px 16px; }
          .tq-title { font-size: 1.6rem; }
          .tq-question-text { font-size: 1.8rem; }
          .tq-teclado { max-width: 260px; }
        }
        @media (max-width: 900px) {
          .tq-game { padding-right: 12px; padding-bottom: 76px; }
          .tq-trophy-rail {
            top: auto; right: 10px; left: 10px; bottom: 10px; width: auto;
          }
          .tq-trophy-rail-list {
            flex-direction: row; max-height: none; overflow-x: auto; overflow-y: hidden;
          }
          .tq-trophy-chip { width: 42px; min-width: 42px; }
        }
      `}</style>

      {tela === 'inicial' ? (
        <TelaInicial
          onIniciar={iniciarJogo} licoesCompletas={licoesCompletas}
          pontuacaoTotal={pontuacaoTotal} conquistasDesbloqueadas={conquistasDesbloqueadas}
          streak={streak} rankingCorridas={rankingCorridas}
        />
      ) : (
        <TelaJogo
          tabuadas={tabuadasSelecionadas} modoTempo={modoTempo} metaAcertos={metaAcertos}
          onVoltar={voltarInicio} onLicaoCompleta={completarLicao}
          conquistasDesbloqueadas={conquistasDesbloqueadas} onNovaConquista={adicionarConquista}
          xpTotal={pontuacaoTotal}
        />
      )}
    </>
  );
}

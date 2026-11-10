// Original synthesized ambience. No recording or external music is copied.
//已全部更新
const midi = (n) => 440 * 2 ** ((n - 69) / 12);

// 每个主题：根音、速度、五声音阶、4 小节和弦进行
const THEMES = {
  forest: {
    root: 60,
    bpm: 72,
    scale: [0, 2, 4, 7, 9],
    prog: [[0, 4, 7], [-3, 0, 4], [-7, -3, 0], [-5, -1, 2]],
  },
  desert: {
    root: 62,
    bpm: 64,
    scale: [0, 3, 5, 7, 10],
    prog: [[0, 3, 7], [-4, 0, 3], [-2, 2, 5], [-5, -2, 2]],
  },
  ocean: {
    root: 59,
    bpm: 58,
    scale: [0, 2, 4, 7, 9],
    prog: [[0, 4, 7, 11], [-4, 0, 3, 7], [-7, -3, 0], [-5, -1, 2]],
  },
};

export class ForestAudio {
  constructor() {
    this.enabled = false;
    this.night = false;
    this.theme = "forest";
    this.context = null;
    this.timer = null;
    this.step_ = 0; // 节拍计数（避免与 step() 脚步声重名）
    this.nextTime = 0;
  }

  async toggle() {
    if (this.enabled) {
      this.stop();
      return false;
    }
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) throw new Error("Web Audio unavailable");
    this.context ??= new AudioCtx();
    await this.context.resume();
    const c = this.context;
    this.enabled = true;

    // 总音量淡入
    this.master = c.createGain();
    this.master.gain.setValueAtTime(0, c.currentTime);
    this.master.gain.linearRampToValueAtTime(0.5, c.currentTime + 1.5);
    this.master.connect(c.destination);

    // 低通让音色更圆润
    this.lp = c.createBiquadFilter();
    this.lp.type = "lowpass";
    this.lp.frequency.value = 2200;
    this.bus = c.createGain();
    this.bus.connect(this.lp);
    this.lp.connect(this.master);

    // 回声：营造空旷、梦幻的空间感
    this.delay = c.createDelay(1);
    this.delay.delayTime.value = 0.38;
    this.fb = c.createGain();
    this.fb.gain.value = 0.35;
    this.wet = c.createGain();
    this.wet.gain.value = 0.4;
    this.lp.connect(this.delay);
    this.delay.connect(this.fb);
    this.fb.connect(this.delay);
    this.delay.connect(this.wet);
    this.wet.connect(this.master);

    this.step_ = 0;
    this.nextTime = c.currentTime + 0.15;
    this.timer = setInterval(() => this.tick(), 100);
    return true;
  }

  // 通用音符：柔和起音 + 指数衰减
  tone(freq, t, dur, vol, type = "sine", dest = this.bus) {
    const c = this.context;
    const o = c.createOscillator(),
      g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(dest);
    o.start(t);
    o.stop(t + dur + 0.05);
    o.onended = () => {
      o.disconnect();
      g.disconnect();
    };
  }

  // 缓起缓落的和弦铺底
  pad(freq, t, dur, vol) {
    const c = this.context;
    const o = c.createOscillator(),
      g = c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + dur * 0.4);
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(this.bus);
    o.start(t);
    o.stop(t + dur + 0.05);
    o.onended = () => {
      o.disconnect();
      g.disconnect();
    };
  }

  // 排一个八分音符
  scheduleStep(t) {
    const th = THEMES[this.theme];
    const eighth = 60 / th.bpm / 2;
    const chord = th.prog[Math.floor(this.step_ / 8) % th.prog.length];
    const pos = this.step_ % 8;
    const shift = this.night ? -12 : 0; // 夜晚整体低八度、更沉静
    const calm = this.night ? 0.7 : 1;

    // 每小节开头：和弦铺底
    if (pos === 0)
      chord.forEach((n) =>
        this.pad(midi(th.root - 12 + n + shift), t, eighth * 8, 0.035 * calm),
      );

    // 低音：每小节第 1、3 拍
    if (pos === 0 || pos === 4)
      this.tone(
        midi(th.root - 24 + chord[0] + shift),
        t,
        eighth * 3,
        0.08 * calm,
        "triangle",
      );

    // 琶音：轻轻流动
    if (pos % 2 === 0 || Math.random() < 0.25)
      this.tone(
        midi(th.root + chord[((pos / 2) | 0) % chord.length] + shift),
        t,
        eighth * 2.5,
        0.05 * calm,
        "triangle",
      );

    // 稀疏的“音乐盒”旋律（五声音阶，怎么随机都不会难听）
    if (Math.random() < 0.22) {
      const n = th.scale[Math.floor(Math.random() * th.scale.length)];
      this.tone(
        midi(th.root + 12 + n + shift),
        t,
        eighth * 4,
        0.045 * calm,
        "sine",
      );
    }
    this.step_++;
  }

  // 提前 0.3 秒排程，节奏比 setInterval 直接发声稳得多
  tick() {
    if (!this.enabled || document.hidden) {
      // 后台时不堆积音符，回来后从当前时间接上
      if (this.context)
        this.nextTime = Math.max(this.nextTime, this.context.currentTime);
      return;
    }
    const c = this.context;
    while (this.nextTime < c.currentTime + 0.3) {
      this.scheduleStep(this.nextTime);
      this.nextTime += 60 / THEMES[this.theme].bpm / 2;
    }
  }

    // 柔和的脚步声（略带随机音高，避免机械重复）
  step() {
    if (!this.enabled || !this.context || !this.master) return;
    const c = this.context,
      t = c.currentTime;

    // 主体：低频"咚"
    const osc = c.createOscillator(),
      gain = c.createGain();
    const base = 150 + Math.random() * 30;
    osc.type = "triangle";
    osc.frequency.setValueAtTime(base, t);
    osc.frequency.exponentialRampToValueAtTime(base * 0.55, t + 0.12);
    gain.gain.setValueAtTime(0.1, t); // ← 音量：0.04 → 0.1
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t);
    osc.stop(t + 0.15);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };

    // 点缀：很短的高频"嗒"，让小喇叭/手机也听得清
    const click = c.createOscillator(),
      cg = c.createGain();
    click.type = "sine";
    click.frequency.setValueAtTime(700 + Math.random() * 150, t);
    click.frequency.exponentialRampToValueAtTime(300, t + 0.04);
    cg.gain.setValueAtTime(0.03, t);
    cg.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    click.connect(cg);
    cg.connect(this.master);
    click.start(t);
    click.stop(t + 0.06);
    click.onended = () => {
      click.disconnect();
      cg.disconnect();
    };
  }

  // 到达地点的两音小提示，走混响通道更好听
  arrival(index = 0) {
    if (!this.enabled || !this.context || !this.master) return;
    const notes = [
      [659.25, 783.99],
      [587.33, 698.46],
      [523.25, 659.25],
    ];
    const melody = notes[index % notes.length];
    melody.forEach((f, i) =>
      this.tone(
        f,
        this.context.currentTime + i * 0.16,
        0.9,
        0.07,
        "sine",
        this.bus,
      ),
    );
  }

  stop() {
    if (!this.context || !this.enabled) return;
    this.enabled = false;
    clearInterval(this.timer);
    const c = this.context;
    this.master.gain.cancelScheduledValues(c.currentTime);
    this.master.gain.setTargetAtTime(0, c.currentTime, 0.12);
    const nodes = [
      this.master,
      this.bus,
      this.lp,
      this.delay,
      this.fb,
      this.wet,
    ];
    setTimeout(() => nodes.forEach((n) => n.disconnect()), 800);
  }

  setNight(night) {
    this.night = night;
  }

  setTheme(id) {
    if (THEMES[id]) this.theme = id;
  }
}
